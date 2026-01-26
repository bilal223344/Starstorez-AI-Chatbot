import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "app/shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import prisma from "app/db.server";
import { checkCreditsAvailable, createDefaultPlans } from "app/services/creditService";

// ============================================================================
// LOADER - Fetch credit status directly from database
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request);
        
        if (!session?.shop) {
            return { error: "Unauthorized" };
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
            return {
                hasCredits: false,
                error: "No credit record found. Please contact support.",
                needsInitialization: true
            };
        }

        // Calculate usage analytics
        const usageStats = calculateUsageStats(merchantCredits.usageLogs);

        return {
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
        };
    } catch (error) {
        console.error("[CREDITS LOADER] Error:", error);
        return { 
            error: "Failed to fetch credit status",
            needsInitialization: true 
        };
    }
};

// ============================================================================
// ACTION - Handle credit setting updates directly
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.admin(request);
        
        if (!session?.shop) {
            return { error: "Unauthorized" };
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
                return { success: true, message: "Plans initialized" };
                
            default:
                return { error: "Invalid action" };
        }
    } catch (error) {
        console.error("[CREDITS ACTION] Error:", error);
        return { error: "Failed to update settings" };
    }
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function Credits() {
    const loaderData = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const shopify = useAppBridge();
    const [isInitializing, setIsInitializing] = useState(false);

    // Initialize plans if needed
    useEffect(() => {
        if (loaderData.needsInitialization && !isInitializing) {
            setIsInitializing(true);
            fetcher.submit(
                { action: "initialize_plans" },
                { method: "POST", encType: "application/json" }
            );
        }
    }, [loaderData.needsInitialization, fetcher, isInitializing]);

    // Handle fetcher responses
    useEffect(() => {
        if (fetcher.data) {
            setIsInitializing(false);
            if (fetcher.data.success) {
                // Reload the page to fetch updated data
                window.location.reload();
            } else if (fetcher.data.error) {
                shopify.toast.show(fetcher.data.error, { isError: true });
            }
        }
    }, [fetcher.data, shopify]);

    const toggleAI = (enabled: boolean) => {
        fetcher.submit(
            { action: "toggle_ai", enabled },
            { method: "POST", encType: "application/json" }
        );
    };

    const updateSettings = (settings: any) => {
        fetcher.submit(
            { action: "update_settings", ...settings },
            { method: "POST", encType: "application/json" }
        );
    };

    // Show loading state while initializing
    if (loaderData.needsInitialization || isInitializing) {
        return (
            <s-page heading="Usage & Credits" inlineSize="large">
                <s-banner tone="info">
                    Setting up your credit system... This may take a moment.
                </s-banner>
                {loaderData.error && (
                    <s-banner tone="warning" style={{ marginTop: "10px" }}>
                        {loaderData.error}
                    </s-banner>
                )}
            </s-page>
        );
    }

    // Show error state if there's an error but no initialization needed
    if (loaderData.error && !loaderData.needsInitialization) {
        return (
            <s-page heading="Usage & Credits" inlineSize="large">
                <s-banner tone="critical">
                    {loaderData.error}
                </s-banner>
            </s-page>
        );
    }

    const { credits, plan, settings, usage } = loaderData;
    const usagePercentage = Math.round((credits.used / credits.total) * 100);

    return (
        <s-page heading="Usage & Credits" inlineSize="large">
            {/* Credit Status Overview */}
            <s-section>
                <s-stack gap="base">
                    <s-heading>Current Usage</s-heading>
                    
                    {/* Usage Progress Bar */}
                    <div style={{ 
                        background: "#f6f6f7", 
                        borderRadius: "8px", 
                        padding: "20px",
                        border: "1px solid #e1e5e9"
                    }}>
                        <s-grid gridTemplateColumns="2fr 1fr 1fr" gap="large">
                            <div>
                                <s-heading level={3}>Credits This Month</s-heading>
                                <div style={{ 
                                    background: "#e1e5e9", 
                                    borderRadius: "4px", 
                                    height: "24px", 
                                    marginTop: "8px",
                                    overflow: "hidden"
                                }}>
                                    <div style={{
                                        background: usagePercentage > 80 ? "#d73502" : usagePercentage > 60 ? "#f59e0b" : "#10b981",
                                        height: "100%",
                                        width: `${Math.min(usagePercentage, 100)}%`,
                                        borderRadius: "4px",
                                        transition: "width 0.3s ease"
                                    }}></div>
                                </div>
                                <s-text tone="neutral" style={{ marginTop: "8px" }}>
                                    {credits.used.toLocaleString()} / {credits.total.toLocaleString()} credits used ({usagePercentage}%)
                                </s-text>
                            </div>
                            
                            <div>
                                <s-heading level={3}>Plan</s-heading>
                                <s-text style={{ marginTop: "8px" }}>{plan.name}</s-text>
                                <s-text tone="neutral">${plan.price}/month</s-text>
                            </div>
                            
                            <div>
                                <s-heading level={3}>Resets</s-heading>
                                <s-text tone="neutral" style={{ marginTop: "8px" }}>
                                    {new Date(credits.periodEnd).toLocaleDateString()}
                                </s-text>
                            </div>
                        </s-grid>
                    </div>
                </s-stack>
            </s-section>

            {/* AI Control Settings */}
            <s-section>
                <s-stack gap="base">
                    <s-heading>AI Settings</s-heading>
                    
                    <s-box padding="base" border="base" borderRadius="base">
                        <s-stack gap="base">
                            <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                <div>
                                    <s-text variant="strong">AI Auto-Responses</s-text>
                                    <s-text tone="neutral">
                                        Enable or disable AI-powered automatic responses to customer messages
                                    </s-text>
                                </div>
                                <s-switch 
                                    checked={settings.aiEnabled}
                                    onChange={(e: any) => toggleAI(e.currentTarget.checked)}
                                />
                            </s-grid>
                            
                            <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                <div>
                                    <s-text variant="strong">Auto-Recharge</s-text>
                                    <s-text tone="neutral">
                                        Automatically reset credits at the start of each billing period
                                    </s-text>
                                </div>
                                <s-switch 
                                    checked={settings.autoRecharge}
                                    onChange={(e: any) => updateSettings({ autoRecharge: e.currentTarget.checked })}
                                />
                            </s-grid>
                        </s-stack>
                    </s-box>
                </s-stack>
            </s-section>

            {/* Usage Analytics */}
            <s-section>
                <s-stack gap="base">
                    <s-heading>Usage Analytics</s-heading>
                    
                    <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="base">
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text tone="neutral">Total Requests</s-text>
                                <s-heading level={2}>{usage.totalRequests.toLocaleString()}</s-heading>
                            </s-stack>
                        </s-box>
                        
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text tone="neutral">Unique Users</s-text>
                                <s-heading level={2}>{usage.totalUsers.toLocaleString()}</s-heading>
                            </s-stack>
                        </s-box>
                        
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text tone="neutral">AI Responses</s-text>
                                <s-heading level={2}>{usage.aiChats.toLocaleString()}</s-heading>
                            </s-stack>
                        </s-box>
                        
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text tone="neutral">Success Rate</s-text>
                                <s-heading level={2}>{usage.successRate}%</s-heading>
                            </s-stack>
                        </s-box>
                    </s-grid>

                    <s-grid gridTemplateColumns="1fr 1fr" gap="large">
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text variant="strong">Response Types</s-text>
                                <div>
                                    <s-text>AI Chats: {usage.aiChats}</s-text><br/>
                                    <s-text>Keyword Responses: {usage.keywordResponses}</s-text><br/>
                                    <s-text>Manual Handoffs: {usage.handoffs}</s-text>
                                </div>
                            </s-stack>
                        </s-box>
                        
                        <s-box padding="base" border="base" borderRadius="base">
                            <s-stack gap="small">
                                <s-text variant="strong">Performance</s-text>
                                <div>
                                    <s-text>Avg Response Time: {usage.averageResponseTime}ms</s-text><br/>
                                    <s-text>Total Tokens Used: {usage.totalTokens?.toLocaleString()}</s-text>
                                </div>
                            </s-stack>
                        </s-box>
                    </s-grid>
                </s-stack>
            </s-section>

            {/* Plan Information */}
            <s-section>
                <s-stack gap="base">
                    <s-heading>Plan Details</s-heading>
                    
                    <s-box padding="base" border="base" borderRadius="base">
                        <s-stack gap="base">
                            <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                <div>
                                    <s-text variant="strong">{plan.name} Plan</s-text>
                                    <s-text tone="neutral">
                                        {plan.monthlyCredits.toLocaleString()} credits per month
                                    </s-text>
                                </div>
                                <s-text variant="strong">${plan.price}/month</s-text>
                            </s-grid>
                            
                            {plan.features && (
                                <div>
                                    <s-text variant="strong">Features included:</s-text>
                                    <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                                        {Object.entries(plan.features as Record<string, boolean>)
                                            .filter(([_, enabled]) => enabled)
                                            .map(([feature, _]) => (
                                                <li key={feature}>
                                                    <s-text>{formatFeatureName(feature)}</s-text>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )}
                        </s-stack>
                    </s-box>
                </s-stack>
            </s-section>

            {/* Low Credits Warning */}
            {usagePercentage > 80 && (
                <s-banner tone="warning">
                    <s-stack gap="small">
                        <s-text variant="strong">Low Credits Warning</s-text>
                        <s-text>
                            You've used {usagePercentage}% of your monthly credits. 
                            {credits.remaining < 100 && " AI responses will be disabled when credits are exhausted."}
                        </s-text>
                    </s-stack>
                </s-banner>
            )}

            {/* No Credits Alert */}
            {credits.remaining <= 0 && (
                <s-banner tone="critical">
                    <s-stack gap="small">
                        <s-text variant="strong">Credits Exhausted</s-text>
                        <s-text>
                            Your monthly credits have been exhausted. AI responses are disabled until your next billing period 
                            ({new Date(credits.periodEnd).toLocaleDateString()}) or until you upgrade your plan.
                        </s-text>
                    </s-stack>
                </s-banner>
            )}
        </s-page>
    );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const toggleAIEnabled = async (shop: string, enabled: boolean) => {
    // Get or create free plan
    let freePlan = await prisma.merchantPlan.findUnique({
        where: { name: "Free" }
    });

    if (!freePlan) {
        // Create free plan if it doesn't exist
        freePlan = await prisma.merchantPlan.create({
            data: {
                name: "Free",
                monthlyCredits: 1000,
                maxConcurrentChats: 2,
                price: 0,
                features: {
                    aiResponses: true,
                    basicAnalytics: true,
                    emailSupport: false,
                    customBranding: false
                }
            }
        });
    }

    const updated = await prisma.merchantCredits.upsert({
        where: { shop },
        update: { aiEnabled: enabled },
        create: {
            shop,
            planId: freePlan.id,
            aiEnabled: enabled,
            totalCredits: freePlan.monthlyCredits,
            remainingCredits: freePlan.monthlyCredits,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
    });

    return {
        success: true,
        message: `AI responses ${enabled ? 'enabled' : 'disabled'}`,
        aiEnabled: updated.aiEnabled
    };
};

const updateCreditSettings = async (shop: string, settings: any) => {
    const updated = await prisma.merchantCredits.update({
        where: { shop },
        data: {
            autoRecharge: settings.autoRecharge !== undefined ? settings.autoRecharge : undefined
        }
    });

    return {
        success: true,
        message: "Settings updated successfully",
        settings: {
            aiEnabled: updated.aiEnabled,
            autoRecharge: updated.autoRecharge
        }
    };
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

// Helper function to format feature names
const formatFeatureName = (feature: string): string => {
    return feature
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};