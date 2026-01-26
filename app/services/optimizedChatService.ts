import { queryPinecone } from "./openaiService";
import prisma from "app/db.server";

export interface KeywordResponse {
    isKeywordMatch: boolean;
    response?: string;
    productData?: any[];
    bypassAI?: boolean;
    creditsUsed: number;
}

export interface OptimizedPrompt {
    systemPrompt: string;
    userPrompt: string;
    productContext?: string;
    tokenEstimate: number;
}

// ============================================================================
// KEYWORD-BASED DIRECT RESPONSES
// ============================================================================

export const checkKeywordResponse = async (shop: string, userMessage: string): Promise<KeywordResponse> => {
    const message = userMessage.toLowerCase().trim();
    
    // Price-related queries
    if (isPriceQuery(message)) {
        return await handlePriceQuery(shop, message);
    }
    
    // Best sellers / popular products
    if (isBestSellerQuery(message)) {
        return await handleBestSellerQuery(shop, message);
    }
    
    // New arrivals / latest products
    if (isNewArrivalsQuery(message)) {
        return await handleNewArrivalsQuery(shop, message);
    }
    
    // Category/collection queries
    if (isCategoryQuery(message)) {
        return await handleCategoryQuery(shop, message);
    }
    
    // Simple greetings
    if (isGreeting(message)) {
        return handleGreeting();
    }

    // Policy queries (check before order status to avoid conflicts)
    if (isPolicyQuery(message)) {
        return await handlePolicyQuery(shop, message);
    }

    // CHATBOT-TESTING FIX: Order EDIT (add to order, modify) — distinct from Order STATUS (tracking)
    if (isOrderEditQuery(message)) {
        return handleOrderEditQuery();
    }

    // Order status / tracking queries
    if (isOrderStatusQuery(message)) {
        return handleOrderStatusQuery();
    }

    // General product queries
    if (isGeneralProductQuery(message)) {
        return await handleGeneralProductQuery(shop, message);
    }

    // Store information queries
    if (isStoreInfoQuery(message)) {
        return await handleStoreInfoQuery(shop, message);
    }

    return { isKeywordMatch: false, creditsUsed: 0 };
};

// ============================================================================
// PROMPT OPTIMIZATION
// ============================================================================

export interface ProductMatchInfo {
    hasRelevantResults: boolean;
    topScore?: number;
}

export const optimizePrompt = async (
    shop: string,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    aiSettings?: any,
    existingPineconeResults?: any[],
    productMatchInfo?: ProductMatchInfo
): Promise<OptimizedPrompt> => {
    
    // Build system prompt with CHATBOT-TESTING fixes (no fallback, negative constraints, exact policies)
    const systemPrompt = buildOptimizedSystemPrompt(aiSettings, productMatchInfo, userMessage);
    
    // Get relevant product context (use existing filtered results if available)
    let productContext: string | undefined;
    if (existingPineconeResults && existingPineconeResults.length > 0) {
        productContext = buildProductContextFromResults(existingPineconeResults);
    } else {
        productContext = await getRelevantProductContext(shop, userMessage);
    }
    
    // Limit conversation history to recent messages only
    const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges
    
    // Estimate tokens (rough calculation: 1 token ≈ 0.75 words)
    const tokenEstimate = estimateTokens(systemPrompt + userMessage + (productContext || '') + 
                                        recentHistory.map(m => m.content).join(' '));
    
    return {
        systemPrompt,
        userPrompt: userMessage,
        productContext,
        tokenEstimate
    };
};

// ============================================================================
// KEYWORD DETECTION FUNCTIONS
// ============================================================================

const isPriceQuery = (message: string): boolean => {
    const priceKeywords = [
        'cheapest', 'lowest price', 'most affordable', 'budget', 'under',
        'expensive', 'highest price', 'premium', 'luxury',
        'price range', 'cost', 'how much'
    ];
    return priceKeywords.some(keyword => message.includes(keyword));
};

