import { ActionFunctionArgs } from "react-router";
import { checkKeywordResponse } from "app/services/optimizedChatService";
import { checkCreditsAvailable } from "app/services/creditService";

// Helper function to return JSON responses with CORS
const json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...init?.headers,
        },
    });
};

// ============================================================================
// POST - Test the optimized chat system
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const body = await request.json();
        const { shop, message, testType = "keyword" } = body;

        if (!shop || !message) {
            return json({ 
                error: "Shop and message are required",
                usage: "POST /api/chat/test with { shop: 'store.myshopify.com', message: 'hello', testType: 'keyword|credits|both' }"
            }, { status: 400 });
        }

        const results: any = {
            success: true,
            shop,
            message,
            testType,
            timestamp: new Date().toISOString()
        };

        // Test credit system
        if (testType === "credits" || testType === "both") {
            console.log(`[TEST] Checking credits for: ${shop}`);
            const creditCheck = await checkCreditsAvailable(shop);
            results.credits = {
                hasCredits: creditCheck.hasCredits,
                remainingCredits: creditCheck.remainingCredits,
                canProcessRequest: creditCheck.canProcessRequest,
                reason: creditCheck.reason,
                shouldHandoff: creditCheck.shouldHandoff
            };
        }

        // Test keyword system
        if (testType === "keyword" || testType === "both") {
            console.log(`[TEST] Checking keyword response for: "${message}"`);
            const keywordResult = await checkKeywordResponse(shop, message);
            results.keyword = {
                isMatch: keywordResult.isKeywordMatch,
                response: keywordResult.response,
                bypassAI: keywordResult.bypassAI,
                creditsUsed: keywordResult.creditsUsed,
                productCount: keywordResult.productData?.length || 0
            };
        }

        return json(results);

    } catch (error) {
        console.error("[TEST] Error:", error);
        return json({
            success: false,
            error: "Test failed",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
};

// ============================================================================
// GET - Show test documentation
// ============================================================================
export const loader = async () => {
    return json({
        message: "Chat Optimization Test API",
        usage: {
            method: "POST",
            body: {
                shop: "your-store.myshopify.com",
                message: "What are your cheapest products?",
                testType: "both" // "keyword", "credits", or "both"
            }
        },
        testCases: [
            {
                description: "Test price queries",
                message: "What are your cheapest products?",
                expectedResult: "Keyword match with product list"
            },
            {
                description: "Test greetings",
                message: "Hello",
                expectedResult: "Keyword match with greeting response"
            },
            {
                description: "Test best sellers",
                message: "Show me your best sellers",
                expectedResult: "Keyword match if best sellers configured"
            },
            {
                description: "Test credit system",
                testType: "credits",
                expectedResult: "Credit status and availability check"
            }
        ]
    });
};