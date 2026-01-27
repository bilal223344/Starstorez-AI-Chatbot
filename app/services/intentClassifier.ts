/* app/services/intentClassifier.ts */
/**
 * Intent Classifier Service
 * 
 * Classifies user messages into specific intents to route them appropriately.
 * Prevents incorrect fallbacks (e.g., showing products for policy questions).
 */

export type IntentType = 
    | "COMPLIMENT" 
    | "POLICY_QUERY" 
    | "PRODUCT_QUERY" 
    | "ORDER_STATUS" 
    | "ORDER_EDIT"
    | "ADD_TO_CART"
    | "STORE_INFO"
    | "GENERAL_INQUIRY"
    | "GREETING";

export interface IntentClassification {
    intent: IntentType;
    confidence: "high" | "medium" | "low";
    extractedInfo?: {
        productType?: string;
        policyType?: "shipping" | "return" | "refund" | "payment" | "privacy" | "terms";
        orderAction?: "track" | "add" | "modify";
    };
}

/**
 * Main intent classification function
 */
export const classifyIntent = (message: string): IntentClassification => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for compliments first (high priority)
    if (isCompliment(lowerMessage)) {
        return {
            intent: "COMPLIMENT",
            confidence: "high"
        };
    }
    
    // Check for greetings
    if (isGreeting(lowerMessage)) {
        return {
            intent: "GREETING",
            confidence: "high"
        };
    }
    
    // Check for policy queries (must be before product queries to prevent fallback)
    const policyCheck = checkPolicyQuery(lowerMessage);
    if (policyCheck) {
        return {
            intent: "POLICY_QUERY",
            confidence: "high",
            extractedInfo: { policyType: policyCheck }
        };
    }
    
    // Check for add to cart queries (before order queries to avoid confusion)
    if (isAddToCartQuery(lowerMessage)) {
        return {
            intent: "ADD_TO_CART",
            confidence: "high"
        };
    }
    
    // Check for order-related queries
    const orderCheck = checkOrderQuery(lowerMessage);
    if (orderCheck) {
        return {
            intent: orderCheck.type === "edit" ? "ORDER_EDIT" : "ORDER_STATUS",
            confidence: "high",
            extractedInfo: { orderAction: orderCheck.action }
        };
    }
    
    // Check for store information queries
    if (isStoreInfoQuery(lowerMessage)) {
        return {
            intent: "STORE_INFO",
            confidence: "high"
        };
    }
    
    // Check for product queries
    const productCheck = checkProductQuery(lowerMessage);
    if (productCheck.isProductQuery) {
        return {
            intent: "PRODUCT_QUERY",
            confidence: productCheck.confidence,
            extractedInfo: { productType: productCheck.productType }
        };
    }
    
    // Default to general inquiry
    return {
        intent: "GENERAL_INQUIRY",
        confidence: "low"
    };
};

// ============================================================================
// COMPLIMENT DETECTION
// ============================================================================

const isCompliment = (message: string): boolean => {
    const complimentPatterns = [
        // Direct compliments
        'you are the best', 'you guys are the best', 'you\'re the best',
        'you are amazing', 'you\'re amazing', 'you are awesome', 'you\'re awesome',
        'you are great', 'you\'re great', 'you are wonderful', 'you\'re wonderful',
        'you are excellent', 'you\'re excellent', 'you are fantastic', 'you\'re fantastic',
        'love you', 'love your', 'thank you so much', 'thanks so much',
        'appreciate you', 'appreciate it', 'you rock', 'you\'re the best',
        'best service', 'great service', 'excellent service', 'amazing service',
        'well done', 'good job', 'nice work', 'keep it up',
        // Positive feedback
        'so helpful', 'very helpful', 'really helpful', 'extremely helpful',
        'so kind', 'very kind', 'really kind', 'so nice', 'very nice',
        'impressed', 'amazing', 'fantastic', 'wonderful', 'brilliant'
    ];
    
    return complimentPatterns.some(pattern => message.includes(pattern));
};

// ============================================================================
// GREETING DETECTION
// ============================================================================

const isGreeting = (message: string): boolean => {
    const greetings = [
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'howdy', 'greetings', 'what\'s up', 'sup', 'hi there', 'hello there'
    ];
    
    return greetings.some(greeting => 
        message.startsWith(greeting) || message === greeting
    );
};

// ============================================================================
// POLICY QUERY DETECTION (CRITICAL: Must prevent product fallback)
// ============================================================================

const checkPolicyQuery = (message: string): "shipping" | "return" | "refund" | "payment" | "privacy" | "terms" | null => {
    // Shipping policy queries
    const shippingKeywords = [
        'shipping cost', 'shipping price', 'shipping fee', 'shipping policy',
        'delivery cost', 'delivery price', 'delivery fee', 'delivery policy',
        'how much shipping', 'how much delivery', 'free shipping',
        'shipping information', 'shipping details', 'shipping rules'
    ];
    
    if (shippingKeywords.some(k => message.includes(k))) {
        return "shipping";
    }
    
    // Return policy queries
    const returnKeywords = [
        'return policy', 'return item', 'how to return', 'can i return',
        'return process', 'return information', 'return details'
    ];
    
    if (returnKeywords.some(k => message.includes(k))) {
        return "return";
    }
    
    // Refund policy queries
    const refundKeywords = [
        'refund policy', 'how to refund', 'can i get refund', 'refund process',
        'refund information', 'refund details', 'money back'
    ];
    
    if (refundKeywords.some(k => message.includes(k))) {
        return "refund";
    }
    
    // Payment policy queries
    const paymentKeywords = [
        'payment method', 'payment options', 'how to pay', 'payment policy',
        'payment information', 'payment details', 'accepted payment'
    ];
    
    if (paymentKeywords.some(k => message.includes(k))) {
        return "payment";
    }
    
    // Privacy policy queries
    const privacyKeywords = [
        'privacy policy', 'privacy information', 'data privacy', 'privacy details'
    ];
    
    if (privacyKeywords.some(k => message.includes(k))) {
        return "privacy";
    }
    
    // Terms queries
    const termsKeywords = [
        'terms of service', 'terms and conditions', 'terms of use', 'user agreement'
    ];
    
    if (termsKeywords.some(k => message.includes(k))) {
        return "terms";
    }
    
    return null;
};

