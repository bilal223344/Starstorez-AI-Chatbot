import { ChatResult, ChatProduct, AIMessage, ChatSessionWithMessages } from "app/types/chat.types";
import { getOrCreateSession, saveChatTurn } from "app/services/db/chat.db";
import { generateAIResponse } from "app/services/ai/ai.service";
import { searchPinecone } from "../search/pinecone.service";

export async function processChat(
    shop: string,
    custMail: string,
    userMessage: string
): Promise<ChatResult> {
    try {
        // 1. Session Setup (DB Layer)
        const sessionResult = await getOrCreateSession(shop, custMail);
        const session = (sessionResult as { session: ChatSessionWithMessages }).session;

        // 2. Prepare History
        const history: AIMessage[] = session.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }));

        // 3. First AI Pass
        const aiResponse = await generateAIResponse(
            [...history, { role: "user", content: userMessage }],
            shop
        );
        let finalAiText = aiResponse.content || "";
        let productsFound: ChatProduct[] = [];

        // 4. Handle Tool Calls
        if (aiResponse.tool_calls) {
            // We only handle one tool type for now
            const toolCall = aiResponse.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`[Chat-Proc] Tool Call: ${JSON.stringify(args)}`);

            console.log(`[Chat-Proc] Executing Search: ${args.search_query}`);

            // Call Search Service
            const searchResult = await searchPinecone(
                shop,
                args.search_query,
                args.min_price,
                args.max_price,
                args.sort
            );

            // Map results
            productsFound = searchResult.matches.map(m => ({
                id: String(m.metadata?.product_id || m.id),
                title: String(m.metadata?.title || ""),
                price: parseFloat(String(m.metadata?.price_val || "0")),
                handle: String(m.metadata?.handle || ""),
                image: String(m.metadata?.image || ""),
                score: m.score || 0
            }));

            // 5. Second AI Pass (with products)
            // We construct a "tool" message response and feed it back to AI
            const toolMessage: AIMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(productsFound)
            };

            const secondPass = await generateAIResponse(
                [
                    ...history,
                    { role: "user", content: userMessage },
                    aiResponse as AIMessage,
                    toolMessage
                ],
                shop
            );
            finalAiText = secondPass.content || "";
        }

        // 6. Save Turn (DB Layer)
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