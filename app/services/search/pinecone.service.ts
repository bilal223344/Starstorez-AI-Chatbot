import { generateEmbeddings } from "app/services/pineconeService";
import { PineconeMatch } from "app/types/chat.types";

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
    sort: "price_asc" | "price_desc" | "relevance" = "relevance", // Default to relevance
    boostAttribute?: string
): Promise<{ matches: PineconeMatch[]; debug: SearchDebug }> {

    const debug: SearchDebug = { query, pineconeMatches: 0, droppedCount: 0 };

    try {
        // 1. Generate Embedding
        const embeddings = await generateEmbeddings([query]);
        if (!embeddings || embeddings.length === 0) return { matches: [], debug };

        const vector = embeddings[0];
        const namespace = shop.replace(/\./g, "_");

        // 2. Build Pinecone Filter
        // We filter by type "PRODUCT" at the database level to reduce noise
        const filter: any = {};

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