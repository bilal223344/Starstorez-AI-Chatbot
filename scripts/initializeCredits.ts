import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeCreditsSystem() {
    console.log('🚀 Initializing Credits System...');
    
    try {
        // 1. Create default plans
        console.log('📋 Creating subscription plans...');
        
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

        const createdPlans = [];
        for (const planData of plans) {
            const plan = await prisma.merchantPlan.upsert({
                where: { name: planData.name },
                update: planData,
                create: planData
            });
            createdPlans.push(plan);
            console.log(`✅ ${plan.name} plan created (${plan.monthlyCredits} credits)`);
        }

        // 2. Set up existing merchants with free plan
        console.log('👥 Setting up existing merchants...');
        
        const existingSessions = await prisma.session.findMany({
            select: { shop: true },
            distinct: ['shop']
        });

        const freePlan = createdPlans.find(p => p.name === "Free")!;
        let merchantsSetup = 0;

        for (const session of existingSessions) {
            const existingCredits = await prisma.merchantCredits.findUnique({
                where: { shop: session.shop }
            });

            if (!existingCredits) {
                const now = new Date();
                const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

                await prisma.merchantCredits.create({
                    data: {
                        shop: session.shop,
                        planId: freePlan.id,
                        totalCredits: freePlan.monthlyCredits,
                        usedCredits: 0,
                        remainingCredits: freePlan.monthlyCredits,
                        periodStart: now,
                        periodEnd,
                        aiEnabled: true,
                        autoRecharge: true
                    }
                });

                merchantsSetup++;
                console.log(`✅ Setup credits for: ${session.shop}`);
            }
        }

        // 3. Create default chat configurations
        console.log('⚙️ Creating chat configurations...');
        
        let configsCreated = 0;
        for (const session of existingSessions) {
            const existingConfig = await prisma.chatConfiguration.findUnique({
                where: { shop: session.shop }
            });

            if (!existingConfig) {
                await prisma.chatConfiguration.create({
                    data: {
                        shop: session.shop,
                        aiEnabled: true,
                        autoHandoffEnabled: true,
                        useKeywordResponses: true,
                        maxTokensPerResponse: 500,
                        maxConcurrentRequests: 5,
                        rateLimitPerMinute: 60,
                        fallbackMessage: "I'm currently unavailable. A team member will assist you shortly!",
                        manualChatNotification: "A customer needs manual assistance in the chat."
                    }
                });
                
                configsCreated++;
            }
        }

        console.log('\n🎉 Credits System Initialization Complete!');
        console.log(`📊 Summary:`);
        console.log(`   • ${createdPlans.length} subscription plans created`);
        console.log(`   • ${merchantsSetup} merchants assigned to Free plan`);
        console.log(`   • ${configsCreated} chat configurations created`);
        console.log('\n✨ Your merchants can now use the optimized chat API with credit tracking!');
        
    } catch (error) {
        console.error('❌ Error initializing credits system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the initialization
initializeCreditsSystem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });