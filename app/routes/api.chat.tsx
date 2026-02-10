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
        // 1. Get ALL fields, including previousSessionId
        const { shop, sessionId, message, email, previousSessionId } = await request.json();

        if (!shop || !sessionId || !message) {
            return Response.json({ error: "Missing fields" }, { status: 400, headers: corsHeaders() });
        }

        // 2. Pass everything to orchestrator
        processChatTurn(shop, sessionId, message, email, previousSessionId).catch((err) => {
            console.error("Background Error:", err);
        });

        return Response.json({ success: true }, { headers: corsHeaders() });

    } catch (error) {
        return Response.json({ success: false }, { status: 500, headers: corsHeaders() });
    }
};