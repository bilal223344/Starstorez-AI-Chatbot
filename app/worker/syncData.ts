import { PrismaClient } from "@prisma/client";
import { syncAllCustomers } from "app/services/customerService";
import { syncAllOrders } from "app/services/orderService";
import { syncProduct } from "app/services/productService";



// ===========================================================================
// WORKER ENTRY POINTS
// ===========================================================================

const prisma = new PrismaClient();

console.log("🟡 Script started...");


const runFullSync = async () => {
    console.log("🚀 [MANUAL SYNC] Function called..."); // Debug Log 2

    try {
        console.log("🔍 Looking for session in DB..."); // Debug Log 3
        const session = await prisma.session.findFirst();

        if (!session) {
            console.error("❌ [ERROR] No active Shopify session found in the database.");
            console.error("   -> Have you installed the app on a store yet?");
            process.exit(1);
        }

        const shop = session.shop;
        const accessToken = session.accessToken;

        console.log(`✅ Found active session for shop: ${shop}`);

        // --- STEP 1: PRODUCTS ---
        console.log("\n📦 [1/3] Syncing Products...");
        const productResult = await syncProduct(shop, accessToken);
        console.log(`   -> Products Result:`, productResult);

        // --- STEP 2: ORDERS ---
        console.log("\n📦 [2/3] Syncing Orders...");
        const orderResult = await syncAllOrders(shop, accessToken);
        console.log(`   -> Orders Result:`, orderResult);

        // --- STEP 3: CUSTOMERS ---
        console.log("\n👤 [3/3] Syncing Customers...");
        const customerResult = await syncAllCustomers(shop, accessToken);
        console.log(`   -> Customers Result:`, customerResult);

        console.log("\n🎉 [SUCCESS] All sync jobs completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ [CRITICAL ERROR] Sync process failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

// Execute
runFullSync().catch(e => {
    console.error("❌ Unhandled Promise Rejection:", e);
    process.exit(1);
});