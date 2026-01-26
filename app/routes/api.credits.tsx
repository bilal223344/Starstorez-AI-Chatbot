import { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { checkCreditsAvailable, createDefaultPlans } from "app/services/creditService";

// Helper function to return JSON responses
const json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...init?.headers,
        },
    });
};

// ============================================================================
// GET - Fetch merchant's credit status and usage analytics
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request);
        
        if (!session?.shop) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get credit status
        const creditStatus = await checkCreditsAvailable(session.shop);
        
        // Get detailed merchant credits info
        const merchantCredits = await prisma.merchantCredits.findUnique({
            where: { shop: session.shop },
            include: { 
                plan: true,
                usageLogs: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 100
                }
            }
        });

        if (!merchantCredits) {
            return json({
                hasCredits: false,
                error: "No credit record found. Please contact support."
            });
        }

        // Calculate usage analytics
        const usageStats = calculateUsageStats(merchantCredits.usageLogs);

        return json({
            success: true,
            credits: {
                total: merchantCredits.totalCredits,
                used: merchantCredits.usedCredits,
                remaining: merchantCredits.remainingCredits,
                periodStart: merchantCredits.periodStart,
                periodEnd: merchantCredits.periodEnd
            },
            plan: {
                name: merchantCredits.plan.name,
                monthlyCredits: merchantCredits.plan.monthlyCredits,
                price: merchantCredits.plan.price,
                features: merchantCredits.plan.features
            },
            settings: {
                aiEnabled: merchantCredits.aiEnabled,
                autoRecharge: merchantCredits.autoRecharge
            },
            usage: {
                totalRequests: merchantCredits.totalRequests,
                totalUsers: merchantCredits.totalUsers,
                ...usageStats
            },
            status: creditStatus
        });
    } catch (error) {
        console.error("[CREDITS API] Error:", error);
        return json(
            { error: "Failed to fetch credit status" },
            { status: 500 }
        );
    }
};

// ============================================================================
// POST/PUT - Update merchant credit settings
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request);
        
        if (!session?.shop) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case "toggle_ai":
                return await toggleAIEnabled(session.shop, data.enabled);
                
            case "update_settings":
                return await updateCreditSettings(session.shop, data);
                
            case "initialize_plans":
                await createDefaultPlans();
                return json({ success: true, message: "Plans initialized" });
                
            default:
                return json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("[CREDITS API] Action error:", error);
        return json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const toggleAIEnabled = async (shop: string, enabled: boolean) => {
    const updated = await prisma.merchantCredits.upsert({
        where: { shop },
        update: { aiEnabled: enabled },
        create: {
            shop,
            planId: "free-plan", // Will be replaced by actual plan ID
            aiEnabled: enabled,
            totalCredits: 1000,
            remainingCredits: 1000,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
    });

    return json({
        success: true,
        message: `AI responses ${enabled ? 'enabled' : 'disabled'}`,
        aiEnabled: updated.aiEnabled
    });
};

const updateCreditSettings = async (shop: string, settings: any) => {
    const updated = await prisma.merchantCredits.update({
        where: { shop },
        data: {
            autoRecharge: settings.autoRecharge !== undefined ? settings.autoRecharge : undefined
        }
    });

    return json({
        success: true,
        message: "Settings updated successfully",
        settings: {
            aiEnabled: updated.aiEnabled,
            autoRecharge: updated.autoRecharge
        }
    });
};

const calculateUsageStats = (usageLogs: any[]) => {
    const stats = {
        aiChats: 0,
        keywordResponses: 0,
        handoffs: 0,
        totalTokens: 0,
        averageResponseTime: 0,
        successRate: 0
    };

    if (usageLogs.length === 0) return stats;

    let totalResponseTime = 0;
    let successCount = 0;

    usageLogs.forEach(log => {
        switch (log.requestType) {
            case "AI_CHAT":
                stats.aiChats++;
                break;
            case "KEYWORD_RESPONSE":
                stats.keywordResponses++;
                break;
            case "MANUAL_HANDOFF":
                stats.handoffs++;
                break;
        }

        if (log.tokensUsed) {
            stats.totalTokens += log.tokensUsed;
        }

        if (log.responseTime) {
            totalResponseTime += log.responseTime;
        }

        if (log.wasSuccessful) {
            successCount++;
        }
    });

    stats.averageResponseTime = Math.round(totalResponseTime / usageLogs.length);
    stats.successRate = Math.round((successCount / usageLogs.length) * 100);

    return stats;
};