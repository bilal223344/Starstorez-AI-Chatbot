import { ActionFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { OpenAI } from "openai";
import { generateEmbeddings } from "app/services/pineconeService";
import { AISettingsState } from "./app.personality";

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
// 3. MAIN ACTION HANDLER
// ============================================================================

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const startTime = Date.now();

  try {
    const { shop, custMail } = params;
    const cleanShop = handleShop(shop as string);
    const userMessageContent = await handleMessage(request);

    // --- A. LOAD CONTEXT ---
    const customerId = await handleCustomer(custMail as string, cleanShop);
    const aiSettingsRecord = await handleAISettings(cleanShop);
    const aiSettingsData = (aiSettingsRecord?.settings ||
      {}) as unknown as AISettingsState;

    // --- B. SESSION MANAGEMENT (MEMORY) ---
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

    // --- C. DEFINE AI TOOLS & PROMPT ---
    // We inject Language, Custom Instructions, and Merchant Picks here
    const systemPrompt = buildSystemPrompt(aiSettingsData);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "recommend_products",
          description:
            "Search the store inventory. Use this to find specific products, categories, or check prices. WARNING: Do NOT use this for 'Order Tracking' or 'Buying'.",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description:
                  "The product noun (e.g. 'necklace', 'sofa'). Remove adjectives like 'cheap'.",
              },
              max_price: {
                type: "number",
                description: "Filter items below this price.",
              },
              min_price: {
                type: "number",
                description: "Filter items above this price.",
              },
              sort: {
                type: "string",
                enum: ["price_asc", "price_desc", "relevance"],
                description:
                  "Use 'price_asc' for cheap/lowest, 'price_desc' for expensive/highest.",
              },
            },
            required: ["search_query"],
          },
        },
      },
    ];

    // --- D. FIRST AI CALL (DECISION MAKER) ---
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

    // --- E. TOOL EXECUTION & DATA PROCESSING ---
    let finalAiText = choice.content || "";
    let rawProducts: any[] = [];

    if (choice.tool_calls) {
      messages.push(choice);

      for (const toolCall of choice.tool_calls) {
        if (toolCall.function.name === "recommend_products") {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(
            `[AI] Searching: "${args.search_query}" | Sort: ${args.sort}`,
          );

          // 1. Run Smart Search
          const matches = await searchPinecone(
            cleanShop,
            args.search_query,
            args.min_price,
            args.max_price,
            args.sort,
          );

          // 2. Format Data for JSON Response (Frontend)
          rawProducts = matches.map((m) => {
            const safePrice =
              parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) || 0;
            return {
              id: m.metadata.product_id,
              title: m.metadata.title,
              price: safePrice,
              handle: m.metadata.handle,
              image: m.metadata.image || "",
              score: m.score,
            };
          });

          // 3. Format Data for AI Context (Text only)
          const toolResultText = formatProductsForAI(rawProducts);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResultText,
          });
        }
      }

      // --- F. SECOND AI CALL (FINAL ANSWER) ---
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.4,
      });

      finalAiText = secondResponse.choices[0].message.content || "";
    }

    // --- G. SAVE CHAT TO DB ---
    if (sessionId) {
      await prisma.message.createMany({
        data: [
          { sessionId, role: "user", content: userMessageContent },
          { sessionId, role: "assistant", content: finalAiText },
        ],
      });
    }

    // --- H. RETURN RESPONSE ---
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
  } catch (error) {
    console.error("[API] Error:", error);
    return {
      success: false,
      error: "SYSTEM_ERROR",
      errorMessage: "An error occurred while processing your request.",
    };
  }
};

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
            (p: { title: string; vendor: string; id: string }) => `• ${p.title} (Vendor: ${p.vendor}) - ID: ${p.id}`,
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
