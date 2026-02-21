import {
  VertexAI,
} from "@google-cloud/vertexai";
import prisma from "app/db.server";
import { rtdb } from "app/services/firebaseAdmin.server";

import { getOrCreateSession } from "app/services/db/chat.db";

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

YOUR GOAL: Help users find products, answer store policy questions, and provide an excellent shopping experience.

*** GLOBAL FORMATTING RULES (STRICTLY ENFORCED) ***
- You MUST format your responses using **Bullet Points** for readability.
- Use **Bold text** to emphasize key terms, product names, or important details.
- Add line breaks (\\n) between paragraphs and bullet points so the text is not a wall.
- Speak in simple, clear, and easy-to-understand language (like talking to a friend). 
- Avoid long, complicated jargon. Keep sentences short.

CORE BEHAVIORS:
- **Sales Pitches**: If a user asks "Tell me more" or "Why should I buy this?", PROVIDE A PERSUASIVE SALES PITCH. Describe the benefits and value. Do NOT just list features.
- If a user asks for "more details" or specifics about a product, USE THE 'get_product_details' tool.
- **SUMMARIZE THE DETAILS**: When answering with product details or policies, do NOT dump the full text. Create a concise summary.

*** CONTEXT & MEMORY ***
- **Pronoun Resolution**: If the user uses pronouns like "it", "this", "that", or "the product" in a follow-up question, YOU MUST look at the immediate previous turn to find the product name being discussed.
- **Tools Priority**: Use tools to fetch information (Products, Policies, FAQs, Profile, Discounts) rather than guessing.

RULES FOR "recommend_products":
- **Relevance is King**: If the user asks for a specific TYPE of product, your 'search_query' MUST be specific.
- **Sort Logic**: Sort by 'price_desc' for "Expensive"/"Premium", 'price_asc' for "Cheap"/"Low cost".
- *** CRITICAL FIX FOR GENERIC QUERIES ***: If the user asks for "cheapest product", "expensive product", or "recommend ANY product" WITHOUT naming a specific item, fill 'search_query' with "best selling". NEVER leave 'search_query' empty.

*** TONE & STYLE GUIDELINES ***
- **Hide Backend Details**: NEVER mention "database", "backend", "configuration", "JSON", or "tools". 
- **Missing Information**: If you cannot find a policy or info via tools, state politely that you don't have the details and provide the support email.
- **Greetings & Rapport**: Build rapport first instead of jumping into a hard sale.
- **Small Talk**: Handle brief small talk naturally.

*** MULTI-PART QUERY HANDLING ***
- Address ALL parts of the user's request. Call MULTIPLE tools if necessary (e.g., 'search_faq' AND 'get_store_policies' in the same turn).

