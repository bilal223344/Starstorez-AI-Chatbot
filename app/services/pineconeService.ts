import { ShopifyProductNode } from "./productService";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

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
                    console.error("    Skipping malformed product:", product.id);
                    return null;
                }
            }).filter(item => item !== null) as { textToEmbed: string, metadata: any }[];

            if (preparedData.length === 0) continue;

            // B. Generate Embeddings
            const texts = preparedData.map(p => p.textToEmbed);
            const vectors = await generateEmbeddings(texts);

            // C. Map Vectors to Metadata
            const pineconeRecords = preparedData.map((item, index) => ({
                id: `shopify_${item.metadata.product_id.split("/").pop()}`,
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
        const data = await res.json();
        const exists = data.namespaces?.some((n: any) => n.name === shopUrl);
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

const generateEmbeddings = async (texts: string[]) => {
    try {
        const response = await fetch("https://api.pinecone.io/embed", {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({
                model: "llama-text-embed-v2",
                parameters: { input_type: "passage", truncate: "END" },
                inputs: texts.map(text => ({ text: text }))
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(JSON.stringify(err));
        }

        const data = await response.json();
        return data.data.map((item: any) => item.values);
    } catch (error) {
        console.error("Embedding generation failed:", error);
        throw error;
    }
};

const upsertVectors = async (namespace: string, records: any[]) => {
    // Sanitizer: Converts complex objects to JSON strings
    const sanitizeMetadata = (meta: any) => {
        const clean: any = {};
        for (const [key, value] of Object.entries(meta)) {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                    clean[key] = value;
                } else {
                    clean[key] = JSON.stringify(value);
                }
            } else {
                clean[key] = value;
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
    const flattenedVariants = product.variants.edges.map(e => ({
        id: e.node.id,
        title: e.node.title,
        price: e.node.price,
        sku: e.node.sku,
        inventoryQuantity: e.node.inventoryQuantity,
        image: e.node.image?.url || "",
        selectedOptions: e.node.selectedOptions
    }));

    const collectionTitles = product.collections.edges.map(e => e.node.title);

    // Price & Stock Logic
    const prices = flattenedVariants.map(v => parseFloat(v.price));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const priceDisplay = minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;

    const totalInv = flattenedVariants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    const status = totalInv > 0 ? "instock" : "outofstock";

    // Text Context
    const textToEmbed = `
        Product: ${product.title}
        Vendor: ${product.vendor}
        Type: ${product.productType}
        Description: ${product.description}
        Tags: ${product.tags.join(", ")}
        Collections: ${collectionTitles.join(", ")}
        Price: ${priceDisplay}
        In Stock: ${status}
    `.trim().replace(/\s+/g, " ");

    // Metadata
    const metadata = {
        type: "PRODUCT",
        product_id: product.id,
        title: product.title,
        vendor: product.vendor,
        productType: product.productType,
        handle: product.handle,
        image: product.featuredImage?.url || "",
        price: priceDisplay,
        inventory_status: status,
        collections: collectionTitles,
        tags: product.tags,
        options: JSON.stringify(product.options),
        variants: JSON.stringify(flattenedVariants)
    };

    return { textToEmbed, metadata };
};