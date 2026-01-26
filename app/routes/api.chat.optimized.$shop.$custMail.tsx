import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { AISettingsState } from "app/routes/app.personality";
import { generateAIResponse, queryPinecone } from "app/services/openaiService";
import { checkCreditsAvailable, recordUsage, UsageMetrics } from "app/services/creditService";
import { checkKeywordResponse, optimizePrompt } from "app/services/optimizedChatService";

// Type for Pinecone query results
interface PineconeMatch {
    metadata?: Record<string, unknown>;
    score?: number;
}

// Helper function to return JSON responses with CORS
const json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...init?.headers,
        },
    });
};

// ============================================================================
// GET - Fetch chat history (same as original)
// ============================================================================
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    try {
        const { shop, custMail } = params;

        if (!shop) {
            return json({ error: "Shop parameter is required" }, { status: 400 });
        }

        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId");

        // If custMail is provided and not empty, find customer by email
        let customerId: string | null = null;
        if (custMail && custMail.trim() !== "" && custMail !== "guest") {
            const customer = await prisma.customer.findUnique({
                where: { email: custMail }
            });
            customerId = customer?.id || null;
        }

        let chatSession;
        if (sessionId) {
            chatSession = await prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: {
                    messages: { orderBy: { createdAt: "asc" } },
                    customer: true
                }
            });

            if (chatSession && chatSession.shop !== shop) {
                return json({ error: "Session does not belong to this shop" }, { status: 403 });
            }
        } else if (customerId) {
            chatSession = await prisma.chatSession.findFirst({
                where: { customerId, shop: shop },
                include: {
                    messages: { orderBy: { createdAt: "asc" } },
                    customer: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        if (!chatSession) {
            return json({ session: null, messages: [], customer: null });
        }

        return json({
            session: {
                id: chatSession.id,
                shop: chatSession.shop,
                customerId: chatSession.customerId,
                isGuest: chatSession.isGuest,
                createdAt: chatSession.createdAt
            },
            messages: chatSession.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt
            })),
            customer: chatSession.customer
        });
    } catch (error) {
        console.error("[API] Error fetching chat:", error);
        return json({ error: "Failed to fetch chat history" }, { status: 500 });
    }
};

