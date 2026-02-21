import { PineconeEmbedResponse, PineconeMetadata, PineconeNamespaceResponse, PineconeRecord, RawMetadata, FormattedOrderData, ShopifyProductNode, VectorData } from "app/types";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = (process.env.INDEX_HOST || "").replace(/^https?:\/\//, "");

// ============================================================================
// MAIN EXPORTS
// ============================================================================

/**
 * Main Worker: Takes raw products, converts them to vectors, and uploads them in batches.
 */
export const batchProcessPinecone = async (namespace: string, products: ShopifyProductNode[]) => {
    let totalUpserted = 0;
    const CHUNK_SIZE = 50;

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
        const batch = products.slice(i, i + CHUNK_SIZE);

        try {
            // A. Prepare Data
            const preparedData = batch.map(product => {
                try {
                    return prepareProductForPinecone(product);
                } catch (e) {
                    console.error("Skipping malformed product:", product.id);
                    return null;
                }
            }).filter(item => item !== null) as { textToEmbed: string, metadata: RawMetadata }[];

            if (preparedData.length === 0) continue;

            // B. Generate Embeddings
            const texts = preparedData.map(p => p.textToEmbed);
            const vectors = await generateEmbeddings(texts);

            // C. Map Vectors to Metadata
            const pineconeRecords: PineconeRecord[] = preparedData.map((item, index) => ({
                id: `shopify_${(item.metadata.product_id as string).split("/").pop()}`,
                values: vectors[index],
                metadata: item.metadata
            }));

            // D. Upsert
            await upsertVectors(namespace, pineconeRecords);

            totalUpserted += pineconeRecords.length;
            console.log(`    Pinecone Sync: ${totalUpserted} / ${products.length} processed.`);

        } catch (error) {
            console.error(`    [Pinecone Error] Batch failed at index ${i}:`, error);
        }
    }

    return totalUpserted;
};

export const checkPineconeNamespace = async (shop: string) => {
    const shopUrl = shop.replace(/\./g, "_");
    try {
        const url = `https://${INDEX_HOST}/namespaces?prefix=${shopUrl}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Api-Key': PINECONE_API_KEY,
                'X-Pinecone-Api-Version': '2025-10'
            }
        });

        if (!res.ok) return { success: false };
        const data = await res.json() as PineconeNamespaceResponse;
        const exists = data.namespaces?.some((n) => n.name === shopUrl);
        return { success: exists, pcNamespace: exists ? shopUrl : null };
    } catch (error) {
        return { success: false };
    }
};

export const createPineconeNamespace = async (shop: string) => {
    const namespaceUrl = shop.replace(/\./g, "_");
    try {
        const res = await fetch(`https://${INDEX_HOST}/namespaces`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Api-Key': PINECONE_API_KEY,
                'X-Pinecone-Api-Version': '2025-10'
            },
            body: JSON.stringify({
                name: namespaceUrl,
                schema: {
                    fields: {
                        document_id: { filterable: true },
                        document_title: { filterable: true },
                        document_url: { filterable: true },
                        created_at: { filterable: true }
                    }
                }
            })
        });

        if (!res.ok && res.status !== 409) {
            const err = await res.json();
            throw new Error(JSON.stringify(err));
        }

        return { success: true, pcNamespace: namespaceUrl };
    } catch (error) {
        console.error("Namespace creation failed:", error);
        return null;
    }
};

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

