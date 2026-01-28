import { LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { MasterState } from "app/routes/app.customization";

// ============================================================================
// GET API - Fetch customization settings for external apps
// Returns settings in proper MasterState structure
// ============================================================================
export const loader = async ({ params }: LoaderFunctionArgs) => {
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
            return { error: "Customization not found" };
        }

        // Return settings in proper MasterState structure
        return { 
            settings: customization.settings as unknown as MasterState,
            shop: shop,
            updatedAt: customization.updatedAt
        }
    } catch (error) {
        console.error("[API] Error fetching customization:", error);
        return { error: "Failed to fetch customization settings" };
    }
};
