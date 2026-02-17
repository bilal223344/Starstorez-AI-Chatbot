import { LangChainService } from "./app/services/ai/langchain.server.ts";
import prisma from "./app/db.server.ts";
import dotenv from "dotenv";

dotenv.config();

const SHOP = "test-app-2026.myshopify.com";
const SESSION_ID = "test-session-123";

async function runTests() {
  console.log("--- Starting Chatbot Verification ---");

  // 1. Setup Mock Data in DB if non-existent
  console.log("Checking DB setup...");
  await prisma.chatConfiguration.upsert({
    where: { shop: SHOP },
    update: {},
    create: {
      shop: SHOP,
      aiEnabled: true,
      faqEnabled: true,
      discountSuggestionsEnabled: true,
    },
  });

  await prisma.aISettings.upsert({
    where: { shop: SHOP },
    update: {},
    create: {
      shop: SHOP,
      settings: {
        aiInstructions: "Always mention that we have a 10% discount for first-time buyers.",
        recommendedProducts: [],
        storeDetails: {
          about: "Navigator Fitness",
          location: "New York, USA",
        },
        policies: {
          shipping: "Free shipping on orders over $50. Standard shipping takes 3-5 business days.",
          payment: "We accept Visa, Mastercard, American Express, and PayPal.",
          refund: "30-day return policy for unused items in original packaging.",
        },
        responseTone: {
          selectedTone: ["professional", "enthusiastic"],
          customInstructions: "A knowledgeable fitness coach",
        },
        languageSettings: {
          primaryLanguage: "english",
          autoDetect: true,
        },
        responseSettings: {
          length: ["balanced"],
          style: ["bullets"],
        },
      },
    },
  });

  const langChainService = new LangChainService(SHOP);

  const testCases = [
    { name: "Product Discovery", message: "What are your best sellers?" },
    { name: "Detailed Benefit Check", message: "Tell me more about your most expensive product and why I should buy it." },
    { name: "Policy Check", message: "What is your refund policy?" },
    { name: "Order Tracking", message: "Where is my order #1001?" },
    { name: "Human Handoff", message: "I want to talk to a person." },
    { name: "Edge Case - Out of Scope", message: "Who won the World Cup in 2022?" },
    { name: "Context Retention", message: "How long does shipping take?" },
    { name: "Product Comparison", message: "What is the difference between 'Vanilla candle' and 'Yellow watering can'?" },
    { name: "Combined Query", message: "I want to track my order and also ask about your return policy." },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting: [${tc.name}] -> "${tc.message}"`);
    try {
      const response = await langChainService.generateResponse(SESSION_ID, tc.message, []);
      console.log("AI Response:", response.text);
      console.log("Recommended Products:", response.recommendedProducts.length);
    } catch (error) {
      console.error(`Error in test [${tc.name}]:`, error);
    }
  }

  console.log("\n--- Verification Complete ---");
}

runTests().catch(console.error);
