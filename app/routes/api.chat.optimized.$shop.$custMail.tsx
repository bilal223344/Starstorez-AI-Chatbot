/* app/routes/api.chat.optimized.$shop.$custMail.tsx */
/**
 * ============================================================================
 * PUBLIC CHATBOT API - Entry Point
 * ============================================================================
 * 
 * This is the main entry point for the public chatbot API.
 * It handles conversations for multiple stores (multi-tenant).
 * 
 * Route: /api/chat/optimized/:shop/:custMail
 * - shop: Store identifier (e.g., "store-name.myshopify.com")
 * - custMail: Customer email or "guest" for anonymous users
 * 
 * Flow:
 * 1. Validate Input → 2. Check Credits → 3. Check Keywords → 4. AI Processing
 * 
 * ============================================================================
 */

import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { AISettingsState } from "app/routes/app.personality";
import { generateAIResponse, queryPinecone } from "app/services/openaiService";
import { 
    checkCreditsAvailable, 
    recordUsage, 
    UsageMetrics,
    CreditCheckResult 
} from "app/services/creditService";
import { 
    checkKeywordResponse, 
    optimizePrompt, 
    ProductMatchInfo,
    KeywordResponse 
} from "app/services/optimizedChatService";
import { normalizeTypo } from "app/services/intentClassifier";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ChatResponse {
    success: boolean;
    sessionId: string;
    responseType: "AI" | "KEYWORD" | "MANUAL_HANDOFF";
    userMessage: MessageFormat;
    assistantMessage: MessageFormat;
    products?: ProductData[];
    remainingCredits?: number;
    performance?: {
        responseTime: number;
        productsFound: number;
    };
    error?: string;
    handoffToManual?: boolean;
}

interface MessageFormat {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt?: string;
}

interface ProductData {
    id?: string;
    title?: string;
    price?: number;
    handle?: string;
    image?: string;
    score?: number;
}

interface RetrievalResult {
    productData: ProductData[];
    pineconeMatches: Array<{
        metadata?: Record<string, unknown>;
        score?: number;
    }>;
    matchInfo: ProductMatchInfo;
}

// ============================================================================
// HELPER: JSON Response with CORS
// ============================================================================

/**
 * Creates a JSON response with CORS headers for public API access
 */
function createJsonResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

// ============================================================================
// LOADER: Fetch Chat History
// ============================================================================

/**
 * GET endpoint: Fetches chat history for a session
 * 
 * Query params:
 * - sessionId: Optional session ID to fetch specific session
 */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        // Step 1: Extract parameters
        const { shop, custMail } = params;
        
        // Step 2: Validate shop parameter
        if (!shop) {
            return createJsonResponse({ error: "Shop parameter is required" }, 400);
        }

        // Step 3: Get session ID from query string
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId");

        // Step 4: Resolve customer ID if email provided
        let customerId: string | null = null;
        if (custMail && custMail !== "guest") {
            const customer = await prisma.customer.findUnique({ 
                where: { email: custMail } 
            });
            customerId = customer?.id || null;
        }

        // Step 5: Fetch chat session
        let chatSession = null;
        
        if (sessionId) {
            // Try to find session by ID
            chatSession = await prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: { 
                    messages: { orderBy: { createdAt: "asc" } }, 
                    customer: true 
                }
            });
            
            // Verify session belongs to this shop (security check)
            if (chatSession && chatSession.shop !== shop) {
                return createJsonResponse({ error: "Invalid session" }, 403);
            }
        } else if (customerId) {
            // Find most recent session for this customer
            chatSession = await prisma.chatSession.findFirst({
                where: { customerId, shop },
                include: { 
                    messages: { orderBy: { createdAt: "asc" } }, 
                    customer: true 
                },
                orderBy: { createdAt: "desc" }
            });
        }

        // Step 6: Return session data or empty response
        if (!chatSession) {
            return createJsonResponse({ 
                session: null, 
                messages: [], 
                customer: null 
            });
        }

        return createJsonResponse({
            session: { 
                id: chatSession.id, 
                shop: chatSession.shop, 
                customerId: chatSession.customerId, 
                isGuest: chatSession.isGuest 
            },
            messages: chatSession.messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt
            })),
            customer: chatSession.customer
        });
    } catch (error) {
        console.error("[LOADER] Error fetching chat history:", error);
        return createJsonResponse({ error: "Failed to fetch chat history" }, 500);
    }
};

