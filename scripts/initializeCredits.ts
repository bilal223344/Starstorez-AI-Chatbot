import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeCreditsSystem() {
    console.log('🚀 Credits System is deprecated. Script skipped.');
    // Tables like MerchantPlan and MerchantCredits have been deleted.
}

// Run the initialization
initializeCreditsSystem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });