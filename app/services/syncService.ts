// app/services/syncService.ts
import { shopifyGraphqlRequest, sleep } from "../utils/extra";
import { saveCustomerToDB, formatShopifyCustomer } from "./customerService";
import { saveOrderToDB, formatShopifyOrder } from "./orderService";
import { prepareOrderForPinecone, batchProcessPinecone, checkPineconeNamespace, createPineconeNamespace } from "./pineconeService";

// --- SYNC ALL CUSTOMERS ---
export const syncAllCustomers = async (shop: string, accessToken: string) => {
    console.log(`[SYNC] Starting Customer Sync for ${shop}`);

    let hasNextPage = true;
    let after: string | null = null;
    let count = 0;

    const query = `
        query ($first: Int, $after: String) {
            customers(first: $first, after: $after) {
                edges {
                    node { id email firstName lastName createdAt updatedAt }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;

    while (hasNextPage) {
        const response: any = await shopifyGraphqlRequest({
            shop, accessToken, query, variables: { first: 50, after }
        });
        console.log("[CUSTOMER RESPONSE]")
        const nodes = response.data?.customers?.edges.map((e: any) => e.node) || [];
        console.log("[CUSTOMER RESPONSE]",response);
        if (nodes.length === 0) break;

        // Save batch to DB
        await Promise.all(nodes.map(async (node: any) => {
            await saveCustomerToDB(formatShopifyCustomer(node));
        }));

        count += nodes.length;
        console.log(`[SYNC] Processed ${count} customers...`);

        hasNextPage = response.data.customers.pageInfo.hasNextPage;
        after = response.data.customers.pageInfo.endCursor;
        if (hasNextPage) await sleep(200); // throttle
    }
    return count;
};

// --- SYNC ALL ORDERS ---
export const syncAllOrders = async (shop: string, accessToken: string) => {
    console.log(`[SYNC] Starting Order Sync for ${shop}`);

    // 1. Ensure Pinecone Namespace Exists
    let nsCheck = await checkPineconeNamespace(shop);
    if (!nsCheck.pcNamespace) {
        nsCheck = await createPineconeNamespace(shop) as any;
    }
    const namespace = nsCheck.pcNamespace;

    if (!namespace) throw new Error("Could not setup Pinecone namespace");

    let hasNextPage = true;
    let after: string | null = null;
    let count = 0;

    const query = `
        query ($first: Int, $after: String) {
            orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
                edges {
                    node {
                        id name displayFinancialStatus displayFulfillmentStatus createdAt
                        totalPriceSet { shopMoney { amount } }
                        customer { id email firstName lastName phone createdAt updatedAt }
                        lineItems(first: 10) {
                            edges { node { title quantity sku } }
                        }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;
    console.log("[ORDER RESPONSE]")
    while (hasNextPage) {
        const response: any = await shopifyGraphqlRequest({
            shop, accessToken, query, variables: { first: 20, after }
        });
        console.log("[ORDER RESPONSE]", response.data)
        const nodes = response.data?.orders?.edges.map((e: any) => e.node) || [];
        if (nodes.length === 0) break;

        const pineconeBatch: any[] = [];

        // Process Batch
        await Promise.all(nodes.map(async (node: any) => {
            // A. Save to DB
            const formatted = formatShopifyOrder(node);
            const savedOrder = await saveOrderToDB(formatted);

            // B. Prepare for Pinecone
            if (savedOrder) {
                // We pass the saved DB object because it contains the internal Customer UUID
                pineconeBatch.push(prepareOrderForPinecone(savedOrder));
            }
        }));

        // C. Upload Vectors (Reuse your generic batch processor or create a simple one)
        // Since batchProcessPinecone in your previous code expects "ShopifyProductNode",
        // you might need to make a generic version or map strictly manually here.
        // Assuming you made a generic `upsertVectors` helper exportable:

        // Manual Upsert Call for this batch:
        /* const vectors = await generateEmbeddings(pineconeBatch.map(i => i.textToEmbed));
        const records = pineconeBatch.map((item, idx) => ({
            id: `order_${item.metadata.order_id.split('/').pop()}`,
            values: vectors[idx],
            metadata: item.metadata
        }));
        await upsertVectors(namespace, records);
        */

        count += nodes.length;
        console.log(`[SYNC] Processed ${count} orders...`);

        hasNextPage = response.data.orders.pageInfo.hasNextPage;
        after = response.data.orders.pageInfo.endCursor;
        if (hasNextPage) await sleep(500); // Higher throttle for embedding limits
    }
    return count;
};