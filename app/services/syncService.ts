import { syncAllCustomers } from "app/services/customerService";
import { syncAllOrders } from "app/services/orderService";
import { syncProduct } from "app/services/productService";

export const performInitialSync = async (shop: string, accessToken: string) => {
    console.log(`[SYNC] Starting full sync for ${shop}...`);

    // Non-blocking catch to ensure one failure doesn't stop the others if possible,
    // though sequential is often safer for rate limits.

    try {
        // --- STEP 1: PRODUCTS ---
        console.log("📦 [1/3] Syncing Products...");
        await syncProduct(shop, accessToken);

        // --- STEP 2: ORDERS ---
        console.log("📦 [2/3] Syncing Orders...");
        await syncAllOrders(shop, accessToken);

        // --- STEP 3: CUSTOMERS ---
        console.log("👤 [3/3] Syncing Customers...");
        await syncAllCustomers(shop, accessToken); // Note: import path might need adjustment based on valid paths

        console.log("🎉 [SUCCESS] Initial sync completed.");
    } catch (error) {
        console.error("❌ [SYNC ERROR] Failed during initial sync:", error);
        throw error; // Re-throw to let caller know
    }
};