// ============================================================================
// ACTION: Main Chatbot Logic
// ============================================================================

/**
 * POST endpoint: Processes user messages and returns AI responses
 * 
 * Request body:
 * - message: User's message text
 * - sessionId: Optional session ID to continue existing conversation
 */
export const action = async ({ request, params }: ActionFunctionArgs) => {
    // Initialize tracking
    const startTime = Date.now();
    const usageMetrics: UsageMetrics = {
        creditsUsed: 0,
        requestType: "AI_CHAT",
        wasSuccessful: false
    };

    try {
        // ====================================================================
        // STEP 1: VALIDATE INPUT
        // ====================================================================
        const { shop, custMail } = params;
        const customerEmail = custMail && custMail !== "guest" ? custMail : undefined;
        
        // Parse request body
        const body = await request.json() as { message?: string; sessionId?: string };
        const { sessionId } = body;
        let { message } = body;

        // Validate required fields
        if (!shop || !message) {
            return createJsonResponse(
                { error: "Missing required fields: shop and message are required" },
                400
            );
        }

        // Normalize user input (fix typos like "trak" → "track")
        message = normalizeTypo(message as string);

        // ====================================================================
        // STEP 2: CHECK CREDITS
        // ====================================================================
        const creditCheck = await checkCreditsAvailable(shop);
        
        if (!creditCheck.canProcessRequest) {
            return await handleCreditExhausted(
                shop,
                customerEmail,
                sessionId,
                message,
                creditCheck,
                startTime
            );
        }

        // ====================================================================
        // STEP 3: CHECK KEYWORD RESPONSES (Fast Path)
        // ====================================================================
        // This handles simple queries without AI:
        // - Greetings ("hi", "hello")
        // - Policies ("shipping policy", "return policy")
        // - Store info ("what is your store name?")
        // - Simple product queries ("cheapest products", "best sellers")
        
        const keywordRes = await checkKeywordResponse(shop, message);
        
        if (keywordRes.isKeywordMatch && keywordRes.bypassAI) {
            return await handleKeywordResponse(
                shop,
                customerEmail,
                sessionId,
                message,
                keywordRes,
                creditCheck,
                startTime
            );
        }

        // ====================================================================
        // STEP 4: AI PROCESSING (Smart Path)
        // ====================================================================
        // If we reach here, the query is complex and needs AI processing
        
        // Step 4a: Setup session and get conversation history
        const chatSession = await getOrCreateSession(shop, customerEmail, sessionId);
        
        // Save user message to database
        await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: "user",
                content: message
            }
        });

        // Build conversation history (last 12 messages = 6 exchanges)
        const allMessages = chatSession.messages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }));
        const history = [...allMessages, { role: "user" as const, content: message }]
            .slice(-12);

        // Step 4b: Intelligent Product Retrieval (RAG)
        // Search Pinecone for relevant products using vector similarity
        const retrievalResult = await performIntelligentRetrieval(
            shop,
            message,
            history
        );

        // Step 4c: Build optimized prompt
        // Get AI settings from database
        const aiSettingsRecord = await prisma.aISettings.findUnique({
            where: { shop }
        });
        const aiSettings = aiSettingsRecord?.settings as AISettingsState | null;

        // Optimize prompt with context and history
        const optimized = await optimizePrompt(
            shop,
            message,
            history,
            aiSettings,
            retrievalResult.pineconeMatches,
            retrievalResult.matchInfo
        );

        // Step 4d: Generate AI response
        usageMetrics.creditsUsed = Math.ceil(optimized.tokenEstimate / 1000);
        
        const aiResponse = await generateAIResponse(
            optimized.messagesForAI || [],
            optimized.systemPrompt,
            optimized.productContext
        );

        // Step 4e: Save AI response to database
        await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: "assistant",
                content: aiResponse
            }
        });

        // Step 4f: Record usage metrics
        usageMetrics.tokensUsed = estimateTokens(
            optimized.systemPrompt,
            message,
            aiResponse
        );
        usageMetrics.wasSuccessful = true;
        usageMetrics.responseTime = Date.now() - startTime;
        
        await recordUsage(
            shop,
            usageMetrics,
            chatSession.id,
            chatSession.customerId || undefined,
            message
        );

        // Step 4g: Return success response
        return createJsonResponse({
            success: true,
            sessionId: chatSession.id,
            responseType: "AI",
            userMessage: { role: "user", content: message },
            assistantMessage: { role: "assistant", content: aiResponse },
            products: retrievalResult.productData,
            remainingCredits: creditCheck.remainingCredits - usageMetrics.creditsUsed,
            performance: {
                responseTime: usageMetrics.responseTime,
                productsFound: retrievalResult.productData.length
            }
        } as ChatResponse);

    } catch (error: unknown) {
        // Handle errors gracefully
        console.error("[ACTION] Critical error:", error);
        
        return createJsonResponse({
            success: false,
            error: "SYSTEM_ERROR",
            errorMessage: "An unexpected error occurred. Please try again."
        }, 500);
    }
};

