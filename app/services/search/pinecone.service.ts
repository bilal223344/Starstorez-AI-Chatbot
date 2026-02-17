import { generateEmbeddings } from "app/services/pineconeService";
import { PineconeMatch } from "app/types/chat.types";
import prisma from "app/db.server";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

interface SearchDebug {
    query: string;
    pineconeMatches: number;
    droppedCount: number;
}

/**
 * Advanced Product Search using Pinecone + Metadata Filtering
 */
export async function searchPinecone(
    shop: string,
    query: string,
    minPrice?: number,
    maxPrice?: number,
    sort: "price_asc" | "price_desc" | "relevance" | "newest" | "best_selling" = "relevance", // Default to relevance
    boostAttribute?: string
): Promise<{ matches: PineconeMatch[]; debug: SearchDebug }> {

    const debug: SearchDebug = { query, pineconeMatches: 0, droppedCount: 0 };

    try {
        // 0. HANDLE SPECIAL SORTS (Prisma Direct)
        // For "newest" and "best_selling", vector search is often overkill or inaccurate for ordering.
        // We use direct DB queries for these, optionally filtering by text if a query exists.

        if (sort === "newest") {
             const products = await prisma.product.findMany({
                where: {
                    shop,
                    title: query ? { contains: query, mode: "insensitive" } : undefined,
                    price: {
                        gte: minPrice,
                        lte: maxPrice
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 10
             });

             const matches: PineconeMatch[] = products.map(p => ({
                 id: p.prodId,
                 score: 1.0, 
                 metadata: {
                     product_id: p.prodId,
                     title: p.title,
                     price: p.price,
                     price_val: p.price,
                     handle: p.handle || "",
                     image: p.image || "",
                     description: p.description || "",
                     inventory_status: p.stock > 0 ? "in_stock" : "out_of_stock",
                     product_type: "Product",
                     vendor: "Store"
                 }
             }));
             return { matches: matches.map(m => ({ ...m, score: 1.0 })), debug };
        }

        if (sort === "best_selling") {
            try {
                // Find top selling products by aggregating OrderItem
                // Relation filtering in groupBy can be tricky, so we fetch Order IDs first
                const orders = await prisma.order.findMany({
                    where: { Customer: { shop } },
                    select: { id: true }
                });
                
                if (orders.length === 0) {
                     return searchPinecone(shop, query, minPrice, maxPrice, "newest", boostAttribute);
                }

                const orderIds = orders.map(o => o.id);

                const topItems = await prisma.orderItem.groupBy({
                    by: ['productId'],
                    _sum: { quantity: true },
                    orderBy: { _sum: { quantity: 'desc' } },
                    take: 10,
                    where: {
                        orderId: { in: orderIds }
                    }
                });
                
                // If no orders, fallback to newest
                if (topItems.length === 0) {
                     return searchPinecone(shop, query, minPrice, maxPrice, "newest", boostAttribute);
                }

                const productIds = topItems.map(item => item.productId);
                
                const products = await prisma.product.findMany({
                    where: {
                        shop,
                        prodId: { in: productIds } 
                    }
                });

                // Re-sort/Map (Handle undefined _sum safely)
                const sortedProducts = products.sort((a, b) => {
                    const aItem = topItems.find(i => i.productId === a.prodId);
                    const bItem = topItems.find(i => i.productId === b.prodId);
                    const aSales = aItem?._sum?.quantity ?? 0;
                    const bSales = bItem?._sum?.quantity ?? 0;
                    return bSales - aSales;
                });

                const matches: PineconeMatch[] = sortedProducts.map(p => ({
                     id: p.prodId,
                     score: 1.0, 
                     metadata: {
                         product_id: p.prodId,
                         title: p.title,
                         price: p.price,
                         price_val: p.price,
                         handle: p.handle || "",
                         image: p.image || "",
                         description: p.description || "",
                         inventory_status: p.stock > 0 ? "in_stock" : "out_of_stock",
                         product_type: "Product",
                         vendor: "Store"
                     }
                 }));
                 return { matches, debug };

            } catch (e) {
                console.error("Best selling sort error, falling back to Pinecone", e);
                // Fallthrough to normal search
            }
        }


        // 1. Generate Embedding
        const embeddings = await generateEmbeddings([query]);
        if (!embeddings || embeddings.length === 0) return { matches: [], debug };

        const vector = embeddings[0];
        const namespace = shop.replace(/\./g, "_");

        // 2. Build Pinecone Filter
        // We filter by type "PRODUCT" at the database level to reduce noise
        const filter: Record<string, any> = {};

        // Note: Pinecone metadata filtering for numbers can be tricky if not indexed correctly.
        // We generally filter strict ranges in memory if the index isn't set up for it, 
        // but let's try to add basic bounds if possible, or leave it to post-processing 
        // to be 100% sure we don't miss items due to index schema mismatches.
        // For now, we'll rely on post-processing for price accuracy.

        // 3. Query Pinecone
        // Fetch more candidates if we need to sort by price (to get a good pool)
        const fetchLimit = (sort === "price_asc" || sort === "price_desc") ? 100 : 50;

        const response = await fetch(`https://${INDEX_HOST}/query`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10", // Use latest consistent version
            },
            body: JSON.stringify({
                namespace,
                vector,
                topK: fetchLimit,
                includeMetadata: true,
                filter,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinecone API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        let matches = (data.matches || []) as PineconeMatch[];
        debug.pineconeMatches = matches.length;

        console.log(`[Search] Namespace: ${namespace}, Matches: ${matches.length}`);

        // 4. Post-Processing: Filter & Rank
        matches = filterAndRankMatches(matches, {
            query,
            minPrice,
            maxPrice,
            sort,
            boostAttribute
        }, debug);

        // 5. Return Top Results (Slice to top 6 for UI)
        return { matches: matches.slice(0, 6), debug };

    } catch (error) {
        console.error("[Search Service] Error:", error);
        return { matches: [], debug };
    }
}

/**
 * Pure function to handle in-memory filtering, scoring, and sorting.
 */
function filterAndRankMatches(
    matches: PineconeMatch[],
    criteria: {
        query: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
        boostAttribute?: string;
    },
    debug: SearchDebug
): PineconeMatch[] {
    const lowerQuery = criteria.query.toLowerCase().trim();
    const lowerBoost = criteria.boostAttribute?.toLowerCase().trim();

    // Detect generic queries where we should be more lenient
    const isGeneric = ["products", "items", "shop", "collection", "best selling", "recommended"].some(t => lowerQuery.includes(t));

    // A. Filter & Score
    const filtered = matches.filter(m => {
        if (!m.metadata) return false;

        // Parse Price (Handle potential string formatting)
        const priceVal = m.metadata.price_val !== undefined ? m.metadata.price_val : m.metadata.price;
        const price = parseFloat(String(priceVal || "0").replace(/[^0-9.]/g, ""));

        m.metadata.real_price = price; // Store for sorting

        // 1. Price Filter (Strict)
        if (criteria.minPrice !== undefined && price < criteria.minPrice) return false;
        if (criteria.maxPrice !== undefined && price > criteria.maxPrice) return false;

        // 2. Scoring Boosts
        let bonus = 0;
        const description = String(m.metadata.description || "").toLowerCase();
        const title = String(m.metadata.title || "").toLowerCase();
        const tags = Array.isArray(m.metadata.tags) ? m.metadata.tags.join(" ").toLowerCase() : "";
        const handle = String(m.metadata.handle || "").toLowerCase();

        const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
        let hasKeywordMatch = false;

        // A. Exact Name Match (Highest Priority)
        if (title === lowerQuery || handle === lowerQuery) {
            bonus += 10.0;
            hasKeywordMatch = true;
        }
        // B. Strong Containment (User query is fully inside title)
        else if (title.includes(lowerQuery)) {
            bonus += 2.0;
            hasKeywordMatch = true;
        }
        // C. Word-based Match (At least one significant word present in Title, Tags, OR Description)
        else {
            if (queryWords.length > 0 && queryWords.some(w => title.includes(w) || tags.includes(w) || description.includes(w))) {
                bonus += 1.0;
                hasKeywordMatch = true;
            }
        }

        // D. Attribute Boost (e.g., "Blue", "Wooden")
        if (lowerBoost) {
            if (title.includes(lowerBoost) || tags.includes(lowerBoost)) {
                bonus += 0.5;
            }
        }

        // 3. Strict Relevance Check for Sorted Queries
        // If sorting by Price, we MUST ensure the item is actually relevant.
        // We now REQUIRE a keyword match. Vector score alone is not trusted for "Specific Item + Sort" queries
        // because commonly everything matches "product" vaguely.
        if ((criteria.sort === "price_asc" || criteria.sort === "price_desc") && !isGeneric) {
            if (!hasKeywordMatch) {
                debug.droppedCount++;
                return false;
            }
        }

        m.score = (m.score || 0) + bonus;

        return true;
    });

    // B. Sort
    if (criteria.sort === "price_asc") {
        return filtered.sort((a, b) => (a.metadata.real_price as number) - (b.metadata.real_price as number));
    }
    if (criteria.sort === "price_desc") {
        return filtered.sort((a, b) => (b.metadata.real_price as number) - (a.metadata.real_price as number));
    }

    // Default: Sort by Relevance (Score)
    return filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
}