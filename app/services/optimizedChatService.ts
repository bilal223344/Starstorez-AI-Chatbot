/* app/services/optimizedChatService.ts */
/**
 * ============================================================================
 * OPTIMIZED CHAT SERVICE
 * ============================================================================
 * 
 * This service handles keyword detection, intent routing, and prompt optimization
 * for the chatbot. It provides fast keyword responses and smart AI routing.
 * 
 * Main Functions:
 * 1. checkKeywordResponse() - Routes queries to keyword handlers or AI
 * 2. optimizePrompt() - Builds optimized prompts for AI processing
 * 
 * ============================================================================
 */

import prisma from "app/db.server";
import { classifyIntent, normalizeTypo } from "./intentClassifier";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface KeywordResponse {
    isKeywordMatch: boolean;
    response?: string;
    productData?: Array<{
        id?: string;
        title?: string;
        price?: number;
        handle?: string;
        image?: string;
        description?: string;
    }>;
    bypassAI?: boolean;
    creditsUsed: number;
}

export interface ProductMatchInfo {
    hasRelevantResults: boolean;
    topScore?: number;
}

export interface OptimizedPrompt {
    systemPrompt: string;
    userPrompt: string;
    productContext?: string;
    tokenEstimate: number;
    fullConversationHistory?: Array<{ role: string; content: string }>;
    messagesForAI?: Array<{ role: "user" | "assistant"; content: string }>;
}

// ============================================================================
// KEYWORD ROUTER (The "Smart Guardrail")
// ============================================================================

/**
 * Main router function that checks if a query can be handled by keyword responses
 * or needs AI processing.
 * 
 * Flow:
 * 1. Normalize input (fix typos)
 * 2. Check for pronouns (force AI if found)
 * 3. Classify intent
 * 4. Route to appropriate handler
 */
