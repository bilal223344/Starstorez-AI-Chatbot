import { LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { WidgetSettings } from "app/types";


function getCorsHeaders(request: Request) {
  // Allow the calling origin, or default to * (though * fails with credentials)
  const origin = request.headers.get("Origin") || "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Upgrade, Connection",
    "Access-Control-Allow-Credentials": "true",
  };
}

function jsonResponse(data: unknown, request: Request, status: number = 200) {
  return Response.json(data, {
    status,
    headers: getCorsHeaders(request),
  });
}


// ============================================================================
// GET API - Fetch customization settings for external apps
// Returns settings in proper MasterState structure
// ============================================================================
import { getWidgetSettings } from "app/services/widgetService";

// ============================================================================
// GET API - Fetch customization settings for external apps
// Returns settings in WidgetSettings structure
// ============================================================================
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { shop } = params;

    if (!shop) {
      return jsonResponse({ error: "Shop parameter is required" }, request, 400);
    }

    // Fetch customization using service
    const settings = await getWidgetSettings(shop);

    // Return settings
    return jsonResponse({
      settings,
      shop: shop,
      updatedAt: new Date() // specific update time might require fetching full object if needed, but settings is main priority
    }, request, 200);
  } catch (error) {
    console.error("[API] Error fetching customization:", error);
    return jsonResponse({ error: "Failed to fetch customization settings" }, request, 500);
  }
};
