import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { AISettingsState } from "app/routes/app.personality";
import { queryPinecone, buildSystemPrompt, generateAIResponse } from "app/services/openaiService";

// Type for Pinecone query results
interface PineconeMatch {
    metadata?: Record<string, unknown>;
    score?: number;
}

// Helper function to return JSON responses
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
// GET - Fetch chat history for a session
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
                    messages: {
                        orderBy: { createdAt: "asc" }
                    },
                    customer: true
                }
            });

            // Verify session belongs to this shop
            if (chatSession && chatSession.shop !== shop) {
                return json({ error: "Session does not belong to this shop" }, { status: 403 });
            }
        } else if (customerId) {
            // Get the most recent session for this customer in this shop
            chatSession = await prisma.chatSession.findFirst({
                where: {
                    customerId,
                    shop: shop
                },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" }
                    },
                    customer: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        if (!chatSession) {
            return json({ 
                session: null,
                messages: [],
                customer: null
            });
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
        return json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        );
    }
};

// ============================================================================
// POST - Send message and get AI response
// ============================================================================
export const action = async ({ request, params }: ActionFunctionArgs) => {
    try {
        const { shop, custMail } = params;

        if (!shop) {
            return json(
                { error: "Shop parameter is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { message, sessionId } = body;

        if (!message || typeof message !== "string") {
            return json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Determine if guest user (custMail is empty, null, "guest", or not provided)
        const isGuest = !custMail || custMail.trim() === "" || custMail === "guest";

        // Find or create customer if email is provided
        let customerId: string | null = null;
        if (!isGuest && custMail) {
            const customer = await prisma.customer.upsert({
                where: { email: custMail },
                create: {
                    email: custMail,
                    source: "WEBSITE"
                },
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

            // Verify session belongs to this shop
            if (chatSession && chatSession.shop !== shop) {
                return json({ error: "Session does not belong to this shop" }, { status: 403 });
            }
        }

        // If no session found or session doesn't match customer, create new one
        if (!chatSession || (customerId && chatSession.customerId !== customerId)) {
            chatSession = await prisma.chatSession.create({
                data: {
                    shop: shop,
                    customerId: customerId,
                    isGuest: isGuest
                },
                include: { messages: true }
            });
        }

        if (!chatSession) {
            return json({ error: "Failed to create/find chat session" }, { status: 500 });
        }

        // Save user message
        const userMessage = await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: "user",
                content: message
            }
        });

        // Fetch AI settings for this shop
        const aiSettingsRecord = await prisma.aISettings.findUnique({
            where: { shop: shop }
        });

        const aiSettings: AISettingsState | null = aiSettingsRecord?.settings as AISettingsState | null;

        // Query Pinecone for relevant products
        const pineconeResults = await queryPinecone(shop, message, 5);

        // Build product context from Pinecone results
        let productContext = "";
        if (pineconeResults.length > 0) {
            productContext = pineconeResults
                .map((match: PineconeMatch) => {
                    const metadata = match.metadata || {};
                    if (metadata.type === "PRODUCT") {
                        return `Product: ${metadata.title || "Unknown"}\nDescription: ${metadata.text_content || "No description"}\nPrice: ${metadata.price || "N/A"}\nHandle: ${metadata.handle || ""}\n`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n---\n\n");
        }

        // Build system prompt
        const systemPrompt = buildSystemPrompt(aiSettings || {});

        // Prepare conversation history
        const conversationHistory = chatSession.messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
        }));

        // Add current user message
        conversationHistory.push({
            role: "user",
            content: message
        });

        // Generate AI response
        let aiResponse: string;
        let aiError: string | null = null;

        try {
            aiResponse = await generateAIResponse(
                conversationHistory,
                systemPrompt,
                productContext
            );
        } catch (error) {
            console.error("[API] Error generating AI response:", error);
            
            // Check if it's a quota exceeded error
            if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
                aiError = "QUOTA_EXCEEDED";
                aiResponse = "I apologize, but I'm currently unable to respond due to service limitations. Please try again later or contact support for assistance.";
            } else {
                aiError = "AI_SERVICE_ERROR";
                aiResponse = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
            }
        }

        // Save AI response (even if there was an error, we save the fallback message)
        const assistantMessage = await prisma.message.create({
            data: {
                sessionId: chatSession.id,
                role: "assistant",
                content: aiResponse
            }
        });

        return json({
            success: !aiError,
            sessionId: chatSession.id,
            userMessage: {
                id: userMessage.id,
                role: userMessage.role,
                content: userMessage.content,
                createdAt: userMessage.createdAt
            },
            assistantMessage: {
                id: assistantMessage.id,
                role: assistantMessage.role,
                content: assistantMessage.content,
                createdAt: assistantMessage.createdAt
            },
            products: pineconeResults
                .filter((match: PineconeMatch) => match.metadata?.type === "PRODUCT")
                .map((match: PineconeMatch) => ({
                    id: match.metadata?.product_id as string | undefined,
                    title: match.metadata?.title as string | undefined,
                    handle: match.metadata?.handle as string | undefined,
                    price: match.metadata?.price as string | undefined,
                    image: match.metadata?.image as string | undefined,
                    score: match.score
                })),
            error: aiError || undefined,
            errorMessage: aiError === "QUOTA_EXCEEDED" 
                ? "AI service quota exceeded. Please contact support." 
                : aiError ? "AI service temporarily unavailable." 
                : undefined
        });
    } catch (error) {
        console.error("[API] Error in chat:", error);
        return json(
            { 
                success: false,
                error: "SYSTEM_ERROR",
                errorMessage: "Failed to process chat message. Please try again."
            },
            { status: 500 }
        );
    }
};