export const checkKeywordResponse = async (
    shop: string,
    userMessage: string
): Promise<KeywordResponse> => {
    // Step 1: Normalize message (fix common typos)
    const normalizedMessage = normalizeTypo(userMessage);

    // Step 2: Pronoun Guard - If user refers to "it/that", FORCE AI to use context.
    // Keyword search is stateless and fails here.
    if (/\b(it|that|them|those|this|one|ones)\b/i.test(normalizedMessage)) {
        return { isKeywordMatch: false, creditsUsed: 0 };
    }

    // Step 3: Classify user intent
    const classification = classifyIntent(normalizedMessage);

    // Step 4: Route based on intent
    switch (classification.intent) {
        case "COMPLIMENT":
            return handleCompliment();

        case "GREETING":
            return handleGreeting();

        case "POLICY_QUERY":
            // CRITICAL: Policies NEVER return products. Fixes "Furniture Fallback".
            return await handlePolicyQuery(
                shop,
                normalizedMessage,
                classification.extractedInfo?.policyType
            );

        case "ORDER_STATUS":
            return await handleOrderStatusQuery(shop);

        case "ADD_TO_CART":
            return handleAddToCartQuery();

        case "PRODUCT_QUERY":
            // FIX 1: "Cheap Items" Bug - Generic Nouns Detection
            // Handles "Generic Noun" Bug: "items", "products", "stuff" are NOT categories
            // When user says "Show me cheap items", we should use DB sort, not AI search
            if (isPriceQuery(normalizedMessage)) {
                // Step 1: Define generic nouns that are NOT specific product categories
                const genericNouns = [
                    'item', 'items', 'product', 'products', 'stuff', 
                    'thing', 'things', 'goods', 'inventory'
                ];
                const words = normalizedMessage.split(/\s+/).filter(w => w.length > 0);
                const hasGenericNoun = words.some(w => genericNouns.includes(w.toLowerCase()));
                
                // Step 2: Check if message contains a specific product category from this store
                const hasSpecificCategory = await containsProductCategory(shop, normalizedMessage);
                
                // Step 3: Routing decision
                // - If message has a SPECIFIC category (e.g., "jewelry", "tires") AND NOT a generic noun -> Use AI
                //   Example: "Cheap jewelry" -> AI (jewelry is a real category)
                // - If message has ONLY generic nouns (e.g., "items", "stuff") -> Use Keyword Handler (DB Sort)
                //   Example: "Cheap items" -> Keyword Handler (items is generic, not a category)
                // - If message has neither -> Use Keyword Handler (simple price sort)
                if (hasSpecificCategory && !hasGenericNoun) {
                    return { isKeywordMatch: false, creditsUsed: 0 }; // Go to AI for category-specific search
                }
                
                // Use DB Sort for generic queries (works for ANY merchant's inventory)
                return await handlePriceQuery(shop, normalizedMessage);
            }

            // Best Sellers & New Arrivals are usually safe for Keywords
            if (isBestSellerQuery(normalizedMessage)) {
                return await handleBestSellerQuery(shop);
            }
            if (isNewArrivalsQuery(normalizedMessage)) {
                return await handleNewArrivalsQuery(shop);
            }

            // Default: Let AI handle specific product lookups
            return { isKeywordMatch: false, creditsUsed: 0 };

        default:
            return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

// ============================================================================
// PROMPT BUILDER (The "Chameleon")
// ============================================================================

/**
 * Builds optimized prompt for AI processing with context and history.
 * 
 * Steps:
 * 1. Build dynamic system prompt (reads DB to define store persona)
 * 2. Build product context (only if relevant)
 * 3. Format conversation history for API
 * 4. Estimate token usage
 */
export const optimizePrompt = async (
    shop: string,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    aiSettings: {
        responseTone?: { selectedTone?: string[] };
        policies?: { shipping?: string };
    } | null,
    pineconeMatches: Array<{
        metadata?: Record<string, unknown>;
        score?: number;
    }>,
    matchInfo?: ProductMatchInfo
): Promise<OptimizedPrompt> => {
    // Step 1: Build Dynamic System Prompt (Reads DB to define Store Persona)
    const systemPrompt = await buildChameleonSystemPrompt(
        shop,
        aiSettings,
        matchInfo
    );

    // Step 2: Build Product Context (Only if relevant)
    let productContext: string | undefined;
    const isRefinement = /\b(it|that|them|one|red|blue|cheaper|smaller|larger)\b/i.test(
        userMessage
    );

    // If matches found, use them
    if (matchInfo?.hasRelevantResults && pineconeMatches.length > 0) {
        productContext = pineconeMatches
            .filter(m => m.metadata?.type === "PRODUCT")
            .map(m => `${m.metadata?.title}: $${m.metadata?.price}`)
            .join("\n");
    }
    // If NO matches, but it IS a refinement, leave context undefined so AI uses History
    else if (matchInfo && !matchInfo.hasRelevantResults && isRefinement) {
        productContext = undefined; // AI relies on Memory
    }
    // If NO matches and NO refinement, clear context (Avoid "Clay Pot" for "Sneaker" fallback)
    else {
        productContext = undefined;
    }

    // Step 3: Format History for API
    const messagesForAI = conversationHistory
        .filter(msg => msg.role !== "system")
        .map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
        }));

    // Step 4: Estimate tokens
    const textBlock =
        systemPrompt +
        userMessage +
        (productContext || "") +
        messagesForAI.map(m => m.content).join("");
    const tokenEstimate = Math.ceil(textBlock.split(/\s+/).length / 0.75);

    return {
        systemPrompt,
        userPrompt: userMessage,
        productContext,
        tokenEstimate,
        messagesForAI,
        fullConversationHistory: conversationHistory
    };
};

// ============================================================================
// HELPER FUNCTIONS - Step by Step
// ============================================================================

/**
 * Builds dynamic system prompt that adapts to store's actual product categories.
 * This prevents hallucinations (e.g., selling laptops in a shoe store).
 */
