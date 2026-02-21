import { ChatVertexAI } from "@langchain/google-vertexai";
import { HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatConfiguration } from "@prisma/client";
import prisma from "../../db.server";
import { searchPinecone } from "../search/pinecone.service";
import { PineconeMatch } from "../../types/chat.types";
import { SYSTEM_INSTRUCTION_BASE } from "./orchestrator";
import { fetchStoreContext } from "../context.server";
import { rtdb } from "../firebaseAdmin.server";

// ============================================================================
// CAMPAIGN SYNONYM MAPPING
// ============================================================================

/**
 * Synonym mapping for system campaigns to improve keyword matching.
 * These synonyms are checked in addition to the database trigger keywords.
 */
const CAMPAIGN_SYNONYMS: Record<string, string[]> = {
  "Best Sellers": [
    "best seller", "best selling", "bestseller", "bestselling",
    "popular", "popular items", "popular products",
    "trending", "trending items", "trending products",
    "top rated", "top selling", "most popular",
    "hot items", "hot products", "favorites", "favourite", "favourites"
  ],
  "New Arrivals": [
    "new", "new arrival", "new arrivals", "new items", "new products",
    "fresh", "fresh items", "fresh products",
    "just in", "just arrived",
    "latest", "latest items", "latest products",
    "recent", "recently added", "newest"
  ]
};

/**
 * Enhanced keyword matching function that checks:
 * 1. Database trigger keywords
 * 2. System campaign synonyms (if applicable)
 * 3. Word boundary matching for accuracy
 * 
 * @param userMessage - The user's message to check
 * @param campaignName - Name of the campaign (e.g., "Best Sellers")
 * @param triggerKeywords - Keywords from the database
 * @returns true if the message matches any trigger or synonym
 */
function matchesCampaignKeywords(
  userMessage: string,
  campaignName: string,
  triggerKeywords: string[]
): boolean {
  const normalizedMessage = userMessage.toLowerCase().trim();

  // 1. Check database trigger keywords (word boundary match preferred)
  const sanitizedTriggers = triggerKeywords.map(k => k.trim()).filter(k => k !== "");
  const synonyms = (CAMPAIGN_SYNONYMS[campaignName] || []).map(s => s.trim()).filter(s => s !== "");
  
  const allKeywords = [...sanitizedTriggers, ...synonyms];
  
  // Word boundary matching for better accuracy
  // Match "popular" in "show me popular items" but not in "unpopular"
  const match = allKeywords.some(keyword => {
    // Escape special regex characters in keyword
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(normalizedMessage);
  });
  
  return match;
}

// ============================================================================
// TOOLS DEFINITION
// ============================================================================

export class LangChainService {
  private shop: string;
  private model: ChatVertexAI;

  constructor(shop: string) {
    this.shop = shop;

    const authOptions = {
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
    };

    this.model = new ChatVertexAI({
      model: "gemini-2.0-flash-001",
      temperature: 1.0,
      maxOutputTokens: 2048,
      authOptions: authOptions, // Pass auth options here
      location: "us-central1",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
  }

  // ============================================================================
  // TOOL FACTORY
  // ============================================================================
  
  private async createTools(config: ChatConfiguration, sessionId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: any[] = [];

    // 0. HUMAN HANDOFF
    tools.push(new DynamicStructuredTool({
      name: "request_human_support",
      description: "Call this tool IMMEDIATELY if the user asks to speak to a human, a real person, an agent, or support. This will pause the AI and alert a human staff member.",
      schema: z.object({
        reason: z.string().describe("The reason the user wants human support."),
      }),
      func: async ({ reason }: { reason: string }) => {
        try {
            const safeShop = this.shop.replace(/\./g, "_");
            const metaPath = `chats/${safeShop}/${sessionId}/metadata`;
            
            await rtdb.ref(metaPath).update({
                isHumanSupport: true,
                humanRequestedAt: Date.now(),
                handoffReason: reason
            });

            return "I have submitted your request. A human agent will join the chat shortly. Please wait.";
        } catch (error) {
            console.error("Human Handoff Error:", error);
            return "I'm having trouble connecting you to a human right now. Please try contacting us via email.";
        }
      },
    }));

    // 1. PRODUCT SEARCH
    tools.push(new DynamicStructuredTool({
      name: "recommend_products",
      description: "Call this tool if the user asks for a product recommendation, searches for a specific product, or asks for 'Best Sellers' or 'New Arrivals'. Do NOT call this for general greetings.",
      schema: z.object({
        search_query: z.string().describe("The user's search query. If user asks for 'New Arrivals' or 'Best Sellers' without a specific product type, pass an empty string."),
        min_price: z.number().optional(),
        max_price: z.number().optional(),
        sort: z.enum(["relevance", "price_asc", "price_desc", "best_selling", "newest"]).optional(),
      }),
      func: async ({ search_query, min_price, max_price, sort }: { search_query: string, min_price?: number, max_price?: number, sort?: "relevance" | "price_asc" | "price_desc" | "best_selling" | "newest" }) => {
        try {
          const results = await searchPinecone(this.shop, search_query, min_price, max_price, sort);
          // Map to simpler format
          const products = results.matches.map((m: PineconeMatch) => ({
            id: m.metadata?.product_id,
            title: m.metadata?.title,
            price: m.metadata?.price_val,
            handle: m.metadata?.handle,
            image: m.metadata?.image,
            similarity: m.score
          }));
          return JSON.stringify(products);
        } catch (error) {
          console.error("Product Search Error:", error);
          return "Error searching for products.";
        }
      },
    }));

    // 2. FAQ SEARCH
    tools.push(new DynamicStructuredTool({
      name: "search_faq",
      description: "Search for answers to general questions in the store's FAQ database, or specific questions about products.",
      schema: z.object({
        query: z.string().describe("The user's question"),
      }),
      func: async ({ query }) => {
          if (!config.faqEnabled) {
              const profile = await prisma.storeProfile.findUnique({ where: { shop: this.shop } }) as any;
              return `FAQ information is currently restricted. Please advise the user to contact support at ${profile?.supportEmail || "our support team"}.`;
          }

          const storeFaqs = await prisma.fAQ.findMany({
              where: { 
                  shop: this.shop,
                  isActive: true,
                  OR: [
                      { question: { contains: query, mode: "insensitive" } },
                      { answer: { contains: query, mode: "insensitive" } }
                  ]
              },
              take: 3
          });
          
          const productFaqs = await prisma.productFAQ.findMany({
              where: {
                  product: { shop: this.shop },
                  OR: [
                      { question: { contains: query, mode: "insensitive" } },
                      { answer: { contains: query, mode: "insensitive" } }
                  ]
              },
              include: { product: true },
              take: 3
          });

          if (storeFaqs.length === 0 && productFaqs.length === 0) return "No specific FAQ found. Try valid general knowledge.";
          
          const formattedStoreFaqs = storeFaqs.map(f => ({ type: "Store FAQ", question: f.question, answer: f.answer }));
          const formattedProductFaqs = productFaqs.map(f => ({ type: `Product FAQ for ${f.product.title}`, question: f.question, answer: f.answer }));

          return JSON.stringify([...formattedStoreFaqs, ...formattedProductFaqs]);
      },
    }));

    // 3. DISCOUNT CHECK
    tools.push(new DynamicStructuredTool({
        name: "get_active_discounts",
        description: "Check for active discount codes available for the customer.",
        schema: z.object({}),
        func: async () => {
            if (!config.discountSuggestionsEnabled) {
                const profile = await prisma.storeProfile.findUnique({ where: { shop: this.shop } }) as any;
                return `Discounts are currently restricted. Please advise the user to contact support at ${profile?.supportEmail || "our support team"}.`;
            }
            const discounts = await prisma.discount.findMany({
                where: { 
                    shop: this.shop, 
                    status: "ACTIVE",
                    isSuggested: true // key flag
                }
            });
            if (discounts.length === 0) return "No active discounts available to suggest.";
            return JSON.stringify(discounts.map(d => ({ code: d.code, title: d.title })));
        }
    }));
    
    // 4. ORDER TRACKING
    tools.push(new DynamicStructuredTool({
        name: "track_order",
        description: "Get the status of an order using the order number.",
        schema: z.object({
            order_number: z.string().describe("The order number (e.g., #1001 or 1001)")
        }),
        func: async ({ order_number }) => {
            // TODO: Query Shopify API directly or use an alternative
            // Prisma Order table was deleted
            return "Order tracking is currently unavailable.";
        }
    }));

    // 5. PRODUCT DETAILS (For deep comparison/info)
    tools.push(new DynamicStructuredTool({
        name: "get_product_details",
        description: "Get detailed information about a specific product using its ID, handle, or title. Use this when the user asks for 'more info', 'specifications', or when querying a specific product by name.",
        schema: z.object({
            product_id: z.string().optional().describe("The Shopify GID of the product (e.g., gid://shopify/Product/12345)"),
            handle: z.string().optional().describe("The handle (URL slug) of the product"),
            title: z.string().optional().describe("The title or name of the product")
        }),
        func: async ({ product_id, handle, title }) => {
            if (!product_id && !handle && !title) return "Please provide a product ID, handle, or title.";
            
            const product = await prisma.product.findFirst({
                where: {
                    shop: this.shop,
                    OR: [
                        product_id ? { prodId: product_id } : {},
                        handle ? { handle: handle } : {},
                        title ? { title: { contains: title, mode: 'insensitive' } } : {}
                    ].filter(cond => Object.keys(cond).length > 0) as any
                },
                include: { variants: true, faqs: true }
            });

            if (!product) return "Product not found.";

            return JSON.stringify({
                title: product.title,
                description: product.description,
                tags: product.tags,
                price: product.price,
                options: product.options,
                variants: product.variants.map(v => ({
                    title: v.title,
                    stock: v.stock,
                    option: v.option
                })),
                faqs: product.faqs.map(f => ({
                    question: f.question,
                    answer: f.answer
                }))
            });
        }
    }));

    // 6. STORE POLICIES
    tools.push(new DynamicStructuredTool({
        name: "get_store_policies",
        description: "Get the store's shipping, refund, privacy, or terms of service policies. Use 'All' to summarize all policies.",
        schema: z.object({
            policy_type: z.enum(["Refund", "Privacy", "Shipping", "Terms of Service", "All"]).describe("The specific policy to retrieve.")
        }),
        func: async ({ policy_type }) => {
            if (!config.faqEnabled) {
                const profile = await prisma.storeProfile.findUnique({ where: { shop: this.shop } }) as any;
                return `Policy information is currently restricted. Please advise the user to contact support at ${profile?.supportEmail || "our support team"}.`;
            }

            const policies = await prisma.storePolicy.findMany({
                where: { shop: this.shop }
            });

            if (policies.length === 0) return "No policies are currently configured for this store.";

            if (policy_type === "All") {
                return JSON.stringify(policies.map(p => ({ title: p.title, body: p.body })));
            }

            const policy = policies.find(p => p.type === policy_type || p.title.includes(policy_type));
            if (!policy) return `The ${policy_type} policy was not found.`;

            return JSON.stringify({ title: policy.title, body: policy.body });
        }
    }));

    // 7. STORE PROFILE
    tools.push(new DynamicStructuredTool({
        name: "get_store_profile",
        description: "Get information about the store's brand, story, location, and contact email.",
        schema: z.object({}),
        func: async () => {
            const profile = await prisma.storeProfile.findUnique({
                where: { shop: this.shop }
            }) as any;
            if (!profile) return "No store profile information available.";
            
            return JSON.stringify({
                story: profile.story,
                location: profile.location,
                storeType: profile.storeType,
                supportEmail: profile.supportEmail
            });
        }
    }));

    return tools;
  }

  // ============================================================================
  // MAIN GENERATION
  // ============================================================================

  private async getChatContext(
    sessionId: string,
    userMessage: string,
    history: { role: string; content: string; recommendedProducts?: any[] }[] = [],
    previewSettings?: any
  ) {
    // 1. Load Config & Context
    const config = await prisma.chatConfiguration.findUnique({ 
        where: { shop: this.shop } 
    }) || { 
        id: "default",
        shop: this.shop,
        faqEnabled: true, 
        campaignsEnabled: true, 
        discountSuggestionsEnabled: true,
        aiEnabled: true,
        autoHandoffEnabled: true,
        useKeywordResponses: true,
        maxTokensPerResponse: 500,
        maxConcurrentRequests: 5,
        rateLimitPerMinute: 60,
        fallbackMessage: null,
        manualChatNotification: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    if (!config.aiEnabled) {
        throw new Error("AI Support is currently disabled.");
    }

    // 1.1 Fetch Merchant Specific AI Settings
    const aiSettingsRecord = await prisma.aISettings.findUnique({
      where: { shop: this.shop }
    });
    const savedSettings = (aiSettingsRecord?.settings as any) || {};
    const aiSettings = previewSettings ? { ...savedSettings, ...previewSettings } : savedSettings;

    const assistantName = aiSettings.storeDetails?.about ? `${aiSettings.storeDetails.about} Assistant` : "Helpful Store Assistant";
    const persona = aiSettings.responseTone?.customInstructions || "Expert sales associate";
    const customInstructions = aiSettings.aiInstructions || "";
    const responseTone = aiSettings.responseTone?.selectedTone?.join(", ") || "Helpful, Professional";
    const autoDetect = aiSettings.languageSettings?.autoDetect === true;
    const languageInstruction = autoDetect ? 
        "ALWAYS respond in English, regardless of the user's language." : 
        `ALWAYS respond in ${aiSettings.languageSettings?.primaryLanguage || "English"}, regardless of the user's language.`;

    // 2. Check CAMPAIGNS (Trigger Keywords)
    let campaignContext = "";
    let recommendedProducts: any[] = [];

    if (config.campaignsEnabled) {
        const campaigns = await prisma.campaign.findMany({
            where: { shop: this.shop, isActive: true },
            include: { products: { include: { Product: true } } }
        });
        
        for (const camp of campaigns) {
            const triggers = camp.triggerKeywords;
            if (matchesCampaignKeywords(userMessage, camp.name, triggers)) {
                const campaignProducts = camp.products.map(cp => ({
                    id: cp.Product.prodId,
                    title: cp.Product.title,
                    price: cp.Product.price,
                    handle: cp.Product.handle || undefined,
                    image: cp.Product.image || undefined,
                    score: 1.0
                }));
                recommendedProducts = [...recommendedProducts, ...campaignProducts];
                campaignContext += `\n[SYSTEM ALERT: USER MATCHED CAMPAIGN "${camp.name}"]\n`;
                if (camp.responseMessage) {
                    campaignContext += `The merchant prefers this message for this campaign: "${camp.responseMessage}"\n`;
                }
                campaignContext += `Associated Products:\n${camp.products.map(cp => {
                     return `- ${cp.Product.title} (Price: $${cp.Product.price})\n  Description: ${cp.Product.description || "N/A"}\n  Available Options: ${JSON.stringify(cp.Product.options || [])}`
                }).join("\n")}\n`;
                campaignContext += `INSTRUCTION: Acknowledge these products naturally. Do NOT use tool "recommend_products" again for this specific intent.`;
            }
        }
    }

    // 3. Prepare Tools
    const tools = await this.createTools(config, sessionId);

    // 4. Prepare Context
    const storeContext = await fetchStoreContext(this.shop);
    const systemPrompt = `
      ${SYSTEM_INSTRUCTION_BASE}
      
      [MERCHANT SETTINGS]
      Assistant Name: ${assistantName}
      Persona: ${persona}
      Tone of Voice: ${responseTone}
      Language Rule: ${languageInstruction}
      Custom Instructions: ${customInstructions}

      [STORE CONTEXT]
      ${storeContext}

      [ADDITIONAL MERCHANT INFO]
      Use the provided tools ('get_store_profile', 'get_store_policies', 'search_faq') to fetch store profile information, policies, and FAQs dynamically as needed. Do NOT guess.

      ${campaignContext ? `\n[ONGOING CAMPAIGN CONTEXT]\n${campaignContext}\n` : ""}

      IMPORTANT:
      - You are ${assistantName}.
      - Persona: ${persona}. Tone: ${responseTone}.
      - ${languageInstruction}
      - Use available tools. If products are found, mention them naturally.
      - Keep responses concisely formatted per the Global Formatting Rules.
    `;

    // 5. Build Message History
    const formattedHistory: BaseMessage[] = [];
    history.forEach(m => {
        let content = m.content;
        if (m.role === "user") {
            formattedHistory.push(new HumanMessage(content));
        } else {
            if (m.recommendedProducts && m.recommendedProducts.length > 0) {
                const productStrings = m.recommendedProducts.map((p: any) => 
                    `ID: ${p.id || p.productProdId}, Title: ${p.title}, Price: $${p.price}`
                ).join(" | ");
                content += `\n\n[INTERNAL RECORD: You rendered cards for: ${productStrings}. Do not mention this internal record.]`;
            }
            formattedHistory.push(new AIMessage(content));
        }
    });
    console.log("[SYSTEM PROMPT]", systemPrompt);
    console.log("[FORMATTED HISTORY]", formattedHistory);
    console.log("[USER MESSAGE]", userMessage);
    const messages: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        ...formattedHistory,
        new HumanMessage(userMessage)
    ];

    return { messages, tools, recommendedProducts, config };
  }

  async generateResponse(
    sessionId: string,
    userMessage: string,
    history: { role: string; content: string; recommendedProducts?: any[] }[] = [],
    previewSettings?: any
  ) {
    const { messages, tools, recommendedProducts: campaignProducts } = await this.getChatContext(sessionId, userMessage, history, previewSettings);
    let recommendedProducts = [...campaignProducts];
    const modelWithTools = this.model.bindTools(tools);

    let finalResponse: any;
    try {
        finalResponse = await modelWithTools.invoke(messages);
    } catch (err: any) {
        // Fallback for Gemini invoke errors
        console.warn("[LangChain] First Invoke Error:", err.message);
        finalResponse = new AIMessage("I'm sorry, I'm having a little trouble. How else can I help?");
    }
    
    // Handle Tool Calls turn if present
    if (finalResponse.tool_calls && finalResponse.tool_calls.length > 0) {
        const toolMessages: ToolMessage[] = [];
        for (const toolCall of finalResponse.tool_calls) {
            const tool = tools.find(t => t.name === toolCall.name);
            if (tool) {
                const result = await tool.func(toolCall.args);
                if (toolCall.name === "recommend_products") {
                    try {
                        const parsed = JSON.parse(result);
                        if (Array.isArray(parsed)) {
                            const newProducts = parsed.map((p: any) => ({
                                id: p.id || p.metadata?.product_id,
                                title: p.title || p.metadata?.title,
                                price: p.price || p.metadata?.price,
                                handle: p.handle || p.metadata?.handle,
                                image: p.image || p.metadata?.image,
                                score: p.score || 0
                            }));
                            const existingIds = new Set(recommendedProducts.map(rp => rp.id));
                            for (const np of newProducts) {
                                if (!existingIds.has(np.id)) {
                                    recommendedProducts.push(np);
                                }
                            }
                        }
                    } catch (e) {}
                }
                toolMessages.push(new ToolMessage({ tool_call_id: toolCall.id!, content: result, name: toolCall.name }));
            }
        }
        finalResponse = await modelWithTools.invoke([...messages, finalResponse, ...toolMessages]);
    }

    return {
        text: typeof finalResponse.content === "string" ? finalResponse.content : JSON.stringify(finalResponse.content),
        recommendedProducts
    };
  }

  async *generateStreamingResponse(
    sessionId: string,
    userMessage: string,
    history: { role: string; content: string; recommendedProducts?: any[] }[] = [],
    previewSettings?: any
  ): AsyncGenerator<{ type: "text" | "metadata"; content: any }> {
    let context;
    try {
        context = await this.getChatContext(sessionId, userMessage, history, previewSettings);
    } catch (err: any) {
        yield { type: "text", content: err.message };
        return;
    }
    const { messages, tools, recommendedProducts: campaignProducts } = context;
    let recommendedProducts = [...campaignProducts];
    const modelWithTools = this.model.bindTools(tools);

    let finalResponse = await modelWithTools.invoke(messages);

    if (finalResponse.tool_calls && finalResponse.tool_calls.length > 0) {
        const toolMessages: ToolMessage[] = [];
        for (const toolCall of finalResponse.tool_calls) {
            const tool = tools.find(t => t.name === toolCall.name);
            if (tool) {
                const result = await tool.func(toolCall.args);
                if (toolCall.name === "recommend_products") {
                    try {
                        const parsed = JSON.parse(result);
                        if (Array.isArray(parsed)) {
                            const newProducts = parsed.map((p: any) => ({
                                id: p.id || p.metadata?.product_id,
                                title: p.title || p.metadata?.title,
                                price: p.price || p.metadata?.price,
                                handle: p.handle || p.metadata?.handle,
                                image: p.image || p.metadata?.image,
                                score: p.score || 0
                            }));
                            const existingIds = new Set(recommendedProducts.map(rp => rp.id));
                            for (const np of newProducts) {
                                if (!existingIds.has(np.id)) {
                                    recommendedProducts.push(np);
                                }
                            }
                        }
                    } catch (e) {}
                }
                toolMessages.push(new ToolMessage({ tool_call_id: toolCall.id!, content: result, name: toolCall.name }));
            }
        }
        
        const stream = await modelWithTools.stream([...messages, finalResponse, ...toolMessages]);
        for await (const chunk of stream) {
            if (chunk.content) yield { type: "text", content: chunk.content };
        }
    } else {
        if (typeof finalResponse.content === "string") {
            const words = finalResponse.content.split(" ");
            for (const word of words) {
                yield { type: "text", content: word + " " };
                await new Promise(r => setTimeout(r, 10)); // Natural feel
            }
        } else {
            yield { type: "text", content: JSON.stringify(finalResponse.content) };
        }
    }

    yield { type: "metadata", content: { recommendedProducts } };
  }
}
