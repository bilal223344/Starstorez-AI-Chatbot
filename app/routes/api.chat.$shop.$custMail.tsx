import { ActionFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { OpenAI } from "openai";
import { generateEmbeddings } from "app/services/pineconeService";
import { AISettingsState } from "./app.personality";

// ============================================================================
// 1. TYPES
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
        description?: string;
        [key: string]: any;
    };
}

// ============================================================================
// 2. CONFIG
// ============================================================================

const openai = new OpenAI();
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

// ============================================================================
// 3. MAIN ACTION
// ============================================================================
export const action = async ({ request, params }: ActionFunctionArgs) => {
    try {
        const { shop, custMail } = params;
        const cleanShop = handleShop(shop as string);
        const userMessageContent = await handleMessage(request);

        // --- Context Loading ---
        const customerId = await handleCustomer(custMail as string, cleanShop);
        const aiSettingsRecord = await handleAISettings(cleanShop);
        const aiSettingsData = (aiSettingsRecord?.settings || {}) as unknown as AISettingsState;

        // --- Session History ---
        let sessionId = "";
        let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        if (customerId) {
            const session = await prisma.chatSession.findFirst({
                where: { customerId: customerId, shop: cleanShop },
                include: { messages: { take: 6, orderBy: { createdAt: 'desc' } } }
            });

            if (session) {
                sessionId = session.id;
                history = session.messages.reverse().map(msg => ({
                    role: msg.role as "user" | "assistant",
                    content: msg.content
                }));
            } else {
                const newSession = await prisma.chatSession.create({
                    data: { shop: cleanShop, customerId: customerId, isGuest: false }
                });
                sessionId = newSession.id;
            }
        }

        // --- Tool Definition (Enhanced) ---
        const systemPrompt = buildSystemPrompt(aiSettingsData);
        const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
            {
                type: "function",
                function: {
                    name: "recommend_products",
                    description: "Search for products. IMPORTANT: Extract the CORE product name for 'search_query'. Move adjectives like 'cheap', 'expensive' to the 'sort' parameter. Move prices to 'max_price'. Example: 'Cheap jewelry' -> query='jewelry', sort='price_asc'.",
                    parameters: {
                        type: "object",
                        properties: {
                            search_query: { 
                                type: "string", 
                                description: "The product name (noun). If user says 'cheap items', just put 'items'." 
                            },
                            max_price: { type: "number" },
                            min_price: { type: "number" },
                            sort: { 
                                type: "string", 
                                enum: ["price_asc", "price_desc", "relevance"],
                                description: "Use 'price_asc' for cheap/lowest, 'price_desc' for expensive/highest." 
                            }
                        },
                        required: ["search_query"]
                    }
                }
            }
        ];

        // --- First AI Call ---
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userMessageContent }
        ];

        const firstResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            tools: tools,
            tool_choice: "auto",
            temperature: 0.3,
        });

        const choice = firstResponse.choices[0].message;
        let finalAiText = choice.content || "";
        let rawProducts: any[] = [];

        // --- Tool Execution ---
        if (choice.tool_calls) {
            messages.push(choice);

            for (const toolCall of choice.tool_calls) {
                if (toolCall.function.name === "recommend_products") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`[AI] Search: "${args.search_query}" | Sort: ${args.sort} | Price: ${args.min_price}-${args.max_price}`);

                    // 1. Search Logic
                    const matches = await searchPinecone(
                        cleanShop,
                        args.search_query,
                        args.min_price,
                        args.max_price,
                        args.sort
                    );

                    // 2. Format for Frontend
                    rawProducts = matches.map(m => {
                        const safePrice = parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, '')) || 0;
                        return {
                            id: m.metadata.product_id,
                            title: m.metadata.title,
                            price: safePrice,
                            handle: m.metadata.handle,
                            image: m.metadata.image || "",
                            score: m.score
                        };
                    });

                    // 3. Format for AI
                    const toolResultText = formatProductsForAI(rawProducts);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: toolResultText
                    });
                }
            }

            // --- Second AI Call ---
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
            });

            finalAiText = secondResponse.choices[0].message.content || "";
        }

        // --- Save & Return ---
        if (sessionId) {
            await prisma.message.createMany({
                data: [
                    { sessionId, role: "user", content: userMessageContent },
                    { sessionId, role: "assistant", content: finalAiText }
                ]
            });
        }

        return {
            success: true,
            sessionId: sessionId,
            responseType: "AI",
            userMessage: { role: "user", content: userMessageContent },
            assistantMessage: { role: "assistant", content: finalAiText },
            products: rawProducts
        };

    } catch (error) {
        console.error("[API] Error:", error);
        return {
            success: false,
            error: "SYSTEM_ERROR",
            errorMessage: "An error occurred."
        };
    }
};

