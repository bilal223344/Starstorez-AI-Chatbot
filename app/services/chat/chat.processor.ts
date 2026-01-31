import { ChatResult, ChatProduct } from "app/types/chat.types";
import { getOrCreateSession, saveChatTurn } from "app/services/db/chat.db";
import { generateAIResponse } from "app/services/ai/ai.service";
import { searchPinecone } from "../search/pinecone.service";

import { ChatCompletionMessageToolCall } from "openai/resources/chat/completions";

export async function processChat(
    shop: string,
    custMail: string,
    userMessage: string
): Promise<ChatResult> {
    const startTime = Date.now();

    try {
        // 1. Session Setup (DB Layer)
        const { session } = await getOrCreateSession(shop, custMail);

        // 2. Prepare History (Format for OpenAI)
        const history = session.messages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
        }));

        // 3. First AI Pass (AI Layer)
        let aiResponse = await generateAIResponse(
            [...history, { role: "user", content: userMessage }] as any,
            shop
        );
        let finalAiText = aiResponse.content || "";
        let productsFound: ChatProduct[] = [];

        // 4. Handle Tool Calls (Search Layer)
        if (aiResponse.tool_calls) {
            // We only handle one tool type for now
            const toolCall = aiResponse.tool_calls[0] as ChatCompletionMessageToolCall;
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
                id: String(m.metadata.product_id),
                title: String(m.metadata.title),
                price: Number(m.metadata.price),
                handle: String(m.metadata.handle),
                image: String(m.metadata.image),
                score: m.score
            }));

            // 5. Second AI Pass (with products)
            // We construct a "tool" message response and feed it back to AI
            const toolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(productsFound) // Simplified for brevity
            };

            const secondPass = await generateAIResponse(
                [...history, { role: "user", content: userMessage }, aiResponse, toolMessage],
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

    } catch (error: any) {
        console.error("[Chat-Proc] Error:", error);
        return {
            success: false,
            sessionId: "",
            responseType: "AI",
            userMessage: { role: "user", content: userMessage },
            assistantMessage: { role: "assistant", content: "I encountered an error." },
            error: error.message
        };
    }
}