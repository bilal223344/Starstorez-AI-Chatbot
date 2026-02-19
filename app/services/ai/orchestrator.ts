import {
  VertexAI,
} from "@google-cloud/vertexai";
import prisma from "app/db.server";
import { rtdb } from "app/services/firebaseAdmin.server";

import { getOrCreateSession, saveChatTurn, saveSingleMessage } from "app/services/db/chat.db";

// =================================================================
// 1. CONFIGURATION & INIT
// =================================================================
const LOCATION = "us-central1";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
  location: LOCATION,
  googleAuthOptions: {
    credentials: {
      client_email: serviceAccount.clientEmail,
      private_key: serviceAccount.privateKey,
    }
  }
});

// System Instructions: Teaching the AI how to use tools
export const SYSTEM_INSTRUCTION_BASE = `You are a friendly, knowledgeable, and persuasive Sales Assistant for a Shopify store.

YOUR GOAL: Help users find products, track orders, and CLOSE THE SALE by highlighting benefits.

CORE BEHAVIORS:
- **Sales Pitches**: If a user asks "Tell me more" or "Why should I buy this?", PROVIDE A PERSUASIVE SALES PITCH. Describe the benefits and value. Do NOT just list features.
- If a user asks for "more details" or specifics about a product, USE THE 'get_product_details' tool.
- **SUMMARIZE THE DETAILS**: When answering, do NOT dump the full text. Create a concise summary including the Title, Price, Key Features, and Type.

RULES FOR "recommend_products":
- **Relevance is King**: If the user asks for a specific TYPE of product (e.g., "expensive jewelry"), your 'search_query' MUST be "jewelry". Do NOT set it to "expensive product".
- If user explicitly says "Sort by price high to low", then set 'sort' to 'price_desc'.
- If user says "Expensive" or "Premium" in the context of a category (e.g., "expensive watch"), set 'sort' to 'price_desc' AND 'search_query' to "watch".
- If user says "Cheap", "Low cost": Set 'sort' to 'price_asc'.

*** CRITICAL FIX FOR GENERIC QUERIES ***
- If the user asks for "cheapest product", "expensive product", or "recommend ANY product" WITHOUT naming a specific item, fill 'search_query' with "best selling".
- NEVER leave 'search_query' empty.

GENERAL:
- Use the tools and the context provided in this prompt to answer questions.
- Do not hallucinate.

*** TONE & STYLE GUIDELINES ***
- **Hide Backend Details**: NEVER mention "database", "backend", "configuration", "JSON", or "tools". NEVER say "The merchant hasn't configured this" or "I was unable to find...".
- **Missing Information**: If you cannot find a policy or specific info, say: "I don't have the specific details on that right now. I'd recommend checking our website or contacting us directly."
- **Helpful & Persuasive**: Be a helpful sales assistant, not a robot.
- **Greetings & Rapport**: When a user greets you (e.g., "Hi", "Hello"), greet them back warmly and establish a helpful presence. Do NOT jump immediately into a hard sales pitch unless they've already expressed interest. Build rapport first.
- **Small Talk**: Handle brief small talk naturally (e.g., "How are you?", "What's up?"). Respond appropriately before pivoting back to how you can help them shop.
- **Language**: Respond in the same language the user is using.

*** PRODUCT CARD RENDERING & RECOMMENDATIONS ***
- If you find products using 'recommend_products', do NOT list their names, prices, or details in your text response UNLESS the user explicitly asked for a description/pitch (e.g., "Tell me more").
- The user interface will automatically render a visual card for each product returned by the tool.
- In general, simply say: "Here are some recommendations based on your request:" or "I found these products for you:".
- If the user did not ask a specific question, you can return a very brief response or even an empty string if permitted.
- This ensures a clean chat experience without duplicate information.
- **Rapport First**: If a user asks for "new arrivals" or "popular items" as part of a greeting, acknowledge the request enthusiastically but don't just dump a list. Say something like "I'd love to show you what's new! We have some great items that just arrived..."
- Use tools to search for products when the user asks for suggestions or displays an interest in a category (e.g., "I'm looking for something blue" or "Do you have any new arrivals?").

*** MULTI-PART QUERY HANDLING ***
- The user may ask multiple questions in a single message (e.g., "Where is my order #123 and do you have a return policy?").
- You MUST address ALL parts of the user's request.
- BREAK DOWN the request into separate intents.
- Call MULTIPLE tools if necessary (e.g., call 'track_order' AND 'search_faq' in the same turn).
- Combine the results from all tools into a single, cohesive, and helpful response.
- Do NOT ignore any part of the question.

*** ORDER TRACKING ***
- If the user asks about order tracking or status, do NOT use or mention the 'track_order' tool.
- Instead, politely inform them that for the most accurate update on their order status, they should contact our support team directly.

*** HUMAN HANDOFF ***
- If the user explicitly asks to speak to a "human", "agent", "person", or "support", you MUST use the 'request_human_support' tool.
- Do not try to convince them to keep talking to you if they are frustrated or asking for a human.
- Reason for handoff can be "User requested human agent".
 
 *** CART & CHECKOUT GUIDANCE ***
 - **Add to Cart**: If the user expresses a desire to "buy", "add to cart", or "purchase" a product you just recommended or discussed:
     - Direct them to click the **"View Details"** button on the product's visual card.
     - Explain that clicking that button will take them to the product page where they can select options and add it to their cart.
     - Example: "You can add that to your cart by clicking 'View Details' on the product card above! It'll take you straight to the product page."
 - **Context Awareness**: Maintain awareness of which products have been discussed. If the user says "Add it to my cart" or "I want this one", assume they refer to the most recently mentioned product.
 - **Checkout**: If the user asks how to pay or complete their order, guide them to their cart/checkout area on the website.`;

