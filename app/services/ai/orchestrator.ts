import {
  VertexAI,
  FunctionDeclarationSchemaType,
  Tool,
} from "@google-cloud/vertexai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import prisma from "app/db.server";

import { searchPinecone } from "app/services/search/pinecone.service";
import { getOrCreateSession, saveChatTurn } from "app/services/db/chat.db";

// =================================================================
// 1. CONFIGURATION & INIT
// =================================================================
const LOCATION = "us-central1";

// Initialize Firebase Admin (Server-Side)
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // key must replace literal \n with actual newlines if coming from .env
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}
const rtdb = getDatabase();

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
const SYSTEM_INSTRUCTION_BASE = `You are a friendly, knowledgeable, and persuasive Sales Assistant for a Shopify store.

YOUR GOAL: Help users find products, track orders, and CLOSE THE SALE test by highlighting benefits.

CORE BEHAVIORS:
- Be enthusiastic but professional.
- If a user asks for "more details" or specifics about a product, USE THE 'get_product_details' tool.
- **SUMMARIZE THE DETAILS**: When answering, do NOT dump the full text. Create a concise summary including the Title, Price, Key Features (from description/tags), and Type.
- Highlight key benefits.

RULES FOR "recommend_products":
- **Relevance is King**: If the user asks for a specific TYPE of product (e.g., "expensive jewelry"), your 'search_query' MUST be "jewelry". Do NOT set it to "expensive product".
- If user explicitly says "Sort by price high to low", then set 'sort' to 'price_desc'.
- If user says "Expensive" or "Premium" in the context of a category (e.g., "expensive watch"), set 'sort' to 'price_desc' AND 'search_query' to "watch".
- If user says "Cheap", "Low cost": Set 'sort' to 'price_asc'.

*** CRITICAL FIX FOR GENERIC QUERIES ***
- If the user asks for "cheapest product", "expensive product", or "recommend ANY product" WITHOUT naming a specific item, fill 'search_query' with "best selling".
- NEVER leave 'search_query' empty.

GENERAL:
- Keep answers strictly based on the provided tool data.
- Do not hallucinate.`;

// =================================================================
// 2. TOOLS DEFINITION (JSON Schema)
// =================================================================
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "recommend_products",
        description: "Search for products based on user query.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            search_query: { type: FunctionDeclarationSchemaType.STRING, description: "Main keywords" },
            min_price: { type: FunctionDeclarationSchemaType.NUMBER },
            max_price: { type: FunctionDeclarationSchemaType.NUMBER },
            sort: {
              type: FunctionDeclarationSchemaType.STRING,
              enum: ["price_asc", "price_desc", "relevance"],
              description: "Sort order"
            }
          },
          required: ["search_query"],
        },
      },
      {
        name: "get_product_details",
        description: "Get full details (description, specs) for a specific product ID OR exact title.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            product_id: { type: FunctionDeclarationSchemaType.STRING },
            product_title: { type: FunctionDeclarationSchemaType.STRING, description: "Exact product name if ID is unknown" }
          },
        },
      },
      {
        name: "get_store_categories",
        description: "Get a list of product categories available in the store.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {},
        },
      },
      {
        name: "track_order",
        description: "Get order status using order number.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            order_number: { type: FunctionDeclarationSchemaType.STRING },
          },
          required: ["order_number"],
        },
      },
      {
        name: "escalate_to_human",
        description: "Transfer the chat to a human support agent.",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            reason: { type: FunctionDeclarationSchemaType.STRING },
          },
          required: ["reason"],
        },
      },
    ],
  },
] as Tool[];

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

    // B. SAVE USER MESSAGE TO FIREBASE
    await rtdb.ref(firebaseChatPath).push({
      sender: "user",
      text: userMessage,
      timestamp: Date.now(),
    });

    // C. SESSION MANAGEMENT (DB Layer)
    const { session, customerId } = await getOrCreateSession(shop, email || "guest");

    // D. RUN AI MODEL
    // 1. Fetch Dynamic Store Context
    const { fetchStoreContext } = await import("app/services/context.server");
    const storeContext = await fetchStoreContext(shop);

    const fullSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\n${storeContext}`;

    // 2. Init Model per request (to inject dynamic context)
    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      systemInstruction: fullSystemInstruction
    });

    // Convert SQL history to Gemini format
    const history = (session.messages || []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history, tools: TOOLS });
    let result = await chat.sendMessage(userMessage);
    let response = result.response;

    // E. HANDLE FUNCTION CALLS (BATCHED)
    let functionCalls = response.candidates?.[0]?.content?.parts?.filter(
      (part) => part.functionCall
    ).map((part) => part.functionCall);

    let finalAiText = "";
    let recommendedProducts: any[] = [];

    // Loop until no more function calls
    while (functionCalls && functionCalls.length > 0) {
      console.log(`[Orchestrator] Processing ${functionCalls.length} tool calls...`);

      const functionResponseParts: any[] = [];

      // Execute all tools in specific order or parallel
      for (const call of functionCalls) {
        if (!call || !call.name) continue;

        const args = call.args as any;
        console.log(`[AI Tool] ${call.name}`, args);
        let toolResult = {};

        try {
          switch (call.name) {
            case "recommend_products": {
              // Same logic as before
              const searchRes = await searchPinecone(shop, args.search_query, args.min_price, args.max_price, args.sort);
              recommendedProducts = searchRes.matches.map(m => m.metadata);

              toolResult = {
                products: recommendedProducts.map((p: any) => ({
                  id: p.product_id,
                  title: p.title,
                  price: p.price_val,
                  // We pass basic info. The AI can ask for 'get_product_details' if it needs description.
                  // Or we can pass it here if we want to be chatty immediately.
                  // Let's pass description here too to save a round trip for "recommendation" mode.
                  description: p.description?.slice(0, 200) + "..." // Truncate for token efficiency in list view
                }))
              };
              break;
            }

            case "get_product_details": {
              let prodId = args.product_id;

              // If we don't have an ID but have a title, search for it
              if (!prodId && args.product_title) {
                console.log(`[Tool] Looking up ID for title: "${args.product_title}"`);
                const searchRes = await searchPinecone(shop, args.product_title, undefined, undefined, "relevance");
                // Find best match (exact or high score)
                const bestMatch = searchRes.matches.find(m => m.score && m.score > 0.8) || searchRes.matches[0];
                if (bestMatch?.metadata) {
                  prodId = bestMatch.metadata.product_id;
                }
              }

              if (!prodId) {
                toolResult = { error: "Product not found. Please try searching for it first." };
                break;
              }

              // Try finding in current recommended list first to save DB call
              let product = recommendedProducts.find((p: any) => p.product_id === prodId);

              if (!product) {
                // Fetch from DB
                const dbProd = await prisma.product.findUnique({ where: { prodId } });
                if (dbProd) {
                  product = {
                    title: dbProd.title,
                    description: dbProd.description, // Full description
                    price: dbProd.price,

                    // Ensure tags are an array of strings
                    tags: Array.isArray(dbProd.tags) ? dbProd.tags : []
                  };
                }
              }

              if (product) {
                // Strip HTML and Truncate Description for efficient context
                let rawDesc = product.description || product.body_html || "";
                // Simple HTML strip
                rawDesc = rawDesc.replace(/<[^>]*>?/gm, "");
                // Truncate
                const shortDesc = rawDesc.length > 500 ? rawDesc.substring(0, 500) + "..." : rawDesc;

                toolResult = {
                  title: product.title,
                  description: shortDesc || "No description available.",
                  price: product.price_val || product.price,
                  image: product.image,
                  vendor: product.vendor || "Unknown",
                  type: product.type || "Product",
                  tags: product.tags
                };
              } else {
                toolResult = { error: "Product not found." };
              }
              break;
            }

            case "get_store_categories": {
              const distinctProducts = await prisma.product.findMany({
                select: { collection: true },
                take: 50
              });
              const categories = Array.from(new Set(distinctProducts.flatMap(p => p.collection)));
              toolResult = { categories: categories.slice(0, 10) };
              break;
            }

            case "track_order": {
              const whereClause: any = { orderNumber: args.order_number };
              if (customerId) whereClause.customerId = customerId;
              const order = await prisma.order.findFirst({ where: whereClause });
              toolResult = order ? { status: order.status, total: order.totalPrice } : { error: "Not found" };
              break;
            }

            case "escalate_to_human": {
              await rtdb.ref(metaPath).update({ isHumanSupport: true, reason: args.reason });
              toolResult = { success: true };
              break;
            }
          }
        } catch (err: any) {
          console.error(`Error executing ${call.name}:`, err);
          toolResult = { error: err.message || "Tool execution failed" };
        }

        // Add to batch
        functionResponseParts.push({
          functionResponse: { name: call.name, response: { result: toolResult } },
        });
      }

      // Send BATCHED responses back to AI
      if (functionResponseParts.length > 0) {
        result = await chat.sendMessage(functionResponseParts);
        response = result.response;
      }

      // Check if AI wants to call more tools
      functionCalls = response.candidates?.[0]?.content?.parts?.filter(
        (part) => part.functionCall
      ).map((part) => part.functionCall);
    }

    finalAiText = response.candidates?.[0]?.content?.parts?.[0]?.text || "...";

    // F. SAVE RESULTS
    // 1. Save to SQL
    const productsForDb = recommendedProducts.map((p: any) => ({
      id: p.product_id,
      title: p.title,
      price: parseFloat(p.price_val),
      handle: p.handle,
      image: p.image,
      score: p.score || 0
    }));

    await saveChatTurn(session.id, userMessage, finalAiText, productsForDb);

    // 2. Save to Firebase
    await rtdb.ref(firebaseChatPath).push({
      sender: "ai",
      text: finalAiText,
      product_ids: recommendedProducts.map(p => p.product_id),
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