// ============================================================================
// HELPER FUNCTIONS - Step by Step
// ============================================================================

/**
 * Performs intelligent product retrieval using Hybrid Search (Vector + Keyword Boosting)
 */
async function performIntelligentRetrieval(
    shop: string,
    message: string,
    history: Array<{ role: string; content: string }>
): Promise<RetrievalResult> {
    let productData: ProductData[] = [];
    let pineconeMatches: Array<{
        metadata?: Record<string, unknown>;
        score?: number;
    }> = [];
    let matchInfo: ProductMatchInfo = { hasRelevantResults: false };

    // 1. Refinement Guard (Pronouns only)
    const refinementPronounRegex = /\b(it|that|this|them|those|one|ones)\b/i;
    // We only skip if the user message is VERY short and contains a pronoun (e.g. "How much is it?")
    // If they say "Show me that jacket", we still want to search "jacket".
    const isPurePronoun =
        refinementPronounRegex.test(message) &&
        message.split(" ").length < 5 &&
        !checkIfProductQuery(message);

    if (isPurePronoun) {
        return { productData: [], pineconeMatches: [], matchInfo };
    }

    // 2. Keyword Extraction (Dynamic for any store)
    const stopWords = new Set([
        "show",
        "me",
        "the",
        "a",
        "an",
        "that",
        "this",
        "it",
        "in",
        "on",
        "for",
        "do",
        "you",
        "have",
        "please",
        "i",
        "need",
        "want",
        "looking",
        "recommend"
    ]);
    const rawWords = message.toLowerCase().split(/[^a-z0-9]+/i);
    // Filter words longer than 2 chars that aren't stop words
    const searchKeywords = rawWords.filter(
        w => w.length > 2 && !stopWords.has(w)
    );

    // 3. Contextual Query Building
    const lastUserMsg =
        history.filter(m => m.role === "user").slice(-2)[0]?.content || "";
    let searchQuery = message;

    // If message is short/ambiguous, append slight context, otherwise trust the user's specific query
    if (message.length < 10) {
        searchQuery = `${message} ${lastUserMsg}`;
    }

    // 4. Query Pinecone (Top 40 - Broad Net)
    pineconeMatches = await queryPinecone(shop, searchQuery, 40);

    // 5. HYBRID SCORING (Vector + Keyword Boost)
    const boostedMatches = pineconeMatches
        .filter(m => m.metadata?.type === "PRODUCT")
        .map(match => {
            let boost = 0;
            let hasKeywordMatch = false;

            const title = ((match.metadata?.title as string) || "").toLowerCase();
            const handle = (
                (match.metadata?.handle as string) || ""
            ).toLowerCase();
            const type = (
                (match.metadata?.productType as string) || ""
            ).toLowerCase();

            // Handle Tags (Handle string[] or string format from metadata)
            let tagsString = "";
            if (Array.isArray(match.metadata?.tags)) {
                tagsString = (match.metadata!.tags as string[])
                    .join(" ")
                    .toLowerCase();
            } else if (typeof match.metadata?.tags === "string") {
                tagsString = (match.metadata!.tags as string).toLowerCase();
            }

            searchKeywords.forEach(keyword => {
                // Singularize simple check (plant vs plants)
                const singular = keyword.endsWith("s")
                    ? keyword.slice(0, -1)
                    : keyword;

                // Rule A: Title Match (High Priority)
                if (title.includes(keyword) || title.includes(singular)) {
                    boost += 0.3;
                    hasKeywordMatch = true;
                }
                // Rule B: Tag/Type Match (Medium Priority)
                else if (
                    tagsString.includes(keyword) ||
                    tagsString.includes(singular) ||
                    type.includes(keyword)
                ) {
                    boost += 0.2;
                    hasKeywordMatch = true;
                }
                // Rule C: Handle/URL Match
                else if (handle.includes(keyword)) {
                    boost += 0.15;
                    hasKeywordMatch = true;
                }
            });

            return {
                ...match,
                originalScore: match.score || 0,
                score: (match.score || 0) + boost,
                hasKeywordMatch
            };
        })
        .sort((a, b) => b.score - a.score);

    // 6. DYNAMIC FILTERING
    let validMatches = boostedMatches.filter(p => {
        // Condition 1: Strong Keyword Match (Trust the database text)
        // If "Garden" is in the tags, show it even if vector score is mediocre.
        if (p.hasKeywordMatch && p.score >= 0.35) return true;

        // Condition 2: High Semantic Match (Trust the AI vectors)
        // Catches "Sit on" -> "Sofa" where text doesn't match.
        // Threshold 0.52 is safe for top-k results in Pinecone.
        if ((p.originalScore || 0) >= 0.52) return true;

        return false;
    });

    // 7. Limit Results
    validMatches = validMatches.slice(0, 6);

    // 8. Map Data
    productData = validMatches.map(m => ({
        id: m.metadata?.product_id as string,
        title: m.metadata?.title as string,
        price: Number(m.metadata?.price) || 0,
        handle: m.metadata?.handle as string,
        image: m.metadata?.image as string,
        score: m.score
    }));

    matchInfo = {
        hasRelevantResults: productData.length > 0,
        topScore: productData[0]?.score
    };

    return { productData, pineconeMatches, matchInfo };
}

