import prisma from "app/db.server";

export interface CreditCheckResult {
    hasCredits: boolean;
    remainingCredits: number;
    canProcessRequest: boolean;
    reason?: string;
    shouldHandoff?: boolean;
}

export interface UsageMetrics {
    creditsUsed: number;
    tokensUsed?: number;
    responseTime?: number;
    requestType: "AI_CHAT" | "KEYWORD_RESPONSE" | "MANUAL_HANDOFF";
    wasSuccessful: boolean;
    errorMessage?: string;
}

// ============================================================================
// CREDIT CHECKING & VALIDATION
// ============================================================================

export const checkCreditsAvailable = async (shop: string): Promise<CreditCheckResult> => {
    try {
        // Get merchant's current credit status
        const merchantCredits = await prisma.merchantCredits.findUnique({
            where: { shop },
            include: { plan: true }
        });

        if (!merchantCredits) {
            // No credit record - create default free plan
            const freePlan = await getOrCreateFreePlan();
            await createMerchantCredits(shop, freePlan.id);
            
            return {
                hasCredits: true,
                remainingCredits: freePlan.monthlyCredits,
                canProcessRequest: true,
                reason: "New merchant - assigned to free plan"
            };
        }

        // Check if billing period has expired
        const now = new Date();
        if (now > merchantCredits.periodEnd) {
            await resetBillingPeriod(merchantCredits.id);
            // Reload after reset
            const updatedCredits = await prisma.merchantCredits.findUnique({
                where: { id: merchantCredits.id },
                include: { plan: true }
            });
            if (updatedCredits) {
                return checkCurrentCredits(updatedCredits);
            }
        }

        return checkCurrentCredits(merchantCredits);
    } catch (error) {
        console.error("[CREDITS] Error checking credits:", error);
        return {
            hasCredits: false,
            remainingCredits: 0,
            canProcessRequest: false,
            reason: "Credit check failed",
            shouldHandoff: true
        };
    }
};

// ============================================================================
// USAGE TRACKING & BILLING
// ============================================================================

export const recordUsage = async (
    shop: string, 
    metrics: UsageMetrics,
    sessionId?: string,
    customerId?: string,
    userMessage?: string
): Promise<void> => {
    try {
        const merchantCredits = await prisma.merchantCredits.findUnique({
            where: { shop }
        });

        if (!merchantCredits) {
            console.warn(`[CREDITS] No credit record found for shop: ${shop}`);
            return;
        }

        // Create usage log entry
        await prisma.usageLog.create({
            data: {
                shop,
                merchantCreditsId: merchantCredits.id,
                requestType: metrics.requestType,
                creditsUsed: metrics.creditsUsed,
                sessionId,
                customerId,
                userMessage: userMessage ? userMessage.substring(0, 100) : null, // Truncate for privacy
                responseTime: metrics.responseTime,
                tokensUsed: metrics.tokensUsed,
                wasSuccessful: metrics.wasSuccessful,
                errorMessage: metrics.errorMessage
            }
        });

        // Update merchant credits if successful
        if (metrics.wasSuccessful) {
            await prisma.merchantCredits.update({
                where: { id: merchantCredits.id },
                data: {
                    usedCredits: {
                        increment: metrics.creditsUsed
                    },
                    remainingCredits: {
                        decrement: metrics.creditsUsed
                    },
                    totalRequests: {
                        increment: 1
                    }
                }
            });

            // Update unique user count if we have a customer ID
            if (customerId) {
                await updateUniqueUserCount(merchantCredits.id, customerId);
            }
        }
    } catch (error) {
        console.error("[CREDITS] Error recording usage:", error);
    }
};

// ============================================================================
// PLAN MANAGEMENT
// ============================================================================

export const getOrCreateFreePlan = async () => {
    let freePlan = await prisma.merchantPlan.findUnique({
        where: { name: "Free" }
    });

    if (!freePlan) {
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

    return freePlan;
};

export const createDefaultPlans = async () => {
    const plans = [
        {
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
        },
        {
            name: "Basic",
            monthlyCredits: 5000,
            maxConcurrentChats: 10,
            price: 29,
            features: {
                aiResponses: true,
                basicAnalytics: true,
                emailSupport: true,
                customBranding: false,
                prioritySupport: false
            }
        },
        {
            name: "Pro",
            monthlyCredits: 20000,
            maxConcurrentChats: 50,
            price: 99,
            features: {
                aiResponses: true,
                advancedAnalytics: true,
                emailSupport: true,
                customBranding: true,
                prioritySupport: true,
                customIntegrations: true
            }
        },
        {
            name: "Enterprise",
            monthlyCredits: 100000,
            maxConcurrentChats: 200,
            price: 299,
            features: {
                aiResponses: true,
                advancedAnalytics: true,
                emailSupport: true,
                customBranding: true,
                prioritySupport: true,
                customIntegrations: true,
                dedicatedSupport: true,
                sla: true
            }
        }
    ];

    for (const planData of plans) {
        await prisma.merchantPlan.upsert({
            where: { name: planData.name },
            update: planData,
            create: planData
        });
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const checkCurrentCredits = (merchantCredits: any): CreditCheckResult => {
    const remainingCredits = merchantCredits.remainingCredits;
    const aiEnabled = merchantCredits.aiEnabled;

    if (!aiEnabled) {
        return {
            hasCredits: false,
            remainingCredits,
            canProcessRequest: false,
            reason: "AI manually disabled by merchant",
            shouldHandoff: true
        };
    }

    if (remainingCredits <= 0) {
        return {
            hasCredits: false,
            remainingCredits: 0,
            canProcessRequest: false,
            reason: "Credits exhausted for current billing period",
            shouldHandoff: true
        };
    }

    return {
        hasCredits: true,
        remainingCredits,
        canProcessRequest: true
    };
};

const createMerchantCredits = async (shop: string, planId: string) => {
    const plan = await prisma.merchantPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    return await prisma.merchantCredits.create({
        data: {
            shop,
            planId,
            totalCredits: plan.monthlyCredits,
            usedCredits: 0,
            remainingCredits: plan.monthlyCredits,
            periodStart: now,
            periodEnd,
            aiEnabled: true,
            autoRecharge: true
        }
    });
};

const resetBillingPeriod = async (merchantCreditsId: string) => {
    const merchantCredits = await prisma.merchantCredits.findUnique({
        where: { id: merchantCreditsId },
        include: { plan: true }
    });

    if (!merchantCredits) return;

    const now = new Date();
    const newPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await prisma.merchantCredits.update({
        where: { id: merchantCreditsId },
        data: {
            totalCredits: merchantCredits.plan.monthlyCredits,
            usedCredits: 0,
            remainingCredits: merchantCredits.plan.monthlyCredits,
            periodStart: now,
            periodEnd: newPeriodEnd,
            totalRequests: 0,
            totalUsers: 0
        }
    });
};

const updateUniqueUserCount = async (merchantCreditsId: string, customerId: string) => {
    // Check if this customer has been counted in the current billing period
    const existingLog = await prisma.usageLog.findFirst({
        where: {
            merchantCreditsId,
            customerId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // If this is a new customer for this billing period, increment user count
    if (!existingLog) {
        await prisma.merchantCredits.update({
            where: { id: merchantCreditsId },
            data: {
                totalUsers: {
                    increment: 1
                }
            }
        });
    }
};