const isBestSellerQuery = (message: string): boolean => {
    const bestSellerKeywords = [
        'best seller', 'bestseller', 'best selling', 'popular', 'top selling', 
        'most bought', 'most sold', 'trending', 'hot', 'recommended', 
        'most popular', 'top products', 'customer favorites', 'fan favorites',
        'what sells most', 'most ordered', 'top picks', 'customer choice'
    ];
    return bestSellerKeywords.some(keyword => message.includes(keyword));
};

const isNewArrivalsQuery = (message: string): boolean => {
    const newArrivalsKeywords = [
        'new arrival', 'new product', 'latest', 'newest', 'just arrived',
        'recently added', 'fresh', 'what\'s new'
    ];
    return newArrivalsKeywords.some(keyword => message.includes(keyword));
};

const isCategoryQuery = (message: string): boolean => {
    const categoryKeywords = [
        'category', 'collection', 'type', 'kind of', 'looking for',
        'show me', 'browse', 'section'
    ];
    return categoryKeywords.some(keyword => message.includes(keyword));
};

const isGreeting = (message: string): boolean => {
    const greetings = [
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'howdy', 'greetings', 'what\'s up', 'sup'
    ];
    return greetings.some(greeting => message.startsWith(greeting)) || 
           greetings.some(greeting => message === greeting);
};

const isPolicyQuery = (message: string): boolean => {
    const policyKeywords = [
        'shipping policy', 'return policy', 'refund policy', 'privacy policy',
        'terms of service', 'terms and conditions', 'policy about', 'policies',
        'how do you ship', 'shipping information', 'return information',
        'refund information', 'privacy information', 'shipping rules',
        'return rules', 'refund rules', 'terms of use', 'user agreement',
        'tell me about shipping', 'about your shipping', 'shipping details',
        'return process', 'how to return', 'can i return', 'return items',
        'refund process', 'how to get refund', 'can i get refund',
        'what is your policy', 'your policies', 'store policies', 'store policy',
        'tell me about policy', 'about policy', 'policy information',
        'what are your policies', 'company policies', 'business policies'
    ];
    return policyKeywords.some(keyword => message.includes(keyword));
};

const isOrderEditQuery = (message: string): boolean => {
    const orderEditKeywords = [
        'add to order', 'add to my order', 'add to existing order',
        'modify order', 'change my order', 'edit order', 'update order',
        'add .* to .* order', 'can i add', 'add the ', 'add the red',
        'add the blue', 'add items to', 'add something to my order'
    ];
    const lower = message.toLowerCase();
    return orderEditKeywords.some(k => {
        if (k.includes('.*')) {
            const re = new RegExp(k.replace(/\.\*/g, '\\S*'), 'i');
            return re.test(lower);
        }
        return lower.includes(k);
    }) && !isPolicyQuery(message);
};

const isOrderStatusQuery = (message: string): boolean => {
    const orderKeywords = [
        'order status', 'track order', 'where is my order',
        'delivery status', 'tracking number', 'order number', 'shipment status',
        'when will my order arrive', 'order tracking', 'track my package'
    ];
    return orderKeywords.some(keyword => message.includes(keyword)) &&
           !isOrderEditQuery(message) && !isPolicyQuery(message);
};

const isGeneralProductQuery = (message: string): boolean => {
    const generalProductKeywords = [
        'what products do you have', 'what do you sell', 'show me products',
        'what products', 'your products', 'products available', 
        'what can i buy', 'what items', 'show catalog',
        'browse products', 'see products'
    ];
    return generalProductKeywords.some(keyword => message.includes(keyword));
};

const isStoreInfoQuery = (message: string): boolean => {
    const storeInfoKeywords = [
        'store name', 'what is your store', 'your store name', 'name of store',
        'who are you', 'what store', 'store called', 'business name',
        'company name', 'shop name', 'about your store', 'tell me about your store',
        'what store is this', 'which store', 'name of this store', 'your name',
        'about you', 'about this store', 'your business', 'what business'
    ];
    return storeInfoKeywords.some(keyword => message.includes(keyword));
};

