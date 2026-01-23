import { generateEmbeddings } from "./pineconeService";
import { checkPineconeNamespace } from "./pineconeService";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

// ============================================================================
// Query Pinecone for relevant products/orders
// ============================================================================
export const queryPinecone = async (
    shop: string,
    queryText: string,
    topK: number = 5,
    filter?: Record<string, unknown>
) => {
    try {
        // Get namespace for shop
        const nsCheck = await checkPineconeNamespace(shop);
        if (!nsCheck.pcNamespace) {
            console.warn(`[Pinecone] No namespace found for shop: ${shop}`);
            return [];
        }

        // Generate embedding for query
        const embeddings = await generateEmbeddings([queryText]);
        const queryVector = embeddings[0];

        // Query Pinecone
        const response = await fetch(`${INDEX_HOST}/query`, {
            method: "POST",
            headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-Api-Version": "2025-10"
            },
            body: JSON.stringify({
                namespace: nsCheck.pcNamespace,
                vector: queryVector,
                topK,
                includeMetadata: true,
                filter: filter || {}
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Pinecone query failed: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.matches || [];
    } catch (error) {
        console.error("[Pinecone Query Error]:", error);
        return [];
    }
};

// ============================================================================
// Build system prompt from AI settings
// ============================================================================
export const buildSystemPrompt = (aiSettings: {
    aiInstructions?: string;
    storeDetails?: { about?: string; location?: string };
    policies?: { shipping?: string; payment?: string; refund?: string };
    responseTone?: { selectedTone?: string[]; customInstructions?: string };
    languageSettings?: { primaryLanguage?: string; autoDetect?: boolean };
    responseSettings?: { length?: string[]; style?: string[] };
    recommendedProducts?: Array<{ title: string; description: string }>;
    newArrivals?: Array<{ title: string; description: string }>;
    bestSellers?: Array<{ title: string; description: string }>;
}) => {
    let systemPrompt = "You are a helpful e-commerce assistant chatbot for a Shopify store. ";

    // Add general AI instructions
    if (aiSettings.aiInstructions) {
        systemPrompt += `\n\nGeneral Instructions:\n${aiSettings.aiInstructions}\n`;
    }

    // Add store details
    if (aiSettings.storeDetails) {
        if (aiSettings.storeDetails.about) {
            systemPrompt += `\nStore Information:\n${aiSettings.storeDetails.about}\n`;
        }
        if (aiSettings.storeDetails.location) {
            systemPrompt += `Store Location: ${aiSettings.storeDetails.location}\n`;
        }
    }

    // Add policies
    if (aiSettings.policies) {
        systemPrompt += "\nStore Policies:\n";
        if (aiSettings.policies.shipping) {
            systemPrompt += `Shipping Policy: ${aiSettings.policies.shipping}\n`;
        }
        if (aiSettings.policies.payment) {
            systemPrompt += `Payment Policy: ${aiSettings.policies.payment}\n`;
        }
        if (aiSettings.policies.refund) {
            systemPrompt += `Refund Policy: ${aiSettings.policies.refund}\n`;
        }
    }

    // Add response tone
    if (aiSettings.responseTone) {
        if (aiSettings.responseTone.selectedTone && aiSettings.responseTone.selectedTone.length > 0) {
            systemPrompt += `\nResponse Tone: ${aiSettings.responseTone.selectedTone.join(", ")}\n`;
        }
        if (aiSettings.responseTone.customInstructions) {
            systemPrompt += `Custom Tone Instructions: ${aiSettings.responseTone.customInstructions}\n`;
        }
    }

    // Add response settings
    if (aiSettings.responseSettings) {
        if (aiSettings.responseSettings.length && aiSettings.responseSettings.length.length > 0) {
            systemPrompt += `Response Length: ${aiSettings.responseSettings.length.join(", ")}\n`;
        }
        if (aiSettings.responseSettings.style && aiSettings.responseSettings.style.length > 0) {
            systemPrompt += `Response Style: ${aiSettings.responseSettings.style.join(", ")}\n`;
        }
    }

    // Add language settings
    if (aiSettings.languageSettings) {
        if (aiSettings.languageSettings.primaryLanguage) {
            systemPrompt += `Primary Language: ${aiSettings.languageSettings.primaryLanguage}\n`;
        }
    }

    systemPrompt += "\nWhen answering questions about products, use the product information provided in the context. ";
    systemPrompt += "If you don't know something, be honest and suggest the customer contact support.\n";

    return systemPrompt;
};

// ============================================================================
// Generate AI response using OpenAI
// ============================================================================
export const generateAIResponse = async (
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    systemPrompt: string,
    productContext?: string
) => {
    try {
        const systemMessage = {
            role: "system" as const,
            content: systemPrompt + (productContext ? `\n\nRelevant Product Information:\n${productContext}` : "")
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // or "gpt-4" for better quality
                messages: [systemMessage, ...messages],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error?.error?.message || "Unknown error";
            const errorCode = error?.error?.code || "unknown";
            const errorType = error?.error?.type || "unknown";

            // Handle quota exceeded error
            if (errorCode === "insufficient_quota" || errorType === "insufficient_quota") {
                throw new Error("QUOTA_EXCEEDED");
            }

            // Handle other API errors
            throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
    } catch (error) {
        console.error("[OpenAI Error]:", error);
        
        // Re-throw quota exceeded error with specific identifier
        if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
            throw error;
        }
        
        // Re-throw other errors
        throw error;
    }
};