*** CHECKOUT & PRODUCT GUIDANCE ***
- Rendered Cards: If you find products, the interface will automatically render a card. Do NOT repeat the product names and prices extensively unless asked. Tell them to click "View Details" to add to cart.`;

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
    // TODO: Removed since Prisma Message table was deleted. 
    // Data is now migrating strictly in Firebase Realtime Database.

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
      
      // NEW: Ensure session exists in Prisma (for user counting/analytics ONLY, no messages saved here)
      try {
              await getOrCreateSession(shop, email || "guest", sessionId);
      } catch (err) {
        console.error("[Orchestrator] Failed to ensure Prisma session:", err);
      }
      
      return { success: true, handoff: true };
    }

    // C. SAVE USER MESSAGE TO FIREBASE
    await rtdb.ref(firebaseChatPath).push({
      sender: "user",
      text: userMessage,
      timestamp: Date.now(),
    });

    // D. SESSION MANAGEMENT (DB Layer for Analytics only)
    await getOrCreateSession(shop, email || "guest", sessionId);

    // E. FETCH HISTORY FROM FIREBASE (Single Source of Truth)
    const messagesSnap = await rtdb.ref(firebaseChatPath).get();
    const fbMessages = messagesSnap.val() || {};
    
    // Sort, limit to last 15, and map Firebase messages to LangChain format
    const history = Object.values(fbMessages)
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
      .slice(-5)
      .map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
        recommendedProducts: m.recommendedProducts || []
      }));

    // E. RUN AI MODEL (LANGCHAIN)
    const { LangChainService } = await import("./langchain.server");
    const langChainService = new LangChainService(shop);

    // Generate Response
    const aiResult = await langChainService.generateResponse(sessionId, userMessage, history);
    const finalAiText = aiResult.text;
    const recommendedProducts = aiResult.recommendedProducts || [];

    // F. SAVE RESULTS
    const productsForDb = recommendedProducts.map((p: { id: string, title?: string, price?: number | string, handle?: string, image?: string, score?: number }) => ({
      id: p.id,
      title: p.title || "",
      price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
      handle: p.handle || "",
      image: p.image || "",
      score: p.score || 0
    }));

    // Save to Firebase (Single Source of Truth)
    await rtdb.ref(firebaseChatPath).push({
      sender: "ai",
      text: finalAiText,
      product_ids: productsForDb.map((p: { id: string }) => p.id),
      recommendedProducts: productsForDb, // For LangChain Context
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

/**
 * Orchestrates a streaming response.
 * Yields text chunks to the consumer.
 */
export async function* processStreamingChatTurn(
  shop: string,
  sessionId: string,
  userMessage: string,
  email?: string,
  previousSessionId?: string,
  previewSettings?: any
) {
  const safeShop = shop.replace(/\./g, "_");
  const firebaseChatPath = `chats/${safeShop}/${sessionId}/messages`;
  const metaPath = `chats/${safeShop}/${sessionId}/metadata`;

  try {
    // 1. Migration
    if (email && previousSessionId && previousSessionId !== sessionId) {
      await migrateGuestChatToCustomer(shop, previousSessionId, sessionId);
    }

    // 2. Human Handoff Check
    const metaSnap = await rtdb.ref(metaPath).get();
    const metadata = metaSnap.val() || {};
    if (metadata.isHumanSupport) {
      await rtdb.ref(firebaseChatPath).push({ sender: "user", text: userMessage, timestamp: Date.now() });
      await getOrCreateSession(shop, email || "guest", sessionId); // For analytics only
      yield { type: "text", content: "Human support is active. A representative will be with you shortly." };
      return;
    }

    // 3. Save User Message
    await rtdb.ref(firebaseChatPath).push({ sender: "user", text: userMessage, timestamp: Date.now() });
    await getOrCreateSession(shop, email || "guest", sessionId); // For analytics only

    // Fetch History directly from Firebase
    const messagesSnap = await rtdb.ref(firebaseChatPath).get();
    const fbMessages = messagesSnap.val() || {};
    
    // Convert to LangChain format
    const history = Object.values(fbMessages)
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
      .slice(-5)
      .map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
        recommendedProducts: m.recommendedProducts || []
      }));

    // 4. Init Streaming
    const { LangChainService } = await import("./langchain.server");
    const langChainService = new LangChainService(shop);

    const stream = langChainService.generateStreamingResponse(sessionId, userMessage, history, previewSettings);
    
    let fullText = "";
    let finalRecommendedProducts: any[] = [];

    for await (const chunk of stream) {
      if (chunk.type === "text") {
        fullText += chunk.content;
        yield chunk;
      } else if (chunk.type === "metadata") {
        finalRecommendedProducts = chunk.content.recommendedProducts || [];
        yield chunk;
      }
    }

    // 5. Final Save (Firebase full record)
    const productsForDb = finalRecommendedProducts.map((p: any) => ({
      id: p.id,
      title: p.title || "",
      price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
      handle: p.handle || "",
      image: p.image || "",
      score: p.score || 0
    }));

    // Push the FINAL complete message to Firebase for persistence
    await rtdb.ref(firebaseChatPath).push({
      sender: "ai",
      text: fullText,
      product_ids: productsForDb.map((p: any) => p.id),
      recommendedProducts: productsForDb, // For LangChain context
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error("Streaming Orchestrator Error:", error);
    yield { type: "text", content: "I encountered an error while processing your request." };
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