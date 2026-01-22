// app/services/webhookService.ts
import { deleteProductFromDB, syncProductById } from "./productService";
import { deleteOrderFromDB, syncOrderById } from "./orderService";
import { deleteCustomerFromDB, syncCustomerById } from "./customerService";
import { deleteVectorFromPinecone, checkPineconeNamespace } from "./pineconeService";

// ============================================================================
// PRODUCTS
// ============================================================================

export const syncSingleProductJob = async (shop: string, accessToken: string, productId: string) => {
    console.log(`[WEBHOOK JOB] Syncing Product: ${productId}`);
    await syncProductById(shop, accessToken, productId);
};

export const deleteProductJob = async (shop: string, productId: string) => {
    console.log(`[WEBHOOK JOB] Deleting Product: ${productId}`);

    // 1. DB Delete
    await deleteProductFromDB(productId);

    // 2. Pinecone Delete
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace) {
        const cleanId = `shopify_${productId.split("/").pop()}`;
        await deleteVectorFromPinecone(nsCheck.pcNamespace, cleanId);
    }
};

// ============================================================================
// ORDERS
// ============================================================================

export const syncOrderJob = async (shop: string, accessToken: string, orderId: string) => {
    console.log(`[WEBHOOK JOB] Syncing Order: ${orderId}`);
    await syncOrderById(shop, accessToken, orderId);
};

export const deleteOrderJob = async (shop: string, orderId: string) => {
    console.log(`[WEBHOOK JOB] Deleting Order: ${orderId}`);

    await deleteOrderFromDB(orderId);

    // Note: If you sync orders to Pinecone, you should delete them here too:
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace) {
        const cleanId = `shopify_${orderId.split("/").pop()}`;
        await deleteVectorFromPinecone(nsCheck.pcNamespace, cleanId);
    }
};

// ============================================================================
// CUSTOMERS
// ============================================================================

export const syncCustomerJob = async (shop: string, accessToken: string, customerId: string) => {
    console.log(`[WEBHOOK JOB] Syncing Customer: ${customerId}`);
    await syncCustomerById(shop, accessToken, customerId);
};

export const deleteCustomerJob = async (shop: string, customerId: string) => {
    console.log(`[WEBHOOK JOB] Deleting Customer: ${customerId}`);
    await deleteCustomerFromDB(customerId);
};