/**
 * Handles keyword-based responses (greetings, policies, etc.)
 */
async function handleKeywordResponse(
    shop: string,
    customerEmail: string | undefined,
    sessionId: string | undefined,
    message: string,
    keywordRes: KeywordResponse,
    creditCheck: CreditCheckResult,
    startTime: number
): Promise<Response> {
    // Step 1: Save messages to database
    const { userMessage, assistantMessage, chatSession } = 
        await saveUserAndBotMessage(
            shop,
            customerEmail,
            sessionId,
            message,
            keywordRes.response!,
            false
        );

    // Step 2: Record usage metrics
    const usage: UsageMetrics = {
        requestType: "KEYWORD_RESPONSE",
        creditsUsed: keywordRes.creditsUsed,
        wasSuccessful: true,
        responseTime: Date.now() - startTime
    };
    
    await recordUsage(
        shop,
        usage,
        chatSession.id,
        chatSession.customerId || undefined,
        message
    );

    // Step 3: Return response
    return createJsonResponse({
        success: true,
        sessionId: chatSession.id,
        responseType: "KEYWORD",
        userMessage: formatMessage(userMessage),
        assistantMessage: formatMessage(assistantMessage),
        products: keywordRes.productData || [],
        remainingCredits: creditCheck.remainingCredits - usage.creditsUsed,
        performance: {
            responseTime: usage.responseTime || 0,
            productsFound: keywordRes.productData?.length || 0
        }
    } as ChatResponse);
}

/**
 * Handles credit exhaustion scenario
 */
async function handleCreditExhausted(
    shop: string,
    customerEmail: string | undefined,
    sessionId: string | undefined,
    message: string,
    creditCheck: CreditCheckResult,
    startTime: number
): Promise<Response> {
    // Step 1: Create handoff message
    const handoffMsg = "I'm currently unavailable. Please contact support.";

    // Step 2: Save messages to database
    const { userMessage, assistantMessage, chatSession } = 
        await saveUserAndBotMessage(
            shop,
            customerEmail,
            sessionId,
            message,
            handoffMsg,
            true
        );

    // Step 3: Record usage (no credits used, but track the attempt)
    const usage: UsageMetrics = {
        requestType: "MANUAL_HANDOFF",
        creditsUsed: 0,
        wasSuccessful: false,
        responseTime: Date.now() - startTime
    };
    
    await recordUsage(
        shop,
        usage,
        chatSession.id,
        chatSession.customerId || undefined,
        message
    );

    // Step 4: Return handoff response
    return createJsonResponse({
        success: false,
        handoffToManual: true,
        sessionId: chatSession.id,
        responseType: "MANUAL_HANDOFF",
        userMessage: formatMessage(userMessage),
        assistantMessage: formatMessage(assistantMessage),
        remainingCredits: creditCheck.remainingCredits,
        error: "CREDITS_EXHAUSTED"
    } as ChatResponse);
}