// ============================================================================
// POST - Optimized AI Chat with Credit System
// ============================================================================
export const action = async ({ request, params }: ActionFunctionArgs) => {
    const startTime = Date.now();
    const usageMetrics: UsageMetrics = {
        creditsUsed: 0,
        requestType: "AI_CHAT",
        wasSuccessful: false
    };
    
    try {
        const { shop, custMail } = params;
        const customerEmail = custMail ?? undefined;

        if (!shop) {
            return json({ error: "Shop parameter is required" }, { status: 400 });
        }

        const body = await request.json();
        const { message, sessionId } = body;

        if (!message || typeof message !== "string") {
            return json({ error: "Message is required" }, { status: 400 });
        }

        console.log(`[OPTIMIZED] Processing message for shop: ${shop}`);

        // STEP 1: Check credits availability
        const creditCheck = await checkCreditsAvailable(shop);
        
        if (!creditCheck.canProcessRequest) {
            console.log(`[OPTIMIZED] Credits exhausted for ${shop}: ${creditCheck.reason}`);
            usageMetrics.requestType = "MANUAL_HANDOFF";
            usageMetrics.creditsUsed = 0;
            
            const handoffMessage = `I'm currently unavailable for AI assistance. ${creditCheck.reason || 'Please contact our support team for help!'}`;
            
            // Save messages for manual handling
            const { userMessage, assistantMessage, chatSession } = await saveUserAndBotMessage(
                shop, customerEmail, sessionId, message, handoffMessage, true
            );
            
            // Record the handoff event
            usageMetrics.responseTime = Date.now() - startTime;
            const customerId = await findCustomerId(customerEmail);
            await recordUsage(shop, usageMetrics, chatSession.id, customerId ?? undefined, message);
            
            return json({
                success: false,
                handoffToManual: true,
                sessionId: chatSession.id,
                responseType: "MANUAL_HANDOFF",
                userMessage: formatMessage(userMessage),
                assistantMessage: formatMessage(assistantMessage),
                remainingCredits: creditCheck.remainingCredits,
                error: "CREDITS_EXHAUSTED",
                errorMessage: handoffMessage
            });
        }

        // STEP 2: Check for keyword-based direct responses (save costs)
        const keywordResponse = await checkKeywordResponse(shop, message);
        
        if (keywordResponse.isKeywordMatch && keywordResponse.bypassAI) {
            console.log(`[OPTIMIZED] Using keyword response for: "${message.substring(0, 30)}..."`);
            
            usageMetrics.requestType = "KEYWORD_RESPONSE";
            usageMetrics.creditsUsed = keywordResponse.creditsUsed;
            usageMetrics.wasSuccessful = true;
            
            // Save messages
            const { userMessage, assistantMessage, chatSession } = await saveUserAndBotMessage(
                shop, customerEmail, sessionId, message, keywordResponse.response!, false
            );
            
            // Record usage
            usageMetrics.responseTime = Date.now() - startTime;
            const customerId = await findCustomerId(customerEmail);
            await recordUsage(shop, usageMetrics, chatSession.id, customerId ?? undefined, message);
            
            return json({
                success: true,
                sessionId: chatSession.id,
                responseType: "KEYWORD",
                userMessage: formatMessage(userMessage),
                assistantMessage: formatMessage(assistantMessage),
                products: keywordResponse.productData || [],
                remainingCredits: creditCheck.remainingCredits - keywordResponse.creditsUsed,
                creditsUsed: keywordResponse.creditsUsed,
                performance: {
                    responseTime: Date.now() - startTime,
                    productsFound: keywordResponse.productData?.length || 0,
                    isProductQuery: true
                }
            });
        }

        // STEP 3: Full AI Processing with optimization
        console.log(`[OPTIMIZED] Using AI response for: "${message.substring(0, 30)}..."`);
        
        const chatSession = await getOrCreateSession(shop, customerEmail, sessionId);
        const customerId = await findCustomerId(customerEmail);

        // Save user message
        const userMessage = await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: "user",
                content: message
            }
        });

        // Fetch AI settings
        const aiSettingsRecord = await prisma.aISettings.findUnique({
            where: { shop: shop }
        });
        const aiSettings: AISettingsState | null = aiSettingsRecord?.settings as AISettingsState | null;

        // Prepare conversation history (limited for optimization)
        const recentMessages = chatSession.messages.slice(-6); // Last 3 exchanges
        const conversationHistory = recentMessages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
        }));

        // Add current user message
        conversationHistory.push({
            role: "user",
            content: message
        });

        // Check if this is a product-related query and get product data
        interface ProductResult { id?: string; title?: string; handle?: string; price?: string; image?: string; score: number }
        let productData: ProductResult[] = [];
        let pineconeResults: PineconeMatch[] = [];
        let productMatchInfo: { hasRelevantResults: boolean; topScore?: number } = { hasRelevantResults: true };
        const isProductQuery = checkIfProductQuery(message);
        
        // Similarity score threshold (CHATBOT-TESTING: don't use low-relevance results)
        const SIMILARITY_THRESHOLD = 0.65;

        if (isProductQuery) {
            console.log(`[OPTIMIZED] Product query detected, fetching product data`);
            try {
                pineconeResults = await queryPinecone(shop, message, 8);
                const productsWithScore = pineconeResults
                    .filter((match: PineconeMatch) => match.metadata?.type === "PRODUCT")
                    .map((match: PineconeMatch) => ({
                        id: match.metadata?.product_id as string | undefined,
                        title: match.metadata?.title as string | undefined,
                        handle: match.metadata?.handle as string | undefined,
                        price: match.metadata?.price as string | undefined,
                        image: match.metadata?.image as string | undefined,
                        score: (match.score ?? 0) as number
                    }))
                    .filter(product => product.title);

                // Filter by similarity: never show irrelevant products (fix Fallback Logic Failure)
                productData = productsWithScore.filter(p => p.score >= SIMILARITY_THRESHOLD);
                const topScore = productsWithScore[0]?.score ?? 0;
                productMatchInfo = {
                    hasRelevantResults: productData.length > 0,
                    topScore: productsWithScore.length > 0 ? topScore : undefined
                };

                // Use only high-score matches for AI context (no irrelevant fallback)
                pineconeResults = pineconeResults.filter((m) => {
                    const s = (m.score ?? 0) as number;
                    return m.metadata?.type === "PRODUCT" && s >= SIMILARITY_THRESHOLD;
                });

                console.log(`[OPTIMIZED] Found ${productData.length} relevant products (top score: ${topScore?.toFixed(2)}, threshold: ${SIMILARITY_THRESHOLD})`);
            } catch (error) {
                console.error("[OPTIMIZED] Error fetching products:", error);
                productMatchInfo = { hasRelevantResults: false };
            }
        }

        // Optimize prompt: pass filtered Pinecone results, match info for no-fallback / negative-constraint rules
        const optimizedPrompt = await optimizePrompt(
            shop,
            message,
            conversationHistory,
            aiSettings,
            pineconeResults,
            isProductQuery ? productMatchInfo : undefined
        );
        
        // Estimate credits needed (1 credit per ~1000 tokens)
        const estimatedCredits = Math.max(1, Math.ceil(optimizedPrompt.tokenEstimate / 1000));
        usageMetrics.creditsUsed = estimatedCredits;

        // Generate AI response
        let aiResponse: string;
        let aiError: string | null = null;
        let tokensUsed = 0;

        try {
            // Use optimized prompt structure
            const messages = [{
                role: "user" as const,
                content: optimizedPrompt.userPrompt
            }];
            
            aiResponse = await generateAIResponse(
                messages,
                optimizedPrompt.systemPrompt,
                optimizedPrompt.productContext
            );
            
            // Estimate actual tokens used
            tokensUsed = estimateTokens(optimizedPrompt.systemPrompt, message, aiResponse);
            usageMetrics.tokensUsed = tokensUsed;
            usageMetrics.wasSuccessful = true;
            
            console.log(`[OPTIMIZED] AI response: ${aiResponse.length} chars, ~${tokensUsed} tokens, ${estimatedCredits} credits`);
            
        } catch (error) {
            console.error("[OPTIMIZED] AI Error:", error);
            
            if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
                aiError = "QUOTA_EXCEEDED";
                aiResponse = "Our AI service has reached its quota. A team member will assist you shortly!";
                usageMetrics.requestType = "MANUAL_HANDOFF";
                usageMetrics.creditsUsed = 0;
            } else if (error instanceof Error && error.message.includes("Max retries exceeded")) {
                aiError = "RATE_LIMITED";
                aiResponse = "I'm experiencing high demand. Please try again in a moment!";
                usageMetrics.creditsUsed = 0.5; // Partial credit for attempt
            } else {
                aiError = "AI_SERVICE_ERROR";
                aiResponse = "I'm having technical difficulties. A team member will help you!";
                usageMetrics.creditsUsed = 0.5;
            }
            
            usageMetrics.wasSuccessful = false;
            usageMetrics.errorMessage = error instanceof Error ? error.message : "Unknown error";
        }

        // Save AI response
        const assistantMessage = await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: aiError ? "system" : "assistant",
                content: aiResponse
            }
        });

        // Record usage metrics
        usageMetrics.responseTime = Date.now() - startTime;
        await recordUsage(shop, usageMetrics, chatSession.id, customerId ?? undefined, message);

        // Get updated credit status
        const finalCreditCheck = await checkCreditsAvailable(shop);

        return json({
            success: !aiError,
            sessionId: chatSession.id,
            responseType: aiError ? "ERROR" : "AI",
            userMessage: formatMessage(userMessage),
            assistantMessage: formatMessage(assistantMessage),
            products: productData, // Include product data for product-related queries
            remainingCredits: finalCreditCheck.remainingCredits,
            tokensUsed,
            creditsUsed: usageMetrics.creditsUsed,
            performance: {
                responseTime: usageMetrics.responseTime,
                tokenEstimate: optimizedPrompt.tokenEstimate,
                productsFound: productData.length,
                isProductQuery
            },
            error: aiError || undefined,
            errorMessage: aiError === "QUOTA_EXCEEDED" 
                ? "AI quota exceeded. Manual support activated."
                : aiError === "RATE_LIMITED"
                ? "High demand. Please try again shortly."
                : aiError ? "AI temporarily unavailable."
                : undefined
        });

    } catch (error) {
        console.error("[OPTIMIZED] System error:", error);
        
        // Record system error
        usageMetrics.wasSuccessful = false;
        usageMetrics.errorMessage = error instanceof Error ? error.message : "System error";
        usageMetrics.responseTime = Date.now() - startTime;
        
        if (params.shop) {
            await recordUsage(params.shop, usageMetrics);
        }
        
        return json({
            success: false,
            error: "SYSTEM_ERROR",
            errorMessage: "System error. Please try again."
        }, { status: 500 });
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findCustomerId = async (custMail?: string): Promise<string | null> => {
    if (!custMail || custMail.trim() === "" || custMail === "guest") {
        return null;
    }
    
    const customer = await prisma.customer.findUnique({
        where: { email: custMail }
    });
    
    return customer?.id || null;
};

const getOrCreateSession = async (shop: string, custMail?: string, sessionId?: string) => {
    const isGuest = !custMail || custMail.trim() === "" || custMail === "guest";
    
    // Find or create customer if email is provided
    let customerId: string | null = null;
    if (!isGuest && custMail) {
        const customer = await prisma.customer.upsert({
            where: { email: custMail },
            create: { email: custMail, source: "WEBSITE" },
            update: {}
        });
        customerId = customer.id;
    }

    // Get or create chat session
    let chatSession;
    if (sessionId) {
        chatSession = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: "asc" } } }
        });

        if (chatSession && chatSession.shop !== shop) {
            throw new Error("Session does not belong to this shop");
        }
    }

    if (!chatSession || (customerId && chatSession.customerId !== customerId)) {
        chatSession = await prisma.chatSession.create({
            data: { shop, customerId, isGuest },
            include: { messages: true }
        });
    }

    return chatSession;
};

