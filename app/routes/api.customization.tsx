import { authenticate } from "app/shopify.server";
import { LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { MasterState } from "app/routes/app.customization";

// Helper function to return JSON responses
const json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers,
        },
    });
};

// ============================================================================
// GET API - Fetch customization settings for external apps
// Returns settings in proper MasterState structure
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        // Authenticate request
        const { session } = await authenticate.admin(request);

        if (!session?.shop) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch customization from database
        const customization = await prisma.chatbotCustomization.findUnique({
            where: { shop: session.shop },
            select: {
                settings: true,
                updatedAt: true
            }
        });

        if (!customization) {
            // Return null if no customization exists yet
            return json({ 
                settings: null,
                updatedAt: null
            });
        }

        // Return settings in proper MasterState structure
        return json({ 
            settings: customization.settings as unknown as MasterState,
            updatedAt: customization.updatedAt
        });
    } catch (error) {
        console.error("[API] Error fetching customization:", error);
        return json(
            { error: "Failed to fetch customization settings" },
            { status: 500 }
        );
    }
};
