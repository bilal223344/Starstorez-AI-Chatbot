
import { PrismaClient } from "@prisma/client";
// Mock LangChainService to avoid complex setup? 
// No, we want to test real service logic.
// But importing it might be hard with paths.
// Let's rely on Prisma directly to seed, and check logical constraints.
// But we need to test LangChainService logic (Campaign check).

// We can try to import LangChainService. If it fails due to paths, we will adjust.
// Assuming tsx handles paths via tsconfig.json

import { LangChainService } from "../app/services/ai/langchain.server";

const prisma = new PrismaClient();

async function main() {
  const shop = "test-shop.myshopify.com";
  console.log("Setting up test data for shop:", shop);

  // 1. Create Config
  await prisma.chatConfiguration.upsert({
      where: { shop },
      update: { campaignsEnabled: true, aiEnabled: true },
      create: { shop, campaignsEnabled: true, aiEnabled: true }
  });

  // 2. Create Product
  const product = await prisma.product.upsert({
      where: { prodId: "gid://shopify/Product/999999" },
      update: {},
      create: {
          shop,
          prodId: "gid://shopify/Product/999999",
          title: "Magic Product",
          price: 100,
          stock: 10,
          options: {},
          tags: ["magic"]
      }
  });

  // 3. Create Campaign
  const campaign = await prisma.campaign.create({
      data: {
          shop,
          name: "Magic Campaign",
          triggerKeywords: ["abracadabra"],
          responseMessage: "Poof! Here is the magic.",
          isActive: true,
          products: {
              create: [{ productId: product.prodId }]
          }
      }
  });

  try {
      // 4. Test Service
      const service = new LangChainService(shop);
      // We need to bypass authenticate/fetchStoreContext specific stuff or mock it?
      // LangChainService constructor takes shop.
      // generateResponse calls fetchStoreContext(this.shop).
      // fetchStoreContext calls Shopify API. This might fail without session.
      // But verify if fetchStoreContext handles errors gracefully?
      // Step 414 summary says "Implemented graceful error handling for ... policy context".
      // So hopefully it won't crash.
      
      const response = await service.generateResponse("test-session", "I say abracadabra");
      console.log("Response Text:", response.text);
      console.log("Recommended Products:", response.recommendedProducts);

      if (response.text.includes("Poof") && response.recommendedProducts.length > 0 && response.recommendedProducts[0].id === product.prodId) {
          console.log("TEST PASSED: Campaign triggered and product returned.");
      } else {
          console.error("TEST FAILED: Campaign did not trigger or return product.");
          process.exit(1);
      }

  } catch (error) {
      console.error("TEST ERROR:", error);
      process.exit(1);
  } finally {
      // Cleanup
      await prisma.campaign.delete({ where: { id: campaign.id } });
      await prisma.product.delete({ where: { prodId: product.prodId } });
      console.log("Cleanup done.");
  }
}

main();