// =================================================================
// 3. HELPER: CHAT MIGRATION (Guest -> Customer)
// =================================================================
async function migrateGuestChatToCustomer(shop: string, guestId: string, customerId: string) {
  const safeShop = shop.replace(/\./g, "_");
  const guestPath = `chats/${safeShop}/${guestId}/messages`;
  const customerPath = `chats/${safeShop}/${customerId}/messages`;

  // Check if guest data exists
  const guestRef = rtdb.ref(guestPath);
  const guestSnap = await guestRef.get();

  if (guestSnap.exists()) {
    console.log(`[MERGE] Moving ${guestId} -> ${customerId}`);
    const messages = guestSnap.val();

    // Copy to Customer Path (Append/Merge)
    await rtdb.ref(customerPath).update(messages);

    // Update SQL Ownership in Prisma
    await prisma.message.updateMany({
      where: { sessionId: guestId },
      data: { sessionId: customerId }
    });

    // Delete old Guest path to avoid duplicates
    await guestRef.remove();
  }
}

// =================================================================
// 4. MAIN ORCHESTRATOR FUNCTION
// =================================================================
// =================================================================
// 4. MAIN ORCHESTRATOR FUNCTION
// =================================================================
export async function processChatTurn(
  shop: string,
  sessionId: string,
  userMessage: string,
  email?: string,
  previousSessionId?: string,
  isMergeOnly: boolean = false
) {
  const safeShop = shop.replace(/\./g, "_");
  const firebaseChatPath = `chats/${safeShop}/${sessionId}/messages`;
  const metaPath = `chats/${safeShop}/${sessionId}/metadata`;

  try {
    // A. HANDLE MIGRATION
    if (email && previousSessionId && previousSessionId !== sessionId) {
      await migrateGuestChatToCustomer(shop, previousSessionId, sessionId);
    }
    if (isMergeOnly) return { success: true };

    // B. CHECK HANDOFF STATUS (Is a human in control?)
    const metaSnap = await rtdb.ref(metaPath).get();
    const metadata = metaSnap.val() || {};

    if (metadata.isHumanSupport) {
      console.log(`[Orchestrator] Human support active for ${sessionId}. Skipping AI response generation.`);
      
      // Still B.1: SAVE USER MESSAGE TO FIREBASE (so merchant sees it)
      await rtdb.ref(firebaseChatPath).push({
        sender: "user",
        text: userMessage,
        timestamp: Date.now(),
      });
      
      // NEW: SAVE TO PRISMA (so Dashboard sees activity)
      try {
        const { session } = await getOrCreateSession(shop, email || "guest");
        await saveSingleMessage(session.id, "user", userMessage);
      } catch (err) {
        console.error("[Orchestrator] Failed to save human-support message to Prisma:", err);
      }
      
      return { success: true, handoff: true };
    }

    // C. SAVE USER MESSAGE TO FIREBASE
    await rtdb.ref(firebaseChatPath).push({
      sender: "user",
      text: userMessage,
      timestamp: Date.now(),
    });

    // D. SESSION MANAGEMENT (DB Layer)
    const { session } = await getOrCreateSession(shop, email || "guest");

    // E. RUN AI MODEL (LANGCHAIN)
    const { LangChainService } = await import("./langchain.server");
    const langChainService = new LangChainService(shop);

    // Convert DB history to LangChain format
    const history = (session.messages || []).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }));

    // Generate Response
    const aiResult = await langChainService.generateResponse(sessionId, userMessage, history);
    const finalAiText = aiResult.text;
    const recommendedProducts = aiResult.recommendedProducts || [];

    // F. SAVE RESULTS
    // 1. Save to SQL
    const productsForDb = recommendedProducts.map((p: { id: string, title?: string, price?: number | string, handle?: string, image?: string, score?: number }) => ({
      id: p.id,
      title: p.title || "",
      price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
      handle: p.handle || "",
      image: p.image || "",
      score: p.score || 0
    }));

    await saveChatTurn(session.id, userMessage, finalAiText, productsForDb);

    // 2. Save to Firebase
    await rtdb.ref(firebaseChatPath).push({
      sender: "ai",
      text: finalAiText,
      product_ids: productsForDb.map((p: { id: string }) => p.id),
      timestamp: Date.now(),
    });

    return { success: true };

  } catch (error) {
    console.error("Orchestrator Error:", error);
    await rtdb.ref(firebaseChatPath).push({
      sender: "system",
      text: "I encountered an internal error. Please try again.",
      timestamp: Date.now()
    });
    return { success: false, error };
  }
}