// ============================================================================
// 4. SMART SEARCH LOGIC (FIXED)
// ============================================================================

async function searchPinecone(
    shop: string,
    query: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: "price_asc" | "price_desc" | "relevance"
): Promise<PineconeMatch[]> {
    try {
        const namespace = shop.replace(/\./g, "_");
        const embedding = await generateEmbeddings([query]);

        if (!embedding || embedding.length === 0) return [];

        // Increase topK to 50 to cast a wider net for filtering
        const response = await fetch(`https://${INDEX_HOST}/query`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({
                namespace: namespace,
                vector: embedding[0],
                topK: 50, 
                includeMetadata: true
            })
        });

        if (!response.ok) return [];
        const data = await response.json();
        if (!data.matches) return [];

        let matches = data.matches as PineconeMatch[];

        // --- DYNAMIC THRESHOLD LOGIC ---
        // If the user is filtering by price or asking for generic "items",
        // we must lower the threshold because the semantic match will be weak.
        const isGenericQuery = ["items", "products", "stuff", "inventory", "goods", "gift", "gifts"].includes(query.toLowerCase());
        const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined || sort !== undefined;
        
        const threshold = (isGenericQuery || hasPriceFilter) ? 0.20 : 0.65;

        // 1. Filter
        matches = matches.filter(m => {
            if (m.score < threshold) return false;

            // Safe Price Extraction
            const priceVal = parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, '')) || 0;
            if (minPrice !== undefined && priceVal < minPrice) return false;
            if (maxPrice !== undefined && priceVal > maxPrice) return false;

            return true;
        });

        // 2. Sort
        if (sort === "price_asc") {
            matches.sort((a, b) => {
                const pA = parseFloat(String(a.metadata.price).replace(/[^0-9.]/g, '')) || 0;
                const pB = parseFloat(String(b.metadata.price).replace(/[^0-9.]/g, '')) || 0;
                return pA - pB;
            });
        } else if (sort === "price_desc") {
            matches.sort((a, b) => {
                const pA = parseFloat(String(a.metadata.price).replace(/[^0-9.]/g, '')) || 0;
                const pB = parseFloat(String(b.metadata.price).replace(/[^0-9.]/g, '')) || 0;
                return pB - pA;
            });
        }

        // Return top 5
        return matches.slice(0, 5);

    } catch (e) {
        console.error("Search error:", e);
        return [];
    }
}

// ============================================================================
// 5. HELPER FUNCTIONS
// ============================================================================

function formatProductsForAI(products: any[]): string {
    if (products.length === 0) return "No matching products found. Apologize nicely.";
    return products.map(p => `- ${p.title} ($${p.price})`).join("\n");
}

function buildSystemPrompt(aiSettings: AISettingsState): string {
    const storeDetails = aiSettings.storeDetails || {};
    const policies = aiSettings.policies || {};

    return `
    ROLE: You are a helpful shop assistant for "${storeDetails.about || 'our store'}".
    GOAL: Help users find and buy products.
    
    RULES:
    1. If the user asks to "buy this" or "add to cart", look at the chat history for context. Do NOT search again.
    2. If the tool returns products, mention the top 2 specifically.
    3. If the tool returns NO products, say: "I couldn't find exactly that, but can I help you find something else?"
    
    POLICIES:
    - Shipping: ${policies.shipping || "See website"}
    - Returns: ${policies.refund || "Contact support"}
    
    TONE: ${aiSettings.responseTone?.selectedTone?.join(", ") || "Professional"}
    `;
}

// Basic fetchers (Unchanged)
function handleShop(shop: string) { if (!shop) throw new Error("Shop required"); return shop; }
async function handleMessage(r: Request) { const b = await r.json(); return b.message; }
async function handleCustomer(m: string, s: string) {
    if (!m) return undefined;
    const c = await prisma.customer.findUnique({ where: { shop_email: { shop: s, email: m } } });
    return c?.id;
}
async function handleAISettings(s: string) { return await prisma.aISettings.findUnique({ where: { shop: s } }); }
async function getRemainingCredits(s: string) {
    const c = await prisma.merchantCredits.findUnique({ where: { shop: s } });
    return c ? (c.totalCredits - c.usedCredits) : 0;
}