/**
 * Checks if message is a product-related query
 */
function checkIfProductQuery(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();

    // High confidence product keywords
    const productKeywords = [
        'show me', 'looking for', 'need a', 'want to buy', 'shopping for',
        'find', 'search for', 'do you have', 'do you sell', 'available',
        'tell me about', 'tell me any', 'which', 'what products',
        'show products', 'browse', 'catalog', 'inventory', 'items',
        'what do you have', 'what can i buy', 'what items', 'see products',
        'product', 'products', 'item', 'items', 'merchandise'
    ];

    // Price-related keywords (often product queries)
    const priceKeywords = [
        'cheap', 'cheapest', 'expensive', 'price', 'cost', 'budget',
        'under', 'below', 'above', 'over', 'affordable', 'lowest', 'highest'
    ];

    // Category keywords
    const categoryKeywords = [
        'clothing', 'clothes', 'apparel', 'fashion', 'shirt', 'dress', 'shoes',
        'electronics', 'phone', 'laptop', 'computer', 'tablet',
        'furniture', 'home', 'kitchen', 'bedroom', 'sofa', 'chair',
        'beauty', 'skincare', 'makeup', 'cosmetics', 'jewelry', 'jewellery',
        'sport', 'outdoor', 'fitness', 'gym', 'sneakers', 'boots', 'jacket'
    ];

    // Check for product keywords
    if (productKeywords.some(k => lowerMessage.includes(k))) {
        return true;
    }

    // Check for price keywords
    if (priceKeywords.some(k => lowerMessage.includes(k))) {
        return true;
    }

    // Check for category keywords
    if (categoryKeywords.some(k => lowerMessage.includes(k))) {
        return true;
    }

    return false;
}

/**
 * Gets or creates a chat session
 */
async function getOrCreateSession(
    shop: string,
    customerEmail?: string,
    sessionId?: string
) {
    // Step 1: Determine if guest user
    const isGuest = !customerEmail;
    let customerId: string | null = null;

    // Step 2: Create or find customer if email provided
    if (customerEmail) {
        const customer = await (prisma.customer as unknown as {
            upsert: (args: {
                where: { shop_email: { shop: string; email: string } };
                create: { shop: string; email: string; source: string };
                update: Record<string, never>;
            }) => Promise<{ id: string }>;
        }).upsert({
            where: {
                shop_email: {
                    shop,
                    email: customerEmail
                }
            },
            create: {
                shop,
                email: customerEmail,
                source: "WEBSITE"
            },
            update: {}
        });
        customerId = customer.id;
    }

    // Step 3: Try to find existing session
    let session = null;
    
    if (sessionId) {
        session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: "asc" } } }
        });

        // Security: Verify session belongs to this shop
        if (session && session.shop !== shop) {
            session = null; // Invalid session
        }
    }

    // Step 4: Create new session if not found
    if (!session) {
        session = await prisma.chatSession.create({
            data: { shop, customerId, isGuest },
            include: { messages: true }
        });
    }

    return session;
}

/**
 * Saves user and bot messages to database
 */
async function saveUserAndBotMessage(
    shop: string,
    customerEmail: string | undefined,
    sessionId: string | undefined,
    userMsg: string,
    botMsg: string,
    isSystem: boolean
) {
    // Step 1: Get or create session
    const session = await getOrCreateSession(shop, customerEmail, sessionId);

    // Step 2: Save user message
    const userMessage = await prisma.message.create({
        data: {
            sessionId: session.id,
            role: "user",
            content: userMsg
        }
    });

    // Step 3: Save bot message
    const assistantMessage = await prisma.message.create({
        data: {
            sessionId: session.id,
            role: isSystem ? "system" : "assistant",
            content: botMsg
        }
    });

    return { userMessage, assistantMessage, chatSession: session };
}

/**
 * Formats message for API response
 */
function formatMessage(m: {
    id: string;
    role: string;
    content: string;
    createdAt: string | Date;
}): MessageFormat {
    return {
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        createdAt: typeof m.createdAt === "string" 
            ? m.createdAt 
            : m.createdAt.toISOString()
    };
}

/**
 * Estimates token count (rough calculation)
 */
function estimateTokens(sys: string, user: string, res: string): number {
    const text = sys + user + res;
    return Math.ceil(text.split(/\s+/).length / 0.75);
}
