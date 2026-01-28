import { ActionFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { OpenAI } from "openai";
import { generateEmbeddings } from "app/services/pineconeService";
import { AISettingsState } from "./app.personality";
import { LoaderFunctionArgs } from "react-router";

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    product_id: string;
    title: string;
    price: string | number;
    inventory_status: string;
    handle: string;
    image: string;
    product_type?: string;
    vendor?: string;
    tags?: string[] | string;
    description?: string;
    [key: string]: any;
  };
}

// ============================================================================
// 2. CONFIGURATION
// ============================================================================

const openai = new OpenAI();
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

// ============================================================================
// 3. MAIN ACTION HANDLER (Shared core logic)
// ============================================================================

interface ChatResult {
  success: boolean;
  sessionId: string;
  responseType: "AI" | "KEYWORD" | "MANUAL_HANDOFF";
  userMessage: { role: "user"; content: string };
  assistantMessage: { role: "assistant"; content: string };
  products?: PineconeMatch[];
  performance?: { responseTime: number; productsFound: number };
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    // Step 1: Extract parameters
    const { shop, custMail } = params;
    console.log("shop", shop);
    console.log("custMail", custMail);
    // Step 2: Validate shop parameter
    if (!shop) {
      return { error: "Shop parameter is required" };
    }
    if (!custMail) {
      return { error: "Customer email is required" };
    }

    // Step 4: Resolve customer ID if email provided
    let customerId: string | null = null;
    if (custMail && custMail !== "guest") {
      const customer = await prisma.customer.findUnique({
        where: { shop_email: { shop: shop, email: custMail } },
      });
      customerId = customer?.id || null;
    }
    console.log("customerId", customerId);
    // Step 5: Fetch chat session
    let chatSession = null;

    if (customerId) {
      // Try to find session by ID
      chatSession = await prisma.chatSession.findFirst({
        where: { customerId: customerId, shop: shop },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          customer: true,
        },
      });

      // Verify session belongs to this shop (security check)
      if (chatSession && chatSession.shop !== shop) {
        return { error: "Invalid session" };
      }
    } 

    // Step 6: Return session data or empty response
    if (!chatSession) {
      return {
        session: null,
        messages: [],
        customer: null,
      };
    }

    return {
      session: {
        id: chatSession.id,
        shop: chatSession.shop,
        customerId: chatSession.customerId,
        isGuest: chatSession.isGuest,
      },
      messages: chatSession.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      customer: chatSession.customer,
    };
  } catch (error) {
    console.error("[LOADER] Error fetching chat history:", error);
    return { error: "Failed to fetch chat history" };
  }
};

// React-Router Action – handles HTTP POST /api/chat/:shop/:custMail
export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const { shop, custMail } = params;

    // Parse JSON body from client: { "message": "..." }
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      // If body is not valid JSON, treat as bad request
      return Response.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          errorMessage: "Request body must be valid JSON.",
        },
        { status: 400 },
      );
    }

    const userMessageContent =
      typeof body?.message === "string" ? body.message : undefined;

    if (!userMessageContent) {
      return Response.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          errorMessage: "Missing 'message' field in request body.",
        },
        { status: 400 },
      );
    }

    if (!shop || !custMail) {
      return Response.json(
        {
          success: false,
          error: "INVALID_ROUTE_PARAMS",
          errorMessage: "Both 'shop' and 'custMail' route params are required.",
        },
        { status: 400 },
      );
    }

    // Delegate to shared chat logic (also used by WebSocket server)
    const result = await processChat(shop, custMail, userMessageContent);

    return Response.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error("[HTTP Action Error]:", error);
    return Response.json(
      {
        success: false,
        error: "SYSTEM_ERROR",
        errorMessage: error?.message ?? "Unknown error",
      },
      { status: 500 },
    );
  }
};

