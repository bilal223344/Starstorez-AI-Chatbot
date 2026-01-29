import { LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { MasterState } from "app/routes/app.customization";


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
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    try {
        const { shop } = params;

        // Fetch customization from database
        const customization = await prisma.chatbotCustomization.findUnique({
            where: { shop: shop },
            select: {
                settings: true,
                updatedAt: true
            }
        });

        if (!customization) {
            return jsonResponse({ error: "Customization not found" }, request, 404);
        }

        // Return settings in proper MasterState structure
        return jsonResponse({ 
            settings: customization.settings as unknown as MasterState,
            shop: shop,
            updatedAt: customization.updatedAt
        }, request, 200);
    } catch (error) {
        console.error("[API] Error fetching customization:", error);
        return jsonResponse({ error: "Failed to fetch customization settings" }, request, 500);
    }
};