async function buildChameleonSystemPrompt(
    shop: string,
    aiSettings: {
        responseTone?: { selectedTone?: string[] };
        policies?: { shipping?: string };
    } | null,
    matchInfo?: ProductMatchInfo
): Promise<string> {
    // Step 1: Fetch actual categories from tags/collections to prevent hallucinations
    let topCategories: string[] = [];
    try {
        const products = await prisma.product.findMany({
            where: { shop },
            select: { tags: true, collection: true },
            take: 200
        });

        // Step 2: Count category frequency from tags and collections
        const categoryCount = new Map<string, number>();
        products.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach((tag: string) => {
                    if (tag && tag.length > 2) {
                        const lower = tag.toLowerCase();
                        categoryCount.set(lower, (categoryCount.get(lower) || 0) + 1);
                    }
                });
            }
            if (p.collection && Array.isArray(p.collection)) {
                p.collection.forEach((col: string) => {
                    if (col && col.length > 2) {
                        const lower = col.toLowerCase();
                        categoryCount.set(lower, (categoryCount.get(lower) || 0) + 1);
                    }
                });
            }
        });

        // Step 3: Get top 5 most common categories
        topCategories = Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat]) => cat)
            // FIX: Filter out internal/admin-only labels like "Automated Collection"
            // These are Shopify admin terms and should never be shown to customers.
            .filter(
                c =>
                    !c.toLowerCase().includes("automated") &&
                    !c.toLowerCase().includes("collection")
            );
    } catch (error) {
        console.error("[PROMPT] Error fetching categories:", error);
    }

    // Step 4: Build category list
    const catList =
        topCategories.length > 0
            ? topCategories.join(", ")
            : "General Merchandise";

    // Step 5: Build base prompt
    let prompt = `You are a helpful store assistant. Be friendly, concise, and answer only what's asked.\n`;
    prompt += `Store specializes in: [${catList}].\n\n`;

    // EXPLICIT CONTEXT & MEMORY INSTRUCTIONS
    // This tells the AI: "If I didn't give you products, look at what we just talked about."
    prompt += `CONTEXT RULES:\n`;
    prompt += `- I will provide a 'PRODUCT CONTEXT' block. If it is populated, you MUST treat those as real products from our store and prioritize them in your answer.\n`;
    prompt += `- If 'PRODUCT CONTEXT' is empty (or missing), you MUST refer to the 'CONVERSATION HISTORY'.\n`;
    prompt += `- If the user says "it", "that", or "them", identify the product from the last message in history.\n`;
    prompt += `- Combine filters across turns (e.g., "Summer" + "Under $20" = Summer items <$20).\n\n`;

    // THE MAGIC FIX FOR "WE DON'T SELL THAT"
    prompt += `CRITICAL INVENTORY RULES:\n`;
    // 1. PRIORITY OVERRIDE: product context always wins over category assumptions
    prompt += `1. PRIORITY OVERRIDE: If the 'PRODUCT CONTEXT' block below contains products, you MUST assume we sell them and present them to the user. Do not filter them out based on the category list.\n`;
    // 2. Only if no product context, use categories
    prompt += `2. If 'PRODUCT CONTEXT' is empty, only then check if the request matches our categories: [${catList}].\n`;
    // 3. Explicit guard for obviously unsupported verticals
    prompt += `3. If the user asks for "Food", "Electronics", or "Services" and they are NOT in the context, say "We don't sell that".\n`;
    prompt += `4. In all cases, do not invent products. Use only the 'PRODUCT CONTEXT' block or the real conversation history when referencing specific items.\n`;

    // Step 6: Add context about search results
    if (matchInfo && !matchInfo.hasRelevantResults) {
        prompt += `- NOTE: No new products matched this query. If the user is refining ("blue ones"), use memory. If looking for new items, apologize.\n`;
    }

    // Step 7: Add Tone & Policies from Settings
    const tone = aiSettings?.responseTone?.selectedTone?.[0] || "friendly";
    prompt += `Tone: ${tone}.\n`;

    // Step 8: Add policies if available (concise)
    const policies = aiSettings?.policies || {};
    if (policies.shipping?.trim()) {
        prompt += `Shipping: ${policies.shipping.substring(0, 150)}.\n`;
    }

    return prompt;
}