const saveUserAndBotMessage = async (
    shop: string,
    custMail: string | undefined,
    sessionId: string | undefined,
    userMessage: string,
    botResponse: string,
    isHandoff: boolean
) => {
    const chatSession = await getOrCreateSession(shop, custMail, sessionId);
    
    const userMsg = await prisma.message.create({
        data: {
            sessionId: chatSession.id,
            role: "user",
            content: userMessage
        }
    });

    const botMsg = await prisma.message.create({
        data: {
            sessionId: chatSession.id,
            role: isHandoff ? "system" : "assistant",
            content: botResponse
        }
    });

    return {
        userMessage: userMsg,
        assistantMessage: botMsg,
        chatSession
    };
};

const formatMessage = (message: { id: string; role: string; content: string; createdAt: Date }) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt
});

const estimateTokens = (systemPrompt: string, userMessage: string, response: string): number => {
    const totalText = systemPrompt + userMessage + response;
    const wordCount = totalText.split(/\s+/).length;
    return Math.ceil(wordCount / 0.75); // 1 token ≈ 0.75 words
};

const checkIfProductQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    
    const productKeywords = [
        // Direct product questions
        'what products', 'show products', 'your products', 'products do you have',
        'what do you sell', 'what can i buy', 'items do you have', 'tell me about',
        
        // Category/browsing queries
        'show me', 'looking for', 'need a', 'want to buy', 'shopping for',
        'browse', 'catalog', 'collection', 'category', 'any', 'tell me any',
        
        // Price-related (already handled by keyword system, but might need products)
        'price', 'cost', 'how much', 'expensive', 'cheap', 'affordable',
        
        // Product search
        'find', 'search', 'available', 'in stock', 'do you have',
        
        // Clothing & Fashion
        'clothing', 'clothes', 'apparel', 'fashion', 'wear', 'shirt', 'dress', 
        'shoes', 'jacket', 'pants', 'jeans', 'skirt', 'blouse', 'sweater',
        'hoodie', 'shorts', 'suit', 'coat', 'vest', 'underwear', 'socks',
        'hat', 'cap', 'scarf', 'gloves', 'belt', 'tie', 'swimwear', 'lingerie',
        
        // Electronics & Tech
        'electronics', 'phone', 'computer', 'laptop', 'tablet', 'headphones',
        'camera', 'watch', 'speaker', 'charger', 'cable', 'mouse', 'keyboard',
        
        // Home & Living
        'home', 'furniture', 'decor', 'kitchen', 'bedroom', 'bathroom',
        'living room', 'dining', 'bed', 'chair', 'table', 'sofa', 'lamp',
        'pillow', 'blanket', 'curtains', 'rug', 'mirror', 'clock', 'vase',
        
        // Beauty & Health
        'beauty', 'skincare', 'makeup', 'cosmetics', 'health', 'fitness',
        'perfume', 'shampoo', 'lotion', 'cream', 'serum', 'lipstick',
        'foundation', 'mascara', 'nail', 'hair', 'body', 'face',
        
        // Sports & Outdoor
        'sport', 'outdoor', 'exercise', 'gym', 'running', 'yoga', 'bike',
        'ball', 'equipment', 'gear', 'outdoor', 'camping', 'hiking',
        
        // Other categories
        'book', 'toy', 'game', 'jewelry', 'accessories', 'bag', 'wallet',
        'sunglasses', 'phone case', 'backpack', 'purse', 'necklace', 'ring',
        'bracelet', 'earring'
    ];
    
    // Check if message contains product-related keywords
    return productKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           // Questions that typically expect product listings
           (lowerMessage.includes('?') && (
               lowerMessage.includes('have') || 
               lowerMessage.includes('sell') || 
               lowerMessage.includes('offer') ||
               lowerMessage.includes('available') ||
               lowerMessage.includes('recommend') ||
               lowerMessage.includes('suggest')
           )) ||
           // Pattern: "tell me [something] that is [category]"
           (lowerMessage.includes('tell me') && lowerMessage.includes('that is'));
};