import { ChatResult, ChatProduct, ChatSessionWithMessages } from "app/types/chat.types";
import { getOrCreateSession, saveChatTurn } from "app/services/db/chat.db";
import { LangChainService } from "app/services/ai/langchain.server";

export async function processChat(
    shop: string,
    custMail: string,
    userMessage: string
): Promise<ChatResult> {
    try {
        // 1. Session Setup (DB Layer)
        const sessionResult = await getOrCreateSession(shop, custMail);
        const session = (sessionResult as { session: ChatSessionWithMessages }).session;

        // 2. Prepare History (Include recommended products for context)
        const history = session.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            recommendedProducts: m.recommendedProducts || []
        }));

        // 3. AI Pass via LangChain (Handles Tool Calling internally)
        const langChainService = new LangChainService(shop);
        const aiResult = await langChainService.generateResponse(session.id, userMessage, history);
        
        const finalAiText = aiResult.text;
        
        const productsFound: ChatProduct[] = (aiResult.recommendedProducts || []).map((p: any) => ({
            id: p.id,
            title: p.title || "",
            price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0),
            handle: p.handle || "",
            image: p.image || "",
            score: p.score || 0
        }));

        // 4. Save Turn (DB Layer)
        if (session.id) {
            await saveChatTurn(session.id, userMessage, finalAiText, productsFound);
        }

        return {
            success: true,
            sessionId: session.id,
            responseType: "AI",
            userMessage: { role: "user", content: userMessage },
            assistantMessage: { role: "assistant", content: finalAiText },
            products: productsFound,
        };

    } catch (error) {
        console.error("[Chat-Proc] Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            sessionId: "",
            responseType: "AI",
            userMessage: { role: "user", content: userMessage },
            assistantMessage: { role: "assistant", content: "I encountered an error." },
            error: errorMessage
        };
    }
}