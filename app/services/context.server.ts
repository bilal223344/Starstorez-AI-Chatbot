
import { unauthenticated } from "app/shopify.server";



/**
 * Fetches the store's context (policies, brand info) from Shopify to power the AI.
 * This ensures the AI knows about the specific store it is representing.
 */
export async function fetchStoreContext(shop: string): Promise<string> {
    try {
        // Use unauthenticated.admin to access the Admin API with the offline session
        const { admin } = await unauthenticated.admin(shop);

        if (!admin) {
            console.warn(`[Context] Failed to get admin context for ${shop}.`);
            return "";
        }

        const response = await admin.graphql(`
            query {
                shop {
                    name
                    primaryDomain { url }
                    shopPolicies {
                        type
                        body
                    }
                    brandStory: metafield(namespace: "ai_context", key: "story") { value }
                    brandLocation: metafield(namespace: "ai_context", key: "location") { value }
                    brandWebsite: metafield(namespace: "ai_context", key: "primary_website") { value }
                }
            }
        `);

        const responseJson = await response.json();
        console.log("[Context] Fetch Store Context Response:", JSON.stringify(responseJson));

        if (!responseJson.data || !responseJson.data.shop) {
            console.warn("[Context] No shop data found in response");
            return "";
        }

        const data = responseJson.data.shop;

        // --- 1. Brand Profile ---
        const brandStr = `
STORE PROFILE:
- Name: ${data.name}
- Domain: ${data.primaryDomain?.url || ""}
- Location: ${data.brandLocation?.value || "Not specified"}
- Website: ${data.brandWebsite?.value || data.primaryDomain?.url || ""}
- About: ${data.brandStory?.value || "Not specified"}
`.trim();

        // --- 2. Policies ---
        // Map policies to a readable format
        interface ShopPolicy {
            type: string;
            body: string;
        }
        const policies = (data.shopPolicies || []) as ShopPolicy[];
        const getPolicy = (type: string) => policies.find((p) => p.type === type)?.body || "Not specified";

        const policyStr = `
STORE POLICIES:
- Shipping Policy: ${getPolicy("SHIPPING_POLICY")}
- Refund Policy: ${getPolicy("REFUND_POLICY")}
- Privacy Policy: ${getPolicy("PRIVACY_POLICY")}
- Terms of Service: ${getPolicy("TERMS_OF_SERVICE")}
`.trim();

        // Combine into a single system instruction suffix
        return `
${brandStr}

${policyStr}
`;

    } catch (error: unknown) {
        // Handle specific "Access denied" for shopPolicies if scope is missing
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("Access denied") && errorMessage.includes("shopPolicies")) {
            console.warn("[Context] 'read_legal_policies' scope missing. Skipping policies.");
            // Return context without policies
             return `
STORE PROFILE:
- Name: Not specified (Scope missing)
- Domain: Not specified
- Location: Not specified
- Website: Not specified
- About: Not specified

STORE POLICIES:
- Shipping Policy: Not specified
- Refund Policy: Not specified
- Privacy Policy: Not specified
- Terms of Service: Not specified
`.trim();
        }

        console.error(`[Context] Failed to fetch context for ${shop}:`, error);
        return "";
    }
}
