// app/services/search/pinecone.service.ts
import { generateEmbeddings } from "app/services/pineconeService"; // Assuming this utility exists
import { PineconeMatch } from "app/types/chat.types";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

interface SearchDebug {
    query: string;
    pineconeMatches: number;
    droppedCount: number;
}

export async function searchPinecone(
    shop: string,
    query: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: "price_asc" | "price_desc" | "relevance",
    boostAttribute?: string
): Promise<{ matches: PineconeMatch[]; debug: SearchDebug }> {

    const debug: SearchDebug = { query, pineconeMatches: 0, droppedCount: 0 };

    try {
        // 1. Prepare Vector
        const embedding = await generateEmbeddings([query]);
        if (!embedding || embedding.length === 0) return { matches: [], debug };

        const namespace = shop.replace(/\./g, "_");
        const fetchLimit = (sort === "price_asc" || sort === "price_desc") ? 100 : 50;

        // 2. Fetch Candidates from Pinecone
        const response = await fetch(`https://${INDEX_HOST}/query`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10",
            },
            body: JSON.stringify({
                namespace,
                vector: embedding[0],
                topK: fetchLimit,
                includeMetadata: true,
            }),
        });

        if (!response.ok) throw new Error(`Pinecone API Error: ${response.statusText}`);

        const data = await response.json();
        let matches = (data.matches || []) as PineconeMatch[];
        debug.pineconeMatches = matches.length;

        // 3. Post-Processing: Filtering & Re-Ranking
        matches = filterAndRankMatches(matches, {
            query,
            minPrice,
            maxPrice,
            sort,
            boostAttribute
        }, debug);

        // 4. Return Top Results
        return { matches: matches.slice(0, 6), debug };

    } catch (error) {
        console.error("[Search-Service] Error:", error);
        return { matches: [], debug };
    }
}

/**
 * Helper: Pure function to handle filtering logic.
 * Keeps the main async function clean.
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
    const isGeneric = ["products", "items", "shop", "collection"].some(t => lowerQuery.includes(t));

    // A. Filter & Score
    const filtered = matches.filter(m => {
        if (!m.metadata) return false;

        // Price Clean
        const price = parseFloat(String(m.metadata.price || "0").replace(/[^0-9.]/g, ""));
        m.metadata.real_price = price; // Store for sorting

        // Price Filter
        if (criteria.minPrice !== undefined && price < criteria.minPrice) return false;
        if (criteria.maxPrice !== undefined && price > criteria.maxPrice) return false;

        // Calculate Hybrid Score
        let bonus = 0;
        const title = (m.metadata.title as string).toLowerCase();

        // Exact Match Boost
        if (title.includes(lowerQuery)) bonus += 0.25;

        // Attribute Boost (e.g. "Blue")
        if (lowerBoost && JSON.stringify(m.metadata).toLowerCase().includes(lowerBoost)) {
            bonus += 0.30;
        }

        m.score = (m.score || 0) + bonus;

        // Threshold Check
        let threshold = 0.40;
        if (bonus > 0) threshold = 0.20; // Lower threshold if keyword matches
        if (isGeneric) threshold = 0.10; // Lower threshold if generic query

        if (m.score < threshold) {
            debug.droppedCount++;
            return false;
        }
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
    return filtered.sort((a, b) => b.score - a.score);
}