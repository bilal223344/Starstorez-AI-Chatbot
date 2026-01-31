import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { processChat } from "app/services/chat/chat.processor";
import { fetchChatHistory } from "app/services/db/chat.db";
import { broadcastToClient } from "app/routes/websocket.server";

// ============================================================================
// POST: Handle New Messages
// ============================================================================
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { shop, custMail } = params;

  // 1. Validation
  if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
    return new Response("Use WebSocket endpoint", { status: 426 });
  }
  if (!shop || !custMail) return jsonResponse({ error: "Missing params" }, 400);

  const body = await request.json();
  if (!body.message) return jsonResponse({ error: "Missing message" }, 400);

  // 2. Processing (Delegated to Service)
  const result = await processChat(shop, custMail, body.message);

  // 3. WebSocket Sync (Notify frontend if connected via WS too)
  if (result.success) {
    broadcastToClient(shop, custMail, result);
  }

  return jsonResponse(result);
};

// ============================================================================
// GET: Fetch History
// ============================================================================
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  try {
    const { shop, custMail } = params;
    if (!shop || !custMail) return jsonResponse({ error: "Missing params" }, 400);

    const url = new URL(request.url);

    // Delegate complex fetching to DB Service
    const historyData = await fetchChatHistory({
      shop,
      custMail,
      mode: (url.searchParams.get("mode") as any) || "paginated",
      limit: Number(url.searchParams.get("limit")) || 20,
      beforeDate: url.searchParams.get("before") ? new Date(url.searchParams.get("before")!) : undefined
    });

    return jsonResponse({ success: true, ...historyData });

  } catch (error: any) {
    console.error("[Loader] Error:", error);
    return jsonResponse({ error: "Failed to fetch history" }, 500);
  }
};

// ============================================================================
// UTILS
// ============================================================================
function jsonResponse(data: any, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}