// ============================================================================
// ADD TO CART DETECTION
// ============================================================================

const isAddToCartQuery = (message: string): boolean => {
    // FIX: "Groceries" Bug - Only strict cart commands trigger Add to Cart help
    // "I want to buy groceries" is a PRODUCT_SEARCH, not ADD_TO_CART
    // Only keep strict commands like "add to cart", "put in basket", "add to bag"
    const strictKeywords = [
        'add to cart', 'add it to cart', 'add to my cart', 'add this to cart',
        'put in cart', 'put it in cart', 'add to basket', 'add it to basket',
        'add to shopping cart', 'add it to shopping cart', 'add to bag',
        'add it to bag', 'add to my bag'
        // Removed: 'i want to buy', 'i want to purchase', 'can i buy', 'can i purchase'
        // Removed: 'buy it', 'buy this', 'purchase it' - these are ambiguous
        // These are usually search intents, not cart commands
    ];
    
    return strictKeywords.some(keyword => message.includes(keyword));
};

// ============================================================================
// ORDER QUERY DETECTION
// ============================================================================

const checkOrderQuery = (message: string): { type: "status" | "edit"; action: "track" | "add" | "modify" } | null => {
    // Order edit queries (check first to avoid confusion)
    const editKeywords = [
        'add to order', 'add to my order', 'add to existing order',
        'modify order', 'change my order', 'edit order', 'update order',
        'add .* to .* order', 'can i add', 'add the '
    ];
    
    for (const keyword of editKeywords) {
        if (keyword.includes('.*')) {
            const regex = new RegExp(keyword.replace(/\.\*/g, '\\S*'), 'i');
            if (regex.test(message)) {
                return { type: "edit", action: "add" };
            }
        } else if (message.includes(keyword)) {
            return { type: "edit", action: "add" };
        }
    }
    
    // Order status/tracking queries
    const statusKeywords = [
        'track order', 'order status', 'where is my order', 'tracking',
        'order number', 'track my package', 'delivery status', 'shipment status'
    ];
    
    if (statusKeywords.some(k => message.includes(k))) {
        return { type: "status", action: "track" };
    }
    
    return null;
};

// ============================================================================
// STORE INFO QUERY DETECTION
// ============================================================================

const isStoreInfoQuery = (message: string): boolean => {
    const storeInfoKeywords = [
        'store name', 'what is your store', 'your store name', 'name of store',
        'who are you', 'what store', 'store called', 'business name',
        'company name', 'shop name', 'about your store', 'tell me about your store'
    ];
    
    return storeInfoKeywords.some(keyword => message.includes(keyword));
};

// ============================================================================
// PRODUCT QUERY DETECTION
// ============================================================================

const checkProductQuery = (message: string): { 
    isProductQuery: boolean; 
    confidence: "high" | "medium" | "low";
    productType?: string;
} => {
    // High confidence product queries
    const highConfidenceKeywords = [
        'show me', 'looking for', 'need a', 'want to buy', 'shopping for',
        'find', 'search for', 'do you have', 'do you sell', 'available',
        'tell me about', 'tell me any', 'which', 'what products'
    ];
    
    if (highConfidenceKeywords.some(k => message.includes(k))) {
        // Try to extract product type
        const productType = extractProductType(message);
        return {
            isProductQuery: true,
            confidence: "high",
            productType
        };
    }
    
    // Medium confidence - category mentions
    const categories = [
        'clothing', 'clothes', 'apparel', 'fashion', 'shirt', 'dress', 'shoes',
        'electronics', 'phone', 'laptop', 'computer', 'tablet',
        'furniture', 'home', 'kitchen', 'bedroom', 'sofa', 'chair',
        'beauty', 'skincare', 'makeup', 'cosmetics',
        'sport', 'outdoor', 'fitness', 'gym'
    ];
    
    if (categories.some(cat => message.includes(cat))) {
        return {
            isProductQuery: true,
            confidence: "medium",
            productType: categories.find(cat => message.includes(cat))
        };
    }
    
    return { isProductQuery: false, confidence: "low" };
};

const extractProductType = (message: string): string | undefined => {
    const productTypes = [
        'blender', 'samsung', 'phone', 'laptop', 'shirt', 'dress', 'shoes',
        'jacket', 'furniture', 'sofa', 'chair', 'table', 'boots', 'sneakers'
    ];
    
    return productTypes.find(type => message.toLowerCase().includes(type));
};

// ============================================================================
// TYPO HANDLING - Normalize common typos (no shaming, just fix)
// ============================================================================

export const normalizeTypo = (message: string): string => {
    const typoMap: Record<string, string> = {
        'trak': 'track',
        'oder': 'order',
        'shiping': 'shipping',
        'retun': 'return',
        'pament': 'payment',
        'produc': 'product',
        'producs': 'products',
        'recieve': 'receive',
        'recieved': 'received'
    };
    
    let normalized = message.toLowerCase();
    
    for (const [typo, correct] of Object.entries(typoMap)) {
        normalized = normalized.replace(new RegExp(`\\b${typo}\\b`, 'gi'), correct);
    }
    
    return normalized;
};