/**
 * Checks if the user message contains a known category from THIS store.
 * Used to route "Cheap Jewelry" to AI instead of dumb price handler.
 */
async function containsProductCategory(
    shop: string,
    message: string
): Promise<boolean> {
    try {
        // Step 1: Fetch products from this shop
        const products = await prisma.product.findMany({
            where: { shop },
            select: { tags: true, collection: true, title: true },
            take: 100
        });

        // Step 2: Build set of valid category terms
        const validTerms = new Set<string>();
        products.forEach(p => {
            // Add tags as categories
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach((tag: string) => {
                    if (tag && tag.length > 2) validTerms.add(tag.toLowerCase());
                });
            }
            // Add collections as categories
            if (p.collection && Array.isArray(p.collection)) {
                p.collection.forEach((col: string) => {
                    if (col && col.length > 2) validTerms.add(col.toLowerCase());
                });
            }
            // Extract common words from titles (longer words are likely categories)
            if (p.title) {
                const titleWords = p.title.toLowerCase().split(/\s+/);
                titleWords.forEach(word => {
                    if (word.length > 4 && word.length < 20) validTerms.add(word);
                });
            }
        });

        // Step 3: Check if message contains any valid category term
        const lowerMsg = message.toLowerCase();
        return Array.from(validTerms).some(term => lowerMsg.includes(term));
    } catch {
        return false;
    }
}

// ============================================================================
// KEYWORD DETECTION FUNCTIONS (Return boolean)
// ============================================================================

/**
 * Checks if message is a price-related query
 */