export const generateEmbeddings = async (texts: string[]) => {
    try {
        const response = await fetch("https://api.pinecone.io/embed", {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({
                // "multilingual-e5-large" is generally better/standard,
                // but "llama-text-embed-v2" is fine if you specifically prefer it.
                model: "multilingual-e5-large",
                parameters: { input_type: "passage", truncate: "END" },
                inputs: texts.map(text => ({ text: text }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinecone Embed Error (${response.status}): ${errorText}`);
        }

        const data = await response.json() as PineconeEmbedResponse;
        return data.data.map((item) => item.values);
    } catch (error) {
        console.error("Embedding generation failed:", error);
        throw error;
    }
};

export const upsertVectors = async (namespace: string, records: PineconeRecord[]) => {
    // Sanitizer: Converts complex objects to JSON strings
    const sanitizeMetadata = (meta: RawMetadata): PineconeMetadata => {
        const clean: PineconeMetadata = {};
        for (const [key, value] of Object.entries(meta)) {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                    clean[key] = value;
                } else {
                    clean[key] = JSON.stringify(value);
                }
            } else {
                clean[key] = value as string | number | boolean;
            }
        }
        return clean;
    };

    const cleanRecords = records.map(r => ({
        id: r.id,
        values: r.values,
        metadata: sanitizeMetadata(r.metadata)
    }));

    try {
        const res = await fetch(`https://${INDEX_HOST}/vectors/upsert`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({ namespace, vectors: cleanRecords })
        });

        if (!res.ok) {
            console.error("Upsert failed:", await res.text());
        }
    } catch (e) {
        console.error("Upsert network error:", e);
    }
};

const prepareProductForPinecone = (product: ShopifyProductNode) => {
    // 1. Extract Variant Data
    const flattenedVariants = product.variants.edges.map(e => ({
        title: e.node.title,
        price: e.node.price,
        sku: e.node.sku,
        inventoryQuantity: e.node.inventoryQuantity,
        selectedOptions: e.node.selectedOptions
    }));

    const collectionTitles = product.collections.edges.map(e => e.node.title);

    // 2. Price Logic (Get Min/Max for display and filtering)
    const prices = flattenedVariants.map(v => parseFloat(v.price));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const priceDisplay = minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;

    // 3. Stock Status
    const totalStock = flattenedVariants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    const status = totalStock > 0 ? "instock" : "outofstock";

    // 4. RICH TEXT EMBEDDING (CRITICAL IMPROVEMENT)
    const textToEmbed = `
       ${product.title} ${product.description} ${product.tags.join(", ")} ${collectionTitles.join(", ")} ${status}
    `.trim().replace(/\s+/g, " ");

    // Metadata
    const metadata = {
        type: "PRODUCT",
        product_id: product.id,
        title: product.title,
        image: product.featuredImage?.url,
        vendor: product.vendor,
        handle: product.handle,
        price_val: minPrice,
        collections: collectionTitles,
        tags: product.tags,
        options: JSON.stringify(product.options),
    };

    return { textToEmbed, metadata };
};


export const deleteVectorFromPinecone = async (namespace: string, vectorId: string) => {
    try {
        const response = await fetch(`https://${INDEX_HOST}/vectors/delete`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({
                namespace: namespace,
                ids: [vectorId]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[Pinecone Delete Error]", err);
        } else {
            console.log(`[Pinecone] Deleted vector ${vectorId}`);
        }
    } catch (error) {
        console.error("[Pinecone Network Error]", error);
    }
};

export const prepareOrderForPinecone = (order: FormattedOrderData): VectorData => {
    // order argument is the formatted data directly

    const itemNames = order.items.create.map((i) => `${i.quantity}x ${i.productName}`).join(", ");

    // 1. Text Context: This is what the AI searches against
    const textToEmbed = `
        Order Number: ${order.orderNumber}
        Status: ${order.status}
        Items: ${itemNames}
        Total: ${order.totalPrice}
        Date: ${order.createdAt.toISOString()}
    `.trim().replace(/\s+/g, " ");

    // 2. Metadata: CRITICAL for filtering
    // We use order._customerPayload.id (The Shopify ID) so the Chatbot knows who owns this order
    const metadata = {
        type: "ORDER",
        order_id: order.shopifyId, // External ID
        internal_user_id: order._customerPayload?.id || "unknown", // Internal UUID for filtering
        order_number: order.orderNumber,
        status: order.status,
        text_content: textToEmbed // Store text so AI can read it without hitting DB again
    };

    return { textToEmbed, metadata };
};