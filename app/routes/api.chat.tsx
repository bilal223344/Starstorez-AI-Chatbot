import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { processChatTurn } from "app/services/ai/orchestrator";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }
    return Response.json({ message: "API Ready" }, { headers: corsHeaders() });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders() });
    }

    try {
        const { shop, sessionId, message, email, previousSessionId, previewSettings } = await request.json();

        if (!shop || !sessionId || !message) {
            return Response.json({ error: "Missing fields" }, { status: 400, headers: corsHeaders() });
        }

        const encoder = new TextEncoder();
        const streamingResponse = new ReadableStream({
            async start(controller) {
                try {
                    const { processStreamingChatTurn } = await import("app/services/ai/orchestrator");
                    const aiStream = processStreamingChatTurn(shop, sessionId, message, email, previousSessionId, previewSettings);
                    
                    for await (const chunk of aiStream) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                    }
                } catch (err) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", content: "Stream interrupted" })}\n\n`));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(streamingResponse, {
            headers: {
                ...corsHeaders(),
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        return Response.json({ success: false }, { status: 500, headers: corsHeaders() });
    }
};