const isPriceQuery = (message: string): boolean => {
    const priceKeywords = [
        "cheap",
        "cheapest",
        "expensive",
        "cost",
        "price",
        "budget",
        "under",
        "below",
        "above",
        "over",
        "affordable",
        "lowest",
        "highest"
    ];
    return priceKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

/**
 * Checks if message is asking for best-selling products
 */
const isBestSellerQuery = (message: string): boolean => {
    const bestSellerKeywords = [
        "best seller",
        "bestseller",
        "best selling",
        "popular",
        "top selling",
        "most bought",
        "most sold",
        "trending",
        "hot",
        "recommended",
        "most popular",
        "top products",
        "customer favorites",
        "fan favorites",
        "what sells most",
        "most ordered",
        "top picks",
        "customer choice"
    ];
    return bestSellerKeywords.some(keyword =>
        message.toLowerCase().includes(keyword)
    );
};

/**
 * Checks if message is asking for new arrivals
 * FIX: "Fresh Fruit" bug - exclude "fresh fruit" from new arrivals
 */
const isNewArrivalsQuery = (message: string): boolean => {
    if (message.includes("fresh fruit")) return false;
    const newArrivalsKeywords = [
        "new arrival",
        "new product",
        "latest",
        "newest",
        "just arrived",
        "recently added",
        "fresh",
        "what's new"
    ];
    return newArrivalsKeywords.some(keyword =>
        message.toLowerCase().includes(keyword)
    );
};

// ============================================================================
// KEYWORD RESPONSE HANDLERS
// ============================================================================

/**
 * Handles price-related queries (cheapest, most expensive, etc.)
 */
const handlePriceQuery = async (
    shop: string,
    message: string
): Promise<KeywordResponse> => {
    try {
        // Step 1: Determine sort order based on message
        let sortOrder: "asc" | "desc" = "asc"; // Default to cheapest
        if (
            message.includes("expensive") ||
            message.includes("premium") ||
            message.includes("luxury")
        ) {
            sortOrder = "desc";
        }

        // Step 2: Query products from database sorted by price
        const products = await prisma.product.findMany({
            where: { shop },
            orderBy: { price: sortOrder },
            take: 5,
            select: {
                title: true,
                price: true,
                handle: true,
                image: true
            }
        });

        // Step 3: Handle no products case
        if (products.length === 0) {
            return {
                isKeywordMatch: true,
                response:
                    "I don't have any products to show you right now. Please check back later!",
                bypassAI: true,
                creditsUsed: 0.5
            };
        }

        // Step 4: Build response
        const priceLabel = sortOrder === "asc" ? "most affordable" : "premium";
        const response =
            `Here are our ${priceLabel} products:\n\n` +
            products
                .map((p, i) => `${i + 1}. **${p.title}** - $${p.price}`)
                .join("\n") +
            "\n\nWould you like more details about any of these products?";

        return {
            isKeywordMatch: true,
            response,
            productData: products.map(p => ({
                title: p.title,
                price: p.price,
                handle: p.handle || undefined,
                image: p.image || undefined
            })),
            bypassAI: true,
            creditsUsed: 0.5
        };
    } catch (error) {
        console.error("[KEYWORD] Price query error:", error);
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

/**
 * Handles best-selling product queries using actual sales data
 */
const handleBestSellerQuery = async (
    shop: string
): Promise<KeywordResponse> => {
    try {
        // Step 1: Get all products for this shop
        const shopProducts = await prisma.product.findMany({
            where: { shop },
            select: { prodId: true, title: true }
        });

        const shopProductIds = shopProducts.map(p => p.prodId);

        if (shopProductIds.length === 0) {
            return {
                isKeywordMatch: true,
                response:
                    "We're still setting up our product catalog. Please check back soon for our best-selling items!",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Step 2: Get recent sales data (last 90 days)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        let bestSellersData = await prisma.orderItem.groupBy({
            by: ["productName", "productId"],
            where: {
                productId: { in: shopProductIds },
                order: {
                    createdAt: { gte: threeMonthsAgo }
                }
            },
            _sum: { quantity: true },
            _count: { productId: true },
            orderBy: {
                _sum: { quantity: "desc" }
            },
            take: 8
        });

        // Step 3: If no recent sales, fall back to all-time sales
        if (bestSellersData.length === 0) {
            // @ts-expect-error Prisma groupBy orderBy/take typing
            bestSellersData = await prisma.orderItem.groupBy({
                by: ["productName", "productId"],
                where: {
                    productId: { in: shopProductIds }
                },
                _sum: { quantity: true },
                _count: { productId: true },
                orderBy: {
                    _sum: { quantity: "desc" }
                },
                take: 8
            });
        }

        if (bestSellersData.length === 0) {
            return {
                isKeywordMatch: true,
                response:
                    "We're just getting started! Check back soon to see our best-selling products as customers start shopping!",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Step 4: Get full product details
        const productIds = bestSellersData.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: {
                shop,
                prodId: { in: productIds }
            },
            select: {
                prodId: true,
                title: true,
                price: true,
                handle: true,
                image: true
            }
        });

        // Step 5: Match products with sales data and sort
        const productsWithSales = products
            .map(product => {
                const salesData = bestSellersData.find(
                    item => item.productId === product.prodId
                );
                return {
                    ...product,
                    totalSold: salesData?._sum.quantity || 0
                };
            })
            .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));

        // Step 6: Build response
        const productList = productsWithSales
            .slice(0, 6)
            .map(
                (p, i) =>
                    `${i + 1}. **${p.title}** - $${p.price}`
            )
            .join("\n");

        const response =
            `Here are our best-selling products:\n\n${productList}\n\nThese are customer favorites! Would you like more details about any of these products?`;

        return {
            isKeywordMatch: true,
            response,
            productData: productsWithSales.map(p => ({
                title: p.title,
                price: p.price,
                handle: p.handle || undefined,
                image: p.image || undefined
            })),
            bypassAI: true,
            creditsUsed: 0.5
        };
    } catch (error) {
        console.error("[KEYWORD] Best seller query error:", error);
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

/**
 * Handles new arrivals queries
 */
const handleNewArrivalsQuery = async (
    shop: string
): Promise<KeywordResponse> => {
    try {
        // Step 1: Get newest products from database
        const products = await prisma.product.findMany({
            where: { shop },
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
                title: true,
                price: true,
                handle: true,
                image: true
            }
        });

        if (products.length === 0) {
            return {
                isKeywordMatch: true,
                response:
                    "We're working on adding new products! Check back soon for our latest arrivals!",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Step 2: Build response
        const productList = products
            .map((p, i) => `${i + 1}. **${p.title}** - $${p.price}`)
            .join("\n");

        const response =
            `Here are our newest products:\n\n${productList}\n\nWould you like more details about any of these?`;

        return {
            isKeywordMatch: true,
            response,
            productData: products.map(p => ({
                title: p.title,
                price: p.price,
                handle: p.handle || undefined,
                image: p.image || undefined
            })),
            bypassAI: true,
            creditsUsed: 0.5
        };
    } catch (error) {
        console.error("[KEYWORD] New arrivals query error:", error);
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

/**
 * Handles greeting messages
 */
const handleGreeting = (): KeywordResponse => {
    const greetings = [
        "Hello! How can I help you today? 😊",
        "Hi there! What can I help you find?",
        "Hey! I'm here to help. What are you looking for?",
        "Welcome! How can I assist you today?",
        "Hi! What can I help you with?"
    ];

    const response = greetings[Math.floor(Math.random() * greetings.length)];

    return {
        isKeywordMatch: true,
        response,
        bypassAI: true,
        creditsUsed: 0.1
    };
};

/**
 * Handles compliment messages
 */
const handleCompliment = (): KeywordResponse => {
    const responses = [
        "Thank you so much! 😊 We really appreciate your kind words and are thrilled to help you!",
        "That means a lot to us! Thank you for the wonderful feedback! 😊",
        "You're so kind! We're here to make your shopping experience the best it can be!",
        "Thank you! We're grateful for your support and happy to assist you! 😊",
        "That's so nice of you to say! We truly appreciate it and are here whenever you need us!"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
        isKeywordMatch: true,
        response,
        bypassAI: true,
        creditsUsed: 0.1
    };
};

/**
 * Handles add to cart queries - provides manual instructions
 */
const handleAddToCartQuery = (): KeywordResponse => {
    return {
        isKeywordMatch: true,
        response:
            "I cannot add items to the cart for you directly. To add an item to your cart:\n\n1. **Click on the product** you're interested in to view its product page\n2. **Select your options** (size, color, quantity, etc.) if applicable\n3. **Click the 'Add to Cart' button** on the product page\n4. You can continue shopping or proceed to checkout\n\nIf you need help finding a specific product or have questions about an item, I'm happy to help! 😊",
        bypassAI: true,
        creditsUsed: 0.2
    };
};

/**
 * Handles order status queries - provides tracking guidance
 */
const handleOrderStatusQuery = async (shop: string): Promise<KeywordResponse> => {
    try {
        // Step 1: Get store information
        const aiSettings = await prisma.aISettings.findUnique({
            where: { shop }
        });

        const settings = aiSettings?.settings as {
            storeDetails?: { name?: string };
        } | null;
        const storeDetails = settings?.storeDetails || {};
        const storeName = storeDetails.name || extractStoreNameFromShop(shop);

        // Step 2: Build helpful guidance response
        let response = `I'd be happy to help you check your order status! 😊\n\n`;
        response += `**Here's how you can track your order from ${storeName}:**\n\n`;
        response += `1. **Check your email** - You should have received an order confirmation email with your order number and a tracking link.\n\n`;
        response += `2. **Visit your account** - If you created an account, log in to your account on our website to view all your orders and their current status.\n\n`;
        response += `3. **Use the tracking link** - Click the tracking link in your confirmation email to see real-time updates from the shipping carrier.\n\n`;
        response += `4. **Contact support** - If you can't find your order confirmation or need additional help, please contact our support team with your order number or the email address you used for your purchase.\n\n`;
        response += `**Need your order number?** It's usually in the format like #12345 and can be found in:\n`;
        response += `• Your order confirmation email\n`;
        response += `• Your account order history\n`;
        response += `• Your receipt (if you received one)\n\n`;
        response += `Is there anything else I can help you with regarding your order?`;

        return {
            isKeywordMatch: true,
            response,
            bypassAI: true,
            creditsUsed: 0.2
        };
    } catch (error) {
        console.error("[KEYWORD] Order status query error:", error);
        // Fallback response
        return {
            isKeywordMatch: true,
            response:
                "I'd be happy to help you check your order status! 😊\n\n**Here's how you can track your order:**\n\n1. **Check your email** - Look for your order confirmation email which contains your order number and tracking link.\n\n2. **Visit your account** - Log in to your account on our website to view all your orders and their current status.\n\n3. **Use the tracking link** - Click the tracking link in your confirmation email for real-time shipping updates.\n\n4. **Contact support** - If you need additional help, please contact our support team with your order number or email address.\n\nIs there anything else I can help you with?",
            bypassAI: true,
            creditsUsed: 0.2
        };
    }
};

/**
 * Handles policy queries - CRITICAL: NEVER returns products
 * Fixes "Furniture Fallback Bug" - policy questions should only return policy info
 */
const handlePolicyQuery = async (
    shop: string,
    message: string,
    policyTypeHint?: "shipping" | "return" | "refund" | "payment" | "privacy" | "terms"
): Promise<KeywordResponse> => {
    try {
        // Step 1: Get AI settings to fetch policy information
        const aiSettings = await prisma.aISettings.findUnique({
            where: { shop }
        });

        const settings = aiSettings?.settings as {
            policies?: {
                shipping?: string;
                returns?: string;
                refunds?: string;
                refund?: string;
                payment?: string;
                privacy?: string;
                terms?: string;
            };
        } | null;
        const policies = settings?.policies || {};

        // Step 2: Determine policy type
        const lowerMessage = message.toLowerCase();
        let policyType = "";
        let policyContent = "";

        if (policyTypeHint) {
            // Use the classified policy type
            switch (policyTypeHint) {
                case "shipping":
                    policyType = "Shipping Policy";
                    policyContent = policies.shipping || "";
                    break;
                case "return":
                    policyType = "Return Policy";
                    policyContent = policies.returns || "";
                    break;
                case "refund":
                    policyType = "Refund Policy";
                    policyContent = policies.refunds || policies.refund || "";
                    break;
                case "payment":
                    policyType = "Payment Policy";
                    policyContent = policies.payment || "";
                    break;
                case "privacy":
                    policyType = "Privacy Policy";
                    policyContent = policies.privacy || "";
                    break;
                case "terms":
                    policyType = "Terms of Service";
                    policyContent = policies.terms || "";
                    break;
            }
        } else {
            // Fallback: auto-detect from message
            if (lowerMessage.includes("shipping")) {
                policyType = "Shipping Policy";
                policyContent = policies.shipping || "";
            } else if (lowerMessage.includes("return")) {
                policyType = "Return Policy";
                policyContent = policies.returns || "";
            } else if (lowerMessage.includes("refund")) {
                policyType = "Refund Policy";
                policyContent = policies.refunds || policies.refund || "";
            } else if (lowerMessage.includes("payment")) {
                policyType = "Payment Policy";
                policyContent = policies.payment || "";
            } else if (lowerMessage.includes("privacy")) {
                policyType = "Privacy Policy";
                policyContent = policies.privacy || "";
            } else if (lowerMessage.includes("terms")) {
                policyType = "Terms of Service";
                policyContent = policies.terms || "";
            }
        }

        // Step 3: Handle no specific policy found
        if (!policyType && !policyContent) {
            const availablePolicies = [];
            if (policies.shipping?.trim()) availablePolicies.push("Shipping");
            if (policies.returns?.trim()) availablePolicies.push("Returns");
            if (policies.refunds?.trim() || policies.refund?.trim())
                availablePolicies.push("Refunds");
            if (policies.privacy?.trim()) availablePolicies.push("Privacy");
            if (policies.terms?.trim()) availablePolicies.push("Terms of Service");
            if (policies.payment?.trim()) availablePolicies.push("Payment");

            if (availablePolicies.length > 0) {
                // CRITICAL: Policy queries NEVER return products
                return {
                    isKeywordMatch: true,
                    response: `I'd be happy to help you with our store policies! 😊 Here's what I can tell you about:\n\n• ${availablePolicies.join("\n• ")}\n\nWhich specific policy would you like to learn more about? Just let me know and I'll provide the details!`,
                    productData: [], // Explicitly empty
                    bypassAI: true,
                    creditsUsed: 0.3
                };
            } else {
                // Even with no configured policies, provide a helpful response
                const storeName = extractStoreNameFromShop(shop);
                // CRITICAL: Policy queries NEVER return products
                return {
                    isKeywordMatch: true,
                    response: `I'd love to help you with our store policies! 😊 While I'm getting the detailed policy information ready, I can tell you that ${storeName} is committed to providing excellent customer service.\n\nFor the most up-to-date information about our shipping, returns, and other policies, please feel free to contact our support team or check our website. Is there anything specific about our policies you'd like to know? I'm here to help!`,
                    productData: [], // Explicitly empty
                    bypassAI: true,
                    creditsUsed: 0.3
                };
            }
        }

        // Step 4: Return specific policy content
        if (policyContent && policyType) {
            // Truncate very long policies for chat-friendly response
            const maxLength = 400;
            let responseContent = policyContent.trim();

            if (responseContent.length > maxLength) {
                // Try to break at sentence end if possible
                const truncated = responseContent.substring(0, maxLength);
                const lastSentence = truncated.lastIndexOf(".");
                if (lastSentence > maxLength - 100) {
                    responseContent = truncated.substring(0, lastSentence + 1);
                } else {
                    responseContent = truncated + "...";
                }
            }

            // CRITICAL: Policy queries NEVER return products
            return {
                isKeywordMatch: true,
                response: `Here's our **${policyType}**:\n\n${responseContent}\n\nFor complete details, please visit our website or contact support.`,
                productData: [], // Explicitly empty
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Step 5: Fallback if policy type found but no content
        const storeName = extractStoreNameFromShop(shop);
        return {
            isKeywordMatch: true,
            response: `Great question about our ${policyType.toLowerCase()}! 😊 While I'm getting those specific details organized for you, I want to assure you that ${storeName} is committed to fair and transparent policies.\n\nFor the most current ${policyType.toLowerCase()} information, I'd recommend checking our website or contacting our support team - they'll have all the detailed information you need. In the meantime, is there anything else I can help you with today?`,
            productData: [], // Explicitly empty
            bypassAI: true,
            creditsUsed: 0.3
        };
    } catch (error) {
        console.error("[KEYWORD] Policy query error:", error);
        const storeName = extractStoreNameFromShop(shop);
        return {
            isKeywordMatch: true,
            response: `I'd love to help you with our store policies! 😊 While I'm getting the detailed policy information ready, I can tell you that ${storeName} is committed to providing excellent customer service.\n\nFor the most up-to-date information about our shipping, returns, and other policies, please feel free to contact our support team or check our website. Is there anything specific about our policies you'd like to know? I'm here to help!`,
            productData: [], // Explicitly empty
            bypassAI: true,
            creditsUsed: 0.3
        };
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extracts store name from shop domain
 */
const extractStoreNameFromShop = (shop: string): string => {
    const storeName = shop.replace(".myshopify.com", "").replace(/-/g, " ");
    return storeName
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