// ============================================================================
// KEYWORD RESPONSE HANDLERS
// ============================================================================

const handlePriceQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        // Extract price intent (cheapest, most expensive, range)
        let sortOrder = 'asc'; // Default to cheapest
        if (message.includes('expensive') || message.includes('premium') || message.includes('luxury')) {
            sortOrder = 'desc';
        }

        // Query products from database sorted by price
        const products = await prisma.product.findMany({
            where: { shop },
            orderBy: { price: sortOrder as 'asc' | 'desc' },
            take: 5,
            select: {
                title: true,
                price: true,
                handle: true,
                image: true,
                description: true
            }
        });

        if (products.length === 0) {
            return {
                isKeywordMatch: true,
                response: "I don't have any products to show you right now. Please check back later!",
                bypassAI: true,
                creditsUsed: 0.5 // Half credit for database query
            };
        }

        const priceLabel = sortOrder === 'asc' ? 'most affordable' : 'premium';
        const response = `Here are our ${priceLabel} products:\n\n` +
            products.map((p, i) => `${i + 1}. **${p.title}** - $${p.price}`).join('\n') +
            '\n\nWould you like more details about any of these products?';

        return {
            isKeywordMatch: true,
            response,
            productData: products,
            bypassAI: true,
            creditsUsed: 0.5
        };
    } catch (error) {
        console.error('[KEYWORD] Price query error:', error);
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

const handleBestSellerQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        console.log(`[KEYWORD] Finding best sellers from actual sales data for: ${shop}`);
        
        // Get best-selling products from OrderItem table (actual sales data)
        // First get products for this shop to filter order items
        const shopProducts = await prisma.product.findMany({
            where: { shop },
            select: { prodId: true, title: true }
        });

        const shopProductIds = shopProducts.map(p => p.prodId);

        if (shopProductIds.length === 0) {
            // No products found for this shop
            return {
                isKeywordMatch: true,
                response: "We're still setting up our product catalog. Please check back soon for our best-selling items!",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Get recent sales data (last 90 days) for more relevant results
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

        let bestSellersData = await prisma.orderItem.groupBy({
            by: ['productName', 'productId'],
            where: {
                productId: {
                    in: shopProductIds
                },
                order: {
                    createdAt: {
                        gte: threeMonthsAgo
                    }
                }
            },
            _sum: {
                quantity: true
            },
            _count: {
                productId: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 8 // Top 8 best sellers
        });

        // If no recent sales, fall back to all-time sales
        if (bestSellersData.length === 0) {
            console.log(`[KEYWORD] No recent sales found, checking all-time sales for: ${shop}`);
            // @ts-expect-error Prisma groupBy orderBy/take typing
            bestSellersData = await prisma.orderItem.groupBy({
                by: ['productName', 'productId'],
                where: {
                    productId: {
                        in: shopProductIds
                    }
                },
                _sum: { quantity: true },
                _count: { productId: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 8
            });
        }

        if (bestSellersData.length === 0) {
            // Fallback to AI settings if no sales data
            const aiSettings = await prisma.aISettings.findUnique({
                where: { shop }
            });

            const predefinedBestSellers = (aiSettings?.settings as any)?.bestSellers || [];
            
            if (predefinedBestSellers.length > 0) {
                const response = "Here are our best-selling products:\n\n" +
                    predefinedBestSellers.slice(0, 5).map((p: any, i: number) => 
                        `${i + 1}. **${p.title}** - ${p.description || 'Popular choice!'}`
                    ).join('\n') +
                    '\n\nWould you like to know more about any of these?';

                return {
                    isKeywordMatch: true,
                    response,
                    productData: predefinedBestSellers.slice(0, 5),
                    bypassAI: true,
                    creditsUsed: 0.3
                };
            }

            // No sales data and no predefined best sellers
            return {
                isKeywordMatch: true,
                response: "We don't have sales data available yet, but I'd be happy to show you our featured products! Would you like to see our latest arrivals or browse by category?",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Get detailed product information for the best sellers
        const productIds = bestSellersData
            .map(item => item.productId)
            .filter(Boolean) as string[];

        let detailedProducts: any[] = [];
        
        if (productIds.length > 0) {
            detailedProducts = await prisma.product.findMany({
                where: {
                    shop: shop,
                    prodId: {
                        in: productIds
                    }
                },
                select: {
                    title: true,
                    price: true,
                    handle: true,
                    image: true,
                    prodId: true
                }
            });
        }

        // Merge sales data with product details
        const bestSellersWithDetails = bestSellersData.map((item, index) => {
            const productDetail = detailedProducts.find(p => p.prodId === item.productId);
            
            return {
                title: productDetail?.title || item.productName,
                price: productDetail?.price || null,
                handle: productDetail?.handle || null,
                image: productDetail?.image || null
            };
        }).slice(0, 6); // Top 6 for display

        // Create formatted response - check if we have recent sales
        const hasRecentSales = bestSellersData.some(item => item._sum.quantity && item._sum.quantity > 0);
        const timeFrame = hasRecentSales ? "in the last 3 months" : "of all time";
        
        const productList = bestSellersWithDetails.map((product, i) => {
            const priceText = product.price ? ` - $${product.price}` : '';
            return `${i + 1}. **${product.title}**${priceText}`;
        }).join('\n');

        const response = `Here are our best-selling products ${timeFrame}:\n\n${productList}\n\nThese are proven customer favorites! Would you like more details about any of these products?`;

        return {
            isKeywordMatch: true,
            response,
            productData: bestSellersWithDetails,
            bypassAI: true,
            creditsUsed: 0.4 // Slightly higher cost for sales data analysis
        };

    } catch (error) {
        console.error('[KEYWORD] Best seller query error:', error);
        // Fall back to AI if database query fails
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

const handleNewArrivalsQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        // Get AI settings for predefined new arrivals
        const aiSettings = await prisma.aISettings.findUnique({
            where: { shop }
        });

        const newArrivals = (aiSettings?.settings as any)?.newArrivals || [];
        
        if (newArrivals.length > 0) {
            const response = "Check out our newest arrivals:\n\n" +
                newArrivals.slice(0, 5).map((p: any, i: number) => 
                    `${i + 1}. **${p.title}** - ${p.description}`
                ).join('\n') +
                '\n\nAnything catch your eye?';

            return {
                isKeywordMatch: true,
                response,
                productData: newArrivals.slice(0, 5),
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Fallback to recent products from database
        const recentProducts = await prisma.product.findMany({
            where: { shop },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                title: true,
                price: true,
                handle: true,
                image: true,
                description: true
            }
        });

        if (recentProducts.length > 0) {
            const response = "Here are our latest products:\n\n" +
                recentProducts.map((p, i) => `${i + 1}. **${p.title}** - $${p.price}`).join('\n');

            return {
                isKeywordMatch: true,
                response,
                productData: recentProducts,
                bypassAI: true,
                creditsUsed: 0.5
            };
        }

        return { isKeywordMatch: false, creditsUsed: 0 };
    } catch (error) {
        console.error('[KEYWORD] New arrivals query error:', error);
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

const handleCategoryQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    // This would require category detection and product filtering
    // For now, return false to let AI handle it
    return { isKeywordMatch: false, creditsUsed: 0 };
};

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
        creditsUsed: 0.1 // Very low cost for greetings
    };
};

const handleOrderEditQuery = (): KeywordResponse => {
    return {
        isKeywordMatch: true,
        response: "To add items to an existing order, please contact our support team as soon as possible—we'll do our best to accommodate you before it ships. Have your order number and the items you'd like to add ready. If you'd prefer to place a new order instead, I can help you with that! 😊",
        bypassAI: true,
        creditsUsed: 0.2
    };
};

const handleOrderStatusQuery = (): KeywordResponse => {
    return {
        isKeywordMatch: true,
        response: "I'd be happy to help you track your order! Could you please provide your order number or the email address you used for your purchase?",
        bypassAI: true,
        creditsUsed: 0.2
    };
};

const handleGeneralProductQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        console.log(`[KEYWORD] Handling general product query for: ${shop}`);
        
        // Get a variety of products from database (mix of different categories/prices)
        const products = await prisma.product.findMany({
            where: { shop },
            orderBy: [
                { createdAt: 'desc' }, // Recent products first
            ],
            take: 8, // Show up to 8 products
            select: {
                title: true,
                price: true,
                handle: true,
                image: true,
                tags: true
            }
        });

        if (products.length === 0) {
            return {
                isKeywordMatch: true,
                response: "We're currently updating our product catalog. Please check back soon, or feel free to ask about specific items you're looking for!",
                bypassAI: true,
                creditsUsed: 0.3
            };
        }

        // Create a nice formatted response
        const productList = products.slice(0, 6).map((p, i) => {
            const priceText = p.price ? `$${p.price}` : 'Price on request';
            return `${i + 1}. **${p.title}** - ${priceText}`;
        }).join('\n');

        const response = `Here are some of our products:\n\n${productList}\n\n${products.length > 6 ? `And ${products.length - 6} more items available! ` : ''}Would you like more details about any of these, or are you looking for something specific?`;

        return {
            isKeywordMatch: true,
            response,
            productData: products,
            bypassAI: true,
            creditsUsed: 0.5 // Slightly higher cost for database query
        };
    } catch (error) {
        console.error('[KEYWORD] General product query error:', error);
        // Fall back to AI if database query fails
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

const handleStoreInfoQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        console.log(`[KEYWORD] Handling store info query for: ${shop}`);
        
        // Get AI settings to get store information
        const aiSettings = await prisma.aISettings.findUnique({
            where: { shop }
        });

        const settings = aiSettings?.settings as any;
        const storeDetails = settings?.storeDetails || {};
        
        // Extract store information
        const storeName = storeDetails.name || extractStoreNameFromShop(shop);
        const storeAbout = storeDetails.about || '';
        const storeLocation = storeDetails.location || '';
        
        // Build response based on available information
        let response = `Hello! I'm the assistant for **${storeName}**.`;
        
        if (storeAbout) {
            response += ` ${storeAbout.substring(0, 200)}${storeAbout.length > 200 ? '...' : ''}`;
        }
        
        if (storeLocation) {
            response += ` We're located in ${storeLocation}.`;
        }
        
        response += ' How can I help you today?';
        
        return {
            isKeywordMatch: true,
            response,
            bypassAI: true,
            creditsUsed: 0.2 // Low cost for store info
        };
    } catch (error) {
        console.error('[KEYWORD] Store info query error:', error);
        
        // Fallback response with basic store name
        const storeName = extractStoreNameFromShop(shop);
        return {
            isKeywordMatch: true,
            response: `Hello! I'm the assistant for **${storeName}**. How can I help you today?`,
            bypassAI: true,
            creditsUsed: 0.2
        };
    }
};

const handlePolicyQuery = async (shop: string, message: string): Promise<KeywordResponse> => {
    try {
        console.log(`[KEYWORD] Handling policy query for: ${shop}`);
        
        // Get AI settings to fetch policy information
        const aiSettings = await prisma.aISettings.findUnique({
            where: { shop }
        });

        const settings = aiSettings?.settings as any;
        const policies = settings?.policies || {};
        
        // Determine which policy is being asked about
        const lowerMessage = message.toLowerCase();
        let policyType = '';
        let policyContent = '';
        
        if (lowerMessage.includes('shipping')) {
            policyType = 'Shipping Policy';
            policyContent = policies.shipping || '';
        } else if (lowerMessage.includes('return')) {
            policyType = 'Return Policy';  
            policyContent = policies.returns || '';
        } else if (lowerMessage.includes('refund')) {
            policyType = 'Refund Policy';
            policyContent = policies.refunds || policies.refund || '';
        } else if (lowerMessage.includes('privacy')) {
            policyType = 'Privacy Policy';
            policyContent = policies.privacy || '';
        } else if (lowerMessage.includes('terms')) {
            policyType = 'Terms of Service';
            policyContent = policies.terms || '';
        } else {
            // General policy question - provide overview
            const availablePolicies = [];
            if (policies.shipping?.trim()) availablePolicies.push('Shipping');
            if (policies.returns?.trim()) availablePolicies.push('Returns'); 
            if (policies.refunds?.trim() || policies.refund?.trim()) availablePolicies.push('Refunds');
            if (policies.privacy?.trim()) availablePolicies.push('Privacy');
            if (policies.terms?.trim()) availablePolicies.push('Terms of Service');
            if (policies.payment?.trim()) availablePolicies.push('Payment');
            
            if (availablePolicies.length > 0) {
                return {
                    isKeywordMatch: true,
                    response: `I'd be happy to help you with our store policies! 😊 Here's what I can tell you about:\n\n• ${availablePolicies.join('\n• ')}\n\nWhich specific policy would you like to learn more about? Just let me know and I'll provide the details!`,
                    bypassAI: true,
                    creditsUsed: 0.3
                };
            } else {
                // Even with no configured policies, provide a helpful response
                const storeName = extractStoreNameFromShop(shop);
                return {
                    isKeywordMatch: true,
                    response: `I'd love to help you with our store policies! 😊 While I'm getting the detailed policy information ready, I can tell you that ${storeName} is committed to providing excellent customer service.\n\nFor the most up-to-date information about our shipping, returns, and other policies, please feel free to contact our support team or check our website. Is there anything specific about our policies you'd like to know? I'm here to help!`,
                    bypassAI: true,
                    creditsUsed: 0.3
                };
            }
        }
        
        // Return specific policy content
        if (policyContent) {
            // Truncate very long policies for chat-friendly response
            const maxLength = 400;
            let responseContent = policyContent.trim();
            
            if (responseContent.length > maxLength) {
                // Try to break at sentence end if possible
                const truncated = responseContent.substring(0, maxLength);
                const lastSentence = truncated.lastIndexOf('.');
                if (lastSentence > maxLength - 100) {
                    responseContent = truncated.substring(0, lastSentence + 1);
                } else {
                    responseContent = truncated + '...';
                }
            }
            
            const response = `Here's our **${policyType}**:\n\n${responseContent}\n\n${responseContent.includes('...') ? 'This is a summary. For complete details, please visit our website or contact support.\n\n' : ''}Is there anything specific you'd like to know more about?`;
            
            return {
                isKeywordMatch: true,
                response,
                bypassAI: true,
                creditsUsed: 0.4
            };
        } else {
            // Policy type identified but no content available
            const storeName = extractStoreNameFromShop(shop);
            return {
                isKeywordMatch: true,
                response: `Great question about our ${policyType.toLowerCase()}! 😊 While I'm getting those specific details organized for you, I want to assure you that ${storeName} is committed to fair and transparent policies.\n\nFor the most current ${policyType.toLowerCase()} information, I'd recommend checking our website or contacting our support team - they'll have all the detailed information you need. In the meantime, is there anything else I can help you with today?`,
                bypassAI: true,
                creditsUsed: 0.3
            };
        }
        
    } catch (error) {
        console.error('[KEYWORD] Policy query error:', error);
        // Fall back to AI if database query fails
        return { isKeywordMatch: false, creditsUsed: 0 };
    }
};

// Helper function to extract store name from shop domain
const extractStoreNameFromShop = (shop: string): string => {
    // Remove .myshopify.com and capitalize
    const storeName = shop.replace('.myshopify.com', '').replace(/-/g, ' ');
    return storeName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// ============================================================================
// OPTIMIZATION HELPERS
// ============================================================================

const buildOptimizedSystemPrompt = (
    aiSettings?: any,
    productMatchInfo?: { hasRelevantResults: boolean; topScore?: number },
    userMessage?: string
): string => {
    // Build a comprehensive, professional system prompt (CHATBOT-TESTING improvements)
    let prompt = `You are a professional customer service assistant for this e-commerce store. You are knowledgeable, helpful, and represent the brand with excellence.

CORE BEHAVIOR:
- Always be friendly, professional, and solution-oriented
- Provide specific, actionable information when available (use exact numbers: $50, $100, etc.—never "a certain amount")
- If you don't have specific information, offer helpful alternatives
- Never say "I'm just an AI" - you represent this store
- Focus on helping customers achieve their goals
- Use natural, conversational language

RESPONSE GUIDELINES:
- Keep responses concise but complete (2-4 sentences typically)
- Be enthusiastic about the store's products and services
- Offer to help with related questions
- Always maintain a positive, can-do attitude`;

    // CHATBOT-TESTING FIX: No irrelevant fallback — never substitute best-sellers for specific product queries
    if (productMatchInfo && !productMatchInfo.hasRelevantResults && userMessage) {
        prompt += `

CRITICAL - PRODUCT QUERY WITH NO MATCH:
- The user asked about a SPECIFIC type of product (e.g. blenders, vegan boots, a particular category).
- We have NO matching products in our store for that request.
- You MUST say something like: "I couldn't find any [X] in our store right now." or "We don't currently carry [X]."
- NEVER suggest unrelated products (e.g. bracelets, furniture) or best-sellers as substitutes.
- You MAY offer: "Would you like me to suggest something else from our collection, or would you prefer to check back later?"`;
    }

    // CHATBOT-TESTING FIX: Negative constraints (hates, don't want, exclude)
    prompt += `

NEGATIVE PREFERENCES:
- When the user says they hate, dislike, avoid, don't want, or exclude something (e.g. "hates green", "no leather", "under $50"), STRICTLY exclude those.
- Do NOT recommend any product that matches the excluded attribute.
- If all matches violate their preference, say so and suggest only alternatives that respect it.`;

    // Add merchant-specific AI instructions
    if (aiSettings?.aiInstructions?.trim()) {
        const instructions = aiSettings.aiInstructions.substring(0, 300);
        prompt += `\n\nMERCHANT INSTRUCTIONS:\n${instructions}`;
    }

    // Add response tone and style
    const tone = aiSettings?.responseTone?.selectedTone?.[0] || 'friendly';
    const customToneInstructions = aiSettings?.responseTone?.customInstructions;
    
    prompt += `\n\nTONE & STYLE:
- Primary tone: ${tone}`;
    
    if (customToneInstructions?.trim()) {
        prompt += `\n- Custom style: ${customToneInstructions.substring(0, 150)}`;
    }

    // Add response settings
    const responseLength = aiSettings?.responseSettings?.length?.[0] || 'balanced';
    const useEmojis = aiSettings?.responseSettings?.style?.includes('emojis') || false;
    
    prompt += `\n- Response length: ${responseLength}`;
    if (useEmojis) {
        prompt += '\n- Use appropriate emojis to enhance communication';
    }

    // Add store information
    if (aiSettings?.storeDetails?.about?.trim()) {
        const storeInfo = aiSettings.storeDetails.about.substring(0, 200);
        prompt += `\n\nSTORE INFORMATION:\n${storeInfo}`;
    }
    
    if (aiSettings?.storeDetails?.location?.trim()) {
        prompt += `\nLocation: ${aiSettings.storeDetails.location}`;
    }

    // CHATBOT-TESTING FIX: Use full policy text so exact $ amounts (shipping threshold) are included
    const policies = aiSettings?.policies || {};
    const policyCharLimit = 400; // Enough to include "$50", "$100", etc.
    if (policies.shipping?.trim() || policies.payment?.trim() || policies.refund?.trim()) {
        prompt += `\n\nKEY POLICIES (use exact amounts—never "a certain amount"):`;
        
        if (policies.shipping?.trim()) {
            prompt += `\n- Shipping: ${policies.shipping.substring(0, policyCharLimit)}`;
        }
        if (policies.payment?.trim()) {
            prompt += `\n- Payment: ${policies.payment.substring(0, policyCharLimit)}`;
        }
        if (policies.refund?.trim()) {
            prompt += `\n- Returns/Refunds: ${policies.refund.substring(0, policyCharLimit)}`;
        }
    }

    // Featured products — only for general recommendations; never as fallback for specific-no-match
    const recommendedProducts = aiSettings?.recommendedProducts || [];
    const bestSellers = aiSettings?.bestSellers || [];
    const newArrivals = aiSettings?.newArrivals || [];
    
    if (recommendedProducts.length > 0 || bestSellers.length > 0 || newArrivals.length > 0) {
        prompt += `\n\nFEATURED PRODUCTS (use only when user asks generally, e.g. "what do you recommend?"—never when they asked for a specific category we don't have):`;
        
        if (bestSellers.length > 0) {
            const topSellers = bestSellers.slice(0, 3).map((p: any) => p.title).join(', ');
            prompt += `\n- Best sellers: ${topSellers}`;
        }
        
        if (newArrivals.length > 0) {
            const newItems = newArrivals.slice(0, 3).map((p: any) => p.title).join(', ');
            prompt += `\n- New arrivals: ${newItems}`;
        }
        
        if (recommendedProducts.length > 0) {
            const recommended = recommendedProducts.slice(0, 3).map((p: any) => p.title).join(', ');
            prompt += `\n- Recommended: ${recommended}`;
        }
    }

    // Language settings
    const primaryLanguage = aiSettings?.languageSettings?.primaryLanguage || 'english';
    if (primaryLanguage !== 'english') {
        prompt += `\n\nLANGUAGE: Respond primarily in ${primaryLanguage}. Auto-detect customer language if enabled.`;
    }

    prompt += `\n\nREMEMBER: You represent this store with pride and professionalism. Focus on creating an excellent customer experience.`;
    
    return prompt;
};

const buildProductContextFromResults = (pineconeResults: any[]): string | undefined => {
    if (!pineconeResults || pineconeResults.length === 0) return undefined;
    
    // Build concise product context from existing results
    const productContext = pineconeResults
        .filter((match: any) => match.metadata?.type === "PRODUCT")
        .slice(0, 5) // Limit to top 5 for token efficiency
        .map((match: any) => {
            const metadata = match.metadata || {};
            // Return only essential info to save tokens
            return `${metadata.title}: $${metadata.price} - ${(metadata.text_content || '').substring(0, 80)}`;
        })
        .filter(Boolean)
        .join('\n');
        
    return productContext || undefined;
};

const getRelevantProductContext = async (shop: string, userMessage: string): Promise<string | undefined> => {
    try {
        // Use Pinecone for semantic search but limit results
        const results = await queryPinecone(shop, userMessage, 3); // Only top 3 results
        
        if (results.length === 0) return undefined;
        
        return buildProductContextFromResults(results);
    } catch (error) {
        console.error('[OPTIMIZE] Product context error:', error);
        return undefined;
    }
};

const estimateTokens = (text: string): number => {
    // Rough estimation: 1 token ≈ 0.75 words
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / 0.75);
};