// =================================================================
// 6. SUMMARIZATION
// =================================================================
export async function summarizeConversation(messages: { role: string; content: string }[]) {
  try {
    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.0-flash-001", // Using generic name for better reliability
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    const prompt = `
      Analyze the following conversation between a Customer and an AI Sales Assistant.
      Provide a highly detailed and structured summary in JSON format with the following fields:
      - customerName: Extract from context if possible, otherwise null.
      - overview: A concise paragraph summarizing the customer's inquiry and the current status.
      - intent: Short phrase describing user intent (e.g., "Product Inquiry", "Order Status").
      - sentiment: "Positive", "Neutral", or "Negative".
      - sentimentScore: A number from 0-100 indicating confidence in the sentiment.
      - priority: "Low", "Medium", or "High" based on urgency or customer frustration.
      - tags: Array of short strings (max 3) like ["Looking to buy", "Urgent"].
      - keyQuotes: Array of 1-2 most significant direct statements from the customer.
      - suggestedAction: A specific recommendation for the merchant (e.g., "Check inventory", "Follow up").
      - resolutionStatus: "Escalated", "Requires Follow-up", or "Informational".
      
      Conversation:
      ${conversationText}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No summary generated");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error summarizing conversation:", error);
    return {
      overview: "Failed to generate summary.",
      intent: "Error",
      sentiment: "Neutral",
      sentimentScore: 50,
      priority: "Medium",
      tags: ["Error"],
      keyQuotes: [],
      suggestedAction: "Check logs for details.",
      resolutionStatus: "Informational"
    };
  }
}