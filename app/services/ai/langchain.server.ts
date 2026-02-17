import { ChatVertexAI } from "@langchain/google-vertexai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatConfiguration } from "@prisma/client";
import prisma from "../../db.server";
import { searchPinecone } from "../search/pinecone.service";
import { PineconeMatch } from "../../types/chat.types";
import { SYSTEM_INSTRUCTION_BASE } from "./orchestrator";
import { fetchStoreContext } from "../context.server";

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
      temperature: 0.7,
      maxOutputTokens: 1024,
      authOptions: authOptions, // Pass auth options here
      location: "us-central1"
    });
  }

  // ============================================================================
  // TOOL FACTORY
  // ============================================================================
  
  private async createTools(config: ChatConfiguration) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools: any[] = [];

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

    // 2. Check CAMPAIGNS (Trigger Keywords) - Bypass LLM if match
    if (config.campaignsEnabled) {
        const campaigns = await prisma.campaign.findMany({
            where: { shop: this.shop, isActive: true },
            include: { products: { include: { Product: true } } }
        });
        
        for (const camp of campaigns) {
            // Check if any trigger keyword matches user message (case-insensitive)
            const triggers = camp.triggerKeywords;
            const match = triggers.some(t => userMessage.toLowerCase().includes(t.toLowerCase()));
            
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
    const tools = await this.createTools(config);
    const modelWithTools = this.model.bindTools(tools);

    // 4. Prepare Context
    const storeContext = await fetchStoreContext(this.shop);
    const systemPrompt = `
      ${SYSTEM_INSTRUCTION_BASE}
      
      ${storeContext}

      IMPORTANT:
      - You are a helpful AI assistant for this store.
      - Use the available tools to answer questions.
      - If you find products, listing them in the response text is optional but sending the data is crucial.
      - Keep responses concise and friendly.
      - Do NOT recommend products unless the user explicitly asks for them.
      - For greetings like "Hi" or "How are you", simple reply politely without calling any tools.
    `;

    // 5. Build Message History
    const messages: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        ...history.map(m => m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)),
        new HumanMessage(userMessage)
    ];

    // 6. Invoke Model
    // We implement a simple ReAct loop (invoke -> check tool calls -> invoke with results)
    let finalResponse = await modelWithTools.invoke(messages);
    let recommendedProducts: Array<{ id: string, title?: string, price?: number, handle?: string, image?: string, score?: number }> = [];

    // Handle Tool Calls (Single turn for now, or loop if needed)
    // LangChain's .invoke with bound tools will return an AIMessage with tool_calls if needed.
    // We need to execute them and call again.
    
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
                            recommendedProducts = parsed;
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
