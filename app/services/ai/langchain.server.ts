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
  
  // 1. Check database trigger keywords (simple substring match)
  const dbMatch = triggerKeywords.some(keyword => 
    normalizedMessage.includes(keyword.toLowerCase())
  );
  if (dbMatch) return true;
  
  // 2. Check system campaign synonyms
  const synonyms = CAMPAIGN_SYNONYMS[campaignName];
  if (synonyms) {
    const synonymMatch = synonyms.some(synonym => 
      normalizedMessage.includes(synonym.toLowerCase())
    );
    if (synonymMatch) return true;
  }
  
  // 3. Word boundary matching for better accuracy
  // Match "popular" in "show me popular items" but not in "unpopular"
  const allKeywords = [...triggerKeywords, ...(synonyms || [])];
  const wordBoundaryMatch = allKeywords.some(keyword => {
    // Escape special regex characters in keyword
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(normalizedMessage);
  });
  
  return wordBoundaryMatch;
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

    // 2. FAQ SEARCH (If Enabled)
    if (config.faqEnabled) {
      tools.push(new DynamicStructuredTool({
        name: "search_faq",
        description: "Search for answers to general questions in the store's FAQ database.",
        schema: z.object({
          query: z.string().describe("The user's question"),
        }),
        func: async ({ query }) => {
            // Simple keyword search for now, ideally semantic if embeddings existed for FAQs
            const faqs = await prisma.fAQ.findMany({
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
            if (faqs.length === 0) return "No specific FAQ found. Try valid general knowledge.";
            return JSON.stringify(faqs.map(f => ({ question: f.question, answer: f.answer })));
        },
      }));
    }

    // 3. DISCOUNT CHECK (If Enabled)
    if (config.discountSuggestionsEnabled) {
        tools.push(new DynamicStructuredTool({
            name: "get_active_discounts",
            description: "Check for active discount codes available for the customer.",
            schema: z.object({}),
            func: async () => {
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
    }
    
    // 4. ORDER TRACKING
    tools.push(new DynamicStructuredTool({
        name: "track_order",
        description: "Get the status of an order using the order number.",
        schema: z.object({
            order_number: z.string().describe("The order number (e.g., #1001 or 1001)")
        }),
        func: async ({ order_number }) => {
            const order = await prisma.order.findFirst({
                where: { 
                    Customer: { shop: this.shop },
                    orderNumber: { contains: order_number } // loose match
                }
            });
            if (!order) return "Order not found.";
            return JSON.stringify({ status: order.status, total: order.totalPrice });
        }
    }));

    // 5. PRODUCT DETAILS (For deep comparison/info)
    tools.push(new DynamicStructuredTool({
        name: "get_product_details",
        description: "Get detailed information about a specific product using its ID or handle. Use this when the user asks for 'more info', 'specifications', or when comparing specific products.",
        schema: z.object({
            product_id: z.string().optional().describe("The Shopify GID of the product (e.g., gid://shopify/Product/12345)"),
            handle: z.string().optional().describe("The handle (URL slug) of the product")
        }),
        func: async ({ product_id, handle }) => {
            if (!product_id && !handle) return "Please provide either a product ID or a handle.";
            
            const product = await prisma.product.findFirst({
                where: {
                    shop: this.shop,
                    OR: [
                        product_id ? { prodId: product_id } : {},
                        handle ? { handle: handle } : {}
                    ].filter(cond => Object.keys(cond).length > 0) as any
                },
                include: { variants: true }
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
                }))
            });
        }
    }));

    return tools;
  }

  // ============================================================================
  // MAIN GENERATION
  // ============================================================================

  async generateResponse(
    sessionId: string,
    userMessage: string,
    history: { role: string; content: string }[] = []
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
        return { text: "AI Support is currently disabled.", recommendedProducts: [] };
    }

    // 1.1 Fetch Merchant Specific AI Settings
    const aiSettingsRecord = await prisma.aISettings.findUnique({
      where: { shop: this.shop }
    });
    const aiSettings = (aiSettingsRecord?.settings as unknown as import("../../routes/app.personality").AISettingsState) || {} as import("../../routes/app.personality").AISettingsState;

    const assistantName = aiSettings.storeDetails?.about ? `${aiSettings.storeDetails.about} Assistant` : "Helpful Store Assistant";
    const persona = aiSettings.responseTone?.customInstructions || "Expert sales associate";
    const customInstructions = aiSettings.aiInstructions || "";
    const responseTone = aiSettings.responseTone?.selectedTone?.join(", ") || "Helpful, Professional";
    const primaryLanguage = aiSettings.languageSettings?.primaryLanguage || "English";

    // 2. Check CAMPAIGNS (Trigger Keywords) - Bypass LLM if match
    if (config.campaignsEnabled) {
        const campaigns = await prisma.campaign.findMany({
            where: { shop: this.shop, isActive: true },
            include: { products: { include: { Product: true } } }
        });
        
        for (const camp of campaigns) {
            // Use enhanced matching with synonyms and word boundaries
            const triggers = camp.triggerKeywords;
            const match = matchesCampaignKeywords(userMessage, camp.name, triggers);
            
            if (match && camp.responseMessage) {
                // Fetch campaign products
                const campaignProducts = camp.products.map(cp => ({
                    id: cp.Product.prodId,
                    title: cp.Product.title,
                    price: cp.Product.price,
                    handle: cp.Product.handle || undefined,
                    image: cp.Product.image || undefined,
                    score: 1.0
                }));

                return { text: camp.responseMessage, recommendedProducts: campaignProducts };
            }
        }
    }

    // 3. Prepare Tools
    const tools = await this.createTools(config, sessionId);
    const modelWithTools = this.model.bindTools(tools);

    // 4. Prepare Context
    const storeContext = await fetchStoreContext(this.shop);
    const systemPrompt = `
      ${SYSTEM_INSTRUCTION_BASE}
      
      [MERCHANT SETTINGS]
      Assistant Name: ${assistantName}
      Persona: ${persona}
      Tone of Voice: ${responseTone}
      Primary Language: ${primaryLanguage}
      Custom Instructions: ${customInstructions}

      [STORE CONTEXT]
      ${storeContext}

      [ADDITIONAL MERCHANT INFO]
      ${aiSettings.storeDetails?.location ? `Location: ${aiSettings.storeDetails.location}` : ""}
      ${aiSettings.policies?.shipping ? `Shipping Policy: ${aiSettings.policies.shipping}` : ""}
      ${aiSettings.policies?.payment ? `Payment Policy: ${aiSettings.policies.payment}` : ""}
      ${aiSettings.policies?.refund ? `Refund Policy: ${aiSettings.policies.refund}` : ""}

      IMPORTANT:
      - You are ${assistantName}.
      - Your persona is: ${persona}.
      - Your tone should be ${responseTone}.
      - Respond ONLY in ${primaryLanguage} unless the user switches language, then adapt naturally but stay helpful.
      - ${customInstructions ? `Follow these specific instructions: ${customInstructions}` : ""}
      - Use the available tools to answer questions.
      - If you find products, listing them in the response text is optional but sending the data is crucial.
      - Keep responses concise and friendly.
      - Do NOT recommend products unless the user explicitly asks for them or it's highly relevant.
      - If you don't know the answer based on the tools and context, politely say so.
    `;

    // 5. Build Message History
    const messages: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        ...history.map(m => m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)),
        new HumanMessage(userMessage)
    ];

    console.log(`[LangChain] Invoking model with ${messages.length} messages. User Query: "${userMessage}"`);

    // 6. Invoke Model
    // We implement a simple ReAct loop (invoke -> check tool calls -> invoke with results)
    let finalResponse: any;
    try {
        finalResponse = await modelWithTools.invoke(messages);
        console.log(`[LangChain] Model response received. Content type: ${typeof finalResponse.content}, Tool calls: ${finalResponse.tool_calls?.length || 0}`);
    } catch (err: any) {
        // Handle a known LangChain/Gemini bug where empty responses cause a TypeError inside ChatVertexAI.invoke
        if (err instanceof TypeError && (err.message.includes("reading 'message'") || err.message.includes("reading '0'"))) {
            console.warn("[LangChain] Caught internal TypeError in invoke(). Likely empty response or content filtering. Attempting fallback...");
            
            // Fallback: try to get a response even if it's empty, or return a polite error message
            // We use the raw model if binding failed us
            try {
                const fallbackResult = await this.model.generate([messages], { tools });
                if (fallbackResult.generations[0] && fallbackResult.generations[0].length > 0) {
                    finalResponse = (fallbackResult.generations[0][0] as any).message;
                    console.log("[LangChain] Fallback generation succeeded.");
                } else {
                    console.warn("[LangChain] Fallback also returned no candidates.", fallbackResult.llmOutput);
                    finalResponse = new AIMessage("I'm sorry, I'm having a little trouble understanding that request. Could you please try asking one thing at a time?");
                }
            } catch (fallbackErr) {
                console.error("[LangChain] Fallback generation failed:", fallbackErr);
                finalResponse = new AIMessage("I'm sorry, something went wrong on my end. Please try again in a moment.");
            }
        } else {
            console.error("[LangChain] First Invoke Error:", err);
            if (err.response) console.error("[LangChain] Response data:", err.response.data);
            throw err;
        }
    }
    
    if (!finalResponse || (finalResponse.content === "" && (!finalResponse.tool_calls || finalResponse.tool_calls.length === 0))) {
        console.warn("[LangChain] Model response is virtually empty. Potential filtering issue.");
    }
    let recommendedProducts: Array<{ id: string, title?: string, price?: number, handle?: string, image?: string, score?: number }> = [];

    // Handle Tool Calls (Single turn for now, or loop if needed)
    if (finalResponse.tool_calls && finalResponse.tool_calls.length > 0) {
        const toolMessages: ToolMessage[] = [];

        for (const toolCall of finalResponse.tool_calls) {
            const tool = tools.find(t => t.name === toolCall.name);
            if (tool) {
                console.log(`[LangChain] Calling tool: ${toolCall.name}`);
                const result = await tool.func(toolCall.args);
                
                // Capture products for side-effect (saving to DB/Frontend)
                if (toolCall.name === "recommend_products") {
                    try {
                        const parsed = JSON.parse(result);
                        if (Array.isArray(parsed)) {
                            // Ensure flat structure regardless of source (Pinecone or Campaign)
                            recommendedProducts = parsed.map((p: { 
                                id: string; 
                                metadata?: { 
                                    product_id?: string; 
                                    title?: string; 
                                    price?: string | number; 
                                    handle?: string; 
                                    image?: string; 
                                };
                                score?: number;
                                title?: string;
                                price?: string | number;
                                handle?: string;
                                image?: string;
                            }) => {
                                if (p.metadata) {
                                    return {
                                        id: (p.id || p.metadata.product_id) as string,
                                        title: p.metadata.title as string,
                                        price: typeof p.metadata.price === 'string' ? parseFloat(p.metadata.price) : p.metadata.price as number,
                                        handle: p.metadata.handle as string,
                                        image: p.metadata.image as string,
                                        score: p.score || 0
                                    };
                                }
                                return {
                                    id: p.id,
                                    title: p.title,
                                    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price as number,
                                    handle: p.handle,
                                    image: p.image,
                                    score: p.score || 0
                                };
                            });
                        }
                    } catch (e) {
                         console.error("Error parsing product recommendations", e);
                    }
                }

                toolMessages.push(new ToolMessage({
                    tool_call_id: toolCall.id!,
                    content: result,
                    name: toolCall.name
                }));
            }
        }

        // Add tool results to history and call model again
        // Note: We need to append the refined AIMessage (with tool_calls) AND the ToolMessages
        const followupResponse = await modelWithTools.invoke([
            ...messages,
            finalResponse,
            ...toolMessages
        ]);

        finalResponse = followupResponse;
    }

    // Return format expected by Orchestrator (or replace Orchestrator's return)
    return {
        text: typeof finalResponse.content === "string" ? finalResponse.content : JSON.stringify(finalResponse.content),
        recommendedProducts
    };
  }
}
