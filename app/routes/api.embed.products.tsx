import { authenticate } from "app/shopify.server";
import { shopifyGraphqlRequest, sleep } from "app/utils/extra";
import { LoaderFunctionArgs } from "react-router";

import {
    formatShopifyProduct,
    saveProductToDB,
    ShopifyProductNode
} from "app/services/productService";

import {
    checkPineconeNamespace,
    createPineconeNamespace,
    batchProcessPinecone
} from "app/services/pineconeService";

// ============================================================================
// TYPES
// ============================================================================

interface ShopifyProductsResponse {
    products: {
        edges: { node: ShopifyProductNode }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
}

// ============================================================================
// 3. MAIN LOADER (The API Trigger)
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // 1. Authenticate Request
    const { session, admin } = await authenticate.admin(request);

    // 2. Run the Job
    const result = await embedProduct(session.shop, session.accessToken!);

    // 3. Return Response
    return {
        session,
        admin,
        jobResult: result
    };
};

// ============================================================================
// 2. THE JOB FUNCTION (Reusable Logic)
// ============================================================================

/**
 * This is the main "Job" function. 
 * You can call this from a Loader, a Cron Job, or a Queue Worker.
 */
export const embedProduct = async (shop: string, accessToken: string) => {

    const allProducts = await syncAndSaveProducts(shop, accessToken);

    if (allProducts.length === 0) {
        console.log("No products found to sync.");
        return { status: "success", count: 0, message: "No products found" };
    }

    // --- STEP 2: SETUP PINECONE NAMESPACE ---

    const namespaceCheck = await checkPineconeNamespace(shop);
    let targetNamespace = namespaceCheck.pcNamespace;

    // Create namespace if it doesn't exist
    if (!targetNamespace) {
        const creation = await createPineconeNamespace(shop);
        targetNamespace = creation?.pcNamespace;
    }

    if (!targetNamespace) {
        console.error("[CRITICAL] Could not define a namespace. Aborting Pinecone sync.");
        return { status: "error", count: 0, message: "Namespace creation failed" };
    }

    // --- STEP 3: EMBED & UPLOAD TO PINECONE ---
    const processedCount = await batchProcessPinecone(targetNamespace, allProducts);

    console.log(`[JOB COMPLETE] Finished.`);
    console.log(`    - Local DB Saved: ${allProducts.length}`);
    console.log(`    - Pinecone Vectors: ${processedCount}`);

    return {
        status: "success",
        shopifyCount: allProducts.length,
        pineconeCount: processedCount
    };
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Syncs Shopify -> Local DB
 * Returns an array of products to be passed to Pinecone later.
 */
const syncAndSaveProducts = async (shop: string, accessToken: string): Promise<ShopifyProductNode[]> => {
    const query = `
        query ($first: Int, $after: String){
            products(first: $first, after: $after) {
                edges {
                    node {
                        id title description vendor productType handle tags createdAt updatedAt
                        featuredImage { url }
                        options { name values }
                        collections(first: 5) { edges { node { title } } }
                        variants(first: 50) {
                            edges {
                                node {
                                    id title price sku inventoryQuantity
                                    image { url }
                                    selectedOptions { name value }
                                }
                            }
                        }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;
    console.log(`[JOB START] Syncing products for ${shop}`);
    let hasNextPage = true;
    let after: string | null = null;
    const collectedProducts: ShopifyProductNode[] = [];

    console.log(`    Fetching all products from Shopify...`);

    while (hasNextPage) {
        const response = await shopifyGraphqlRequest({
            shop,
            accessToken,
            query,
            variables: { first: 50, after },
        }) as { data: ShopifyProductsResponse; errors?: [] };

        const data = response.data?.products;
        console.log("[SHOPIFY DATA]", response);
        if (!data) break;

        const rawNodes = data.edges.map((e) => e.node);
        console.log("[product data process]")
        // --- SUB-TASK: Save to Prisma DB ---
        // We use Promise.all to save the batch in parallel for speed
        await Promise.all(rawNodes.map(async (node: ShopifyProductNode) => {
            try {
                const formatted = formatShopifyProduct(node, shop);
                await saveProductToDB(formatted);
            } catch (err) {
                console.error(`    [DB Error] Failed to save ${node.title}:`, err);
            }
        }));

        // Add to list for Pinecone step
        collectedProducts.push(...rawNodes);

        console.log(`    Synced batch: ${rawNodes.length}. Total: ${collectedProducts.length}`);
        hasNextPage = data.pageInfo.hasNextPage;
        after = data.pageInfo.endCursor;

        if (hasNextPage) await sleep(200);
    }

    return collectedProducts;
};