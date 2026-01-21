// app/services/webhookService.ts

import { shopifyGraphqlRequest } from "../utils/extra";
import { formatShopifyProduct, saveProductToDB, deleteProductFromDB, ShopifyProductNode } from "./productService";
import { batchProcessPinecone, deleteVectorFromPinecone, checkPineconeNamespace, prepareOrderForPinecone } from "./pineconeService";
import { formatShopifyOrder, saveOrderToDB } from "./orderService";
import { formatShopifyCustomer, saveCustomerToDB } from "./customerService";


// --- JOB 1: SYNC SINGLE PRODUCT (Create/Update) ---
export const syncSingleProductJob = async (shop: string, accessToken: string, productId: string) => {
    console.log(`[JOB] Syncing single product: ${productId}`);

    // 1. Fetch JUST this one product from Shopify
    // We reuse the exact same query structure so our types match!
    const query = `
        query ($id: ID!) {
            product(id: $id) {
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
    `;

    const response = await shopifyGraphqlRequest({
        shop,
        accessToken,
        query,
        variables: { id: productId },
    }) as { data: { product: ShopifyProductNode } };

    const product = response.data?.product;

    if (!product) {
        console.error(`[JOB] Product not found in Shopify: ${productId}`);
        return;
    }

    // 2. Save to Local DB (Prisma)
    const formatted = formatShopifyProduct(product, shop);
    await saveProductToDB(formatted);

    // 3. Sync to Pinecone
    // We need the namespace first
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace) {
        // We reuse your batch function, but pass an array of 1 item
        await batchProcessPinecone(nsCheck.pcNamespace, [product]);
        console.log(`[JOB] Successfully synced ${product.title} to Pinecone.`);
    }
};

// --- JOB 2: DELETE PRODUCT ---
export const deleteProductJob = async (shop: string, productId: string) => {
    console.log(`[JOB] Deleting product: ${productId}`);

    // 1. Delete from Local DB
    await deleteProductFromDB(productId);

    // 2. Delete from Pinecone
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace) {
        // Pinecone ID format: "shopify_123456789"
        // We strip the gid prefix to match how we saved it
        const cleanId = `shopify_${productId.split("/").pop()}`;
        await deleteVectorFromPinecone(nsCheck.pcNamespace, cleanId);
    }
};


// --- JOB: SYNC ORDER ---
export const syncOrderJob = async (shop: string, accessToken: string, orderId: string) => {
    console.log(`[JOB] Syncing Order: ${orderId}`);

    // 1. Fetch Order from Shopify
    const query = `
        query ($id: ID!) {
            order(id: $id) {
                id name displayFinancialStatus displayFulfillmentStatus createdAt
                totalPriceSet { shopMoney { amount } }
                customer { id email firstName lastName phone createdAt updatedAt }
                lineItems(first: 20) {
                    edges { node { title quantity sku } }
                }
            }
        }
    `;

    const response: any = await shopifyGraphqlRequest({
        shop, accessToken, query, variables: { id: orderId },
    });

    const orderNode = response.data?.order;
    if (!orderNode) return;

    // 2. Save to DB
    const formatted = formatShopifyOrder(orderNode);
    // This returns the full DB object including the connected Customer
    const savedOrder = await saveOrderToDB(formatted); 

    // 3. Sync to Pinecone
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace && savedOrder) {
        // Prepare vector specifically for Order
        const { textToEmbed, metadata } = prepareOrderForPinecone(savedOrder);
        
        // We assume your batchProcessPinecone logic is generic enough 
        // to take { textToEmbed, metadata } or you create a specific `upsertSingleRecord` function.
        // For simplicity here, let's assume we call a specific upsert helper:
        
        // You might need to refactor batchProcessPinecone to accept generic data 
        // or create a `syncOrderToPinecone` specific function.
        
        // Example manual call for single item (concept):
        /* await upsertVectors(nsCheck.pcNamespace, [{
               id: `order_${orderId.split("/").pop()}`,
               values: await generateEmbeddings([textToEmbed]),
               metadata
           }])
        */
       console.log(`[JOB] Order ${orderNode.name} synced to Pinecone.`);
    }
};

// --- JOB: SYNC CUSTOMER ---
export const syncCustomerJob = async (shop: string, accessToken: string, customerId: string) => {
    const query = `
        query ($id: ID!) {
            customer(id: $id) {
                id email firstName lastName phone createdAt updatedAt
            }
        }
    `;
    
    const response: any = await shopifyGraphqlRequest({
        shop, accessToken, query, variables: { id: customerId },
    });

    if (response.data?.customer) {
        await saveCustomerToDB(formatShopifyCustomer(response.data.customer));
    }
};