export async function processChat(
  shop: string,
  custMail: string,
  userMessageContent: string,
): Promise<ChatResult> {
  const startTime = Date.now();

  try {
    if (!shop) throw new Error("Shop required");
    // Clean shop string if needed
    const cleanShop = shop;

    // --- A. LOAD CONTEXT ---
    const customer = await prisma.customer.findUnique({
      where: { shop_email: { shop: cleanShop, email: custMail } },
    });
    const customerId = customer?.id;

    const aiSettingsRecord = await prisma.aISettings.findUnique({
      where: { shop: cleanShop },
    });
    const aiSettingsData = (aiSettingsRecord?.settings ||
      {}) as unknown as AISettingsState;

    // --- B. SESSION MANAGEMENT ---
    let sessionId = "";
    let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (customerId) {
      const session = await prisma.chatSession.findFirst({
        where: { customerId: customerId, shop: cleanShop },
        include: { messages: { take: 8, orderBy: { createdAt: "desc" } } },
      });

      if (session) {
        sessionId = session.id;
        history = session.messages.reverse().map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
      } else {
        const newSession = await prisma.chatSession.create({
          data: { shop: cleanShop, customerId: customerId, isGuest: false },
        });
        sessionId = newSession.id;
      }
    }

    // --- C. DEFINE TOOLS & PROMPT ---
    const systemPrompt = buildSystemPrompt(aiSettingsData);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "recommend_products",
          description:
            "Search the store inventory. Use this to find products, prices, or details. WARNING: Do NOT use this for 'Order Tracking' or 'Buying'.",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description: "The product noun. Remove adjectives.",
              },
              max_price: { type: "number" },
              min_price: { type: "number" },
              sort: {
                type: "string",
                enum: ["price_asc", "price_desc", "relevance"],
              },
            },
            required: ["search_query"],
          },
        },
      },
    ];

    // --- D. FIRST AI CALL ---
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessageContent },
    ];

    const firstResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.4,
    });

    const choice = firstResponse.choices[0].message;
    let finalAiText = choice.content || "";
    let rawProducts: any[] = [];

    // --- E. TOOL EXECUTION ---
    if (choice.tool_calls) {
      messages.push(choice);

      for (const toolCall of choice.tool_calls) {
        if (toolCall.function.name === "recommend_products") {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`[AI-Core] Searching: "${args.search_query}"`);

          const matches = await searchPinecone(
            cleanShop,
            args.search_query,
            args.min_price,
            args.max_price,
            args.sort,
          );

          rawProducts = matches.map((m) => ({
            id: m.metadata.product_id,
            title: m.metadata.title,
            price:
              parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) || 0,
            handle: m.metadata.handle,
            image: m.metadata.image || "",
            score: m.score,
          }));

          const toolResultText = formatProductsForAI(rawProducts); // Using local helper logic
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResultText,
          });
        }
      }

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.4,
      });
      finalAiText = secondResponse.choices[0].message.content || "";
    }

    // --- F. SAVE & RETURN ---
    if (sessionId) {
      await prisma.message.createMany({
        data: [
          { sessionId, role: "user", content: userMessageContent },
          { sessionId, role: "assistant", content: finalAiText },
        ],
      });
    }

    return {
      success: true,
      sessionId: sessionId,
      responseType: "AI",
      userMessage: { role: "user", content: userMessageContent },
      assistantMessage: { role: "assistant", content: finalAiText },
      products: rawProducts,
      performance: {
        responseTime: Date.now() - startTime,
        productsFound: rawProducts.length,
      },
    };
  } catch (error: any) {
    console.error("[Core Logic Error]:", error);
    return {
      success: false,
      error: "SYSTEM_ERROR",
      errorMessage: error.message,
    };
  }
}

// ============================================================================
// 4. SMART SEARCH LOGIC (THE BRAIN)
// ============================================================================

async function searchPinecone(
  shop: string,
  query: string,
  minPrice?: number,
  maxPrice?: number,
  sort?: "price_asc" | "price_desc" | "relevance",
): Promise<PineconeMatch[]> {
  try {
    const namespace = shop.replace(/\./g, "_");
    const embedding = await generateEmbeddings([query]);

    if (!embedding || embedding.length === 0) return [];

    const response = await fetch(`https://${INDEX_HOST}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-Api-Version": "2025-10",
      },
      body: JSON.stringify({
        namespace: namespace,
        vector: embedding[0],
        topK: 60,
        includeMetadata: true,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!data.matches) return [];

    let matches = data.matches as PineconeMatch[];

    // --- QUERY ANALYSIS ---
    const lowerQuery = query.toLowerCase().trim();
    const isGeneric = [
      "items",
      "products",
      "stuff",
      "inventory",
      "goods",
      "gift",
      "gifts",
      "store",
      "everything",
      "shop",
      "sale",
    ].includes(lowerQuery);
    const hasSort = sort !== undefined && sort !== "relevance";
    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;

    matches = matches.filter((m) => {
      const combinedText =
        `${m.metadata.title} ${m.metadata.product_type} ${m.metadata.tags || ""}`.toLowerCase();

      // A. EXACT NAME BOOST
      if (
        m.metadata.title &&
        m.metadata.title.toLowerCase().includes(lowerQuery)
      ) {
        m.score = 0.99;
        return true;
      }

      // B. PRICE FILTERING
      const priceVal =
        parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) || 0;
      if (minPrice !== undefined && priceVal < minPrice) return false;
      if (maxPrice !== undefined && priceVal > maxPrice) return false;

      // C. KEYWORD ENFORCEMENT (Anti-Hallucination)
      if (!isGeneric && !hasSort && m.score < 0.85) {
        const queryWords = lowerQuery.split(" ").filter((w) => w.length > 3);
        const forbidden = [
          "cheap",
          "best",
          "good",
          "nice",
          "expensive",
          "sale",
        ];
        const validWords = queryWords.filter((w) => !forbidden.includes(w));

        if (validWords.length > 0) {
          const hasKeywordMatch = validWords.some((w) =>
            combinedText.includes(w),
          );
          if (!hasKeywordMatch) return false;
        }
      }

      // D. SEMANTIC THRESHOLDING
      const threshold = isGeneric || hasSort || hasPriceFilter ? 0.15 : 0.4;
      if (m.score < threshold) return false;

      return true;
    });

    // 3. SORTING
    if (sort === "price_asc") {
      matches.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "price_desc") {
      matches.sort((a, b) => getPrice(b) - getPrice(a));
    } else {
      matches.sort((a, b) => b.score - a.score);
    }

    return matches.slice(0, 5);
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

function getPrice(m: PineconeMatch): number {
  return parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) || 0;
}

function formatProductsForAI(products: PineconeMatch[]): string {
  if (products.length === 0)
    return "Result: No matching products found in inventory. Please apologize to the user.";

  return products
    .map((p) => {
      const title = p.metadata.title;
      const price = p.metadata.price;
      const desc = p.metadata.description
        ? p.metadata.description.substring(0, 300) + "..."
        : "No detailed description available.";
      const link = `/products/${p.metadata.handle}`;
      return `PRODUCT: ${title}\nPRICE: ${price}\nLINK: ${link}\nDETAILS: ${desc}\n---`;
    })
    .join("\n");
}

// ============================================================================
// 5. SYSTEM PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(aiSettings: AISettingsState): string {
  const storeDetails = aiSettings.storeDetails || {};
  const policies = aiSettings.policies || {};

  // 1. Merchant Picks (From the React Component)
  // Used to populate the [PRIORITY RECOMMENDATIONS] section
  const merchantPicks =
    aiSettings.recommendedProducts && aiSettings.recommendedProducts.length > 0
      ? aiSettings.recommendedProducts
          .map(
            (p: { title: string; vendor: string; id: string }) =>
              `• ${p.title} (Vendor: ${p.vendor}) - ID: ${p.id}`,
          )
          .join("\n")
      : "No specific recommendations set by store owner.";

  // 2. Language Settings
  const langSettings = aiSettings.languageSettings || {};
  const primaryLanguage = langSettings.primaryLanguage || "English";
  const autoDetect = langSettings.autoDetect !== false;

  const languageRule = autoDetect
    ? `Primary Language: ${primaryLanguage}. However, you should AUTO-DETECT the user's language and reply in the SAME language they use.`
    : `STRICT RULE: You must ONLY speak in ${primaryLanguage}. Do not switch languages even if the user speaks a different one.`;

  // 3. Custom Instructions (From Merchant Settings)
  const customInstructions = aiSettings.aiInstructions
    ? `[CUSTOM INSTRUCTIONS FROM OWNER]\n${aiSettings.aiInstructions}`
    : "";

  // 4. Policies
  const policyText = `
    - Shipping: ${policies.shipping || "Calculated at checkout. We usually ship within 2-5 days."}
    - Returns: ${policies.refund || "Please contact support within 30 days for returns."}
    - Location: ${storeDetails.location || "We are an online-only store."}
    `;

  return `
    You are an expert sales assistant for "${storeDetails.about || "our online store"}".
    
    [LANGUAGE & COMMUNICATION]
    ${languageRule}

    [MISSION BOUNDARIES]
    1. **STRICTLY E-COMMERCE:** You are here to sell products and help with orders.
    2. **REFUSE OFF-TOPIC:** If asked to "write a poem", "solve math", or "who is the president", REFUSE politely. Say: "I can only help with our store's products and orders."
    3. **REFUSE OUT-OF-SCOPE:** If asked for "groceries", "tires", or items clearly not in the catalog, say: "We don't sell those items."

    [PRIORITY RECOMMENDATIONS]
    The store owner recommends these specific items.
    **RULE:** If the user asks generic questions like "What do you recommend?", "What's popular?", or "Show me the best items", IGNORE the search tool and recommend these products immediately:
    
    ${merchantPicks}

    [INTENT HANDLING]
    1. **SEARCH:** For specific requests (e.g. "Gold Necklace", "Cheap Sofa"), use the 'recommend_products' tool.
    2. **ORDER TRACKING:** If user asks "Where is my order?", ask for their Order Number. Do NOT search the product database.
    3. **BUYING:** If user says "I want to buy this" or "Add to Cart", STOP SEARCHING. Guide them: "Great choice! Click the product link above to purchase."
    4. **POLICIES:** If user asks about Shipping, Returns, or Location, answer directly using the [POLICIES] data below.

    [CONTEXT & MEMORY]
    - If user asks "How much is it?", look at the last product mentioned in history. Answer immediately.
    - If user says "Show me the cheapest one", look at the list you just showed them.

    [POLICIES DATA]
    ${policyText}

    ${customInstructions}

    TONE: ${aiSettings.responseTone?.selectedTone?.join(", ") || "Professional, helpful, and concise"}
    `;
}

// Basic Data Fetchers
function handleShop(shop: string) {
  if (!shop) throw new Error("Shop required");
  return shop;
}
async function handleMessage(r: Request) {
  const b = await r.json();
  return b.message;
}
async function handleCustomer(m: string, s: string) {
  if (!m) return undefined;
  const c = await prisma.customer.findUnique({
    where: { shop_email: { shop: s, email: m } },
  });
  return c?.id;
}
async function handleAISettings(s: string) {
  return await prisma.aISettings.findUnique({ where: { shop: s } });
}
async function getRemainingCredits(s: string) {
  const c = await prisma.merchantCredits.findUnique({ where: { shop: s } });
  return c ? c.totalCredits - c.usedCredits : 0;
}
