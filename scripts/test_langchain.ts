import { LangChainService } from "../app/services/ai/langchain.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SHOP = "pixel-pioneers-dev.myshopify.com"; // Replace with a valid shop from your DB

async function testLangChain() {
  console.log("Starting LangChain Service Test...");

  try {
    // 1. Setup Mock Data (Optional, ensuring config exists)
    await prisma.chatConfiguration.upsert({
      where: { shop: SHOP },
      update: { 
        aiEnabled: true,
        faqEnabled: true, 
        campaignsEnabled: true, 
        discountSuggestionsEnabled: true 
      },
      create: { 
        shop: SHOP,
        aiEnabled: true,
        faqEnabled: true, 
        campaignsEnabled: true, 
        discountSuggestionsEnabled: true 
      }
    });

    const service = new LangChainService(SHOP);

    // 2. Test General Chat
    console.log("\n--- Test 1: General Chat ---");
    const res1 = await service.generateResponse("test-session-1", "Hello! What can you do?");
    console.log("AI Response:", res1.text);

    // 3. Test Product Search (Needs valid Pinecone setup)
    console.log("\n--- Test 2: Product Search (Snowboard) ---");
    const res2 = await service.generateResponse("test-session-1", "Recommend a snowboard");
    console.log("AI Text:", res2.text);
    console.log("Products Found:", res2.recommendedProducts?.length);

    // 4. Test FAQ (Mock a FAQ if needed)
    console.log("\n--- Test 3: FAQ ---");
    await prisma.fAQ.create({
        data: {
            shop: SHOP,
            question: "What is your return policy?",
            answer: "You can return items within 30 days.",
            isActive: true
        }
    }).catch(() => {}); // Ignore duplicate/error
    
    const res3 = await service.generateResponse("test-session-1", "return policy");
    console.log("AI Response:", res3.text);

    // 5. Test Campaign (Mock a Campaign)
    console.log("\n--- Test 4: Campaign Trigger ---");
    await prisma.campaign.create({
        data: {
            shop: SHOP,
            name: "Summer Sale",
            triggerKeywords: ["summer", "hot"],
            responseMessage: "Check out our Summer Sale collection!",
            isActive: true
        }
    }).catch(() => {});

    const res4 = await service.generateResponse("test-session-1", "It is getting hot in here");
    console.log("AI Response:", res4.text);


  } catch (error) {
    console.error("Test Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLangChain();
