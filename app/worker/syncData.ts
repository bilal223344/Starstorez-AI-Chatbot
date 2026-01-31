import { PrismaClient } from "@prisma/client";
import { performInitialSync } from "app/services/syncService";



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

        await performInitialSync(shop, accessToken);

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