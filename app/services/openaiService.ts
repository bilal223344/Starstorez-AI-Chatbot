/* app/services/openaiService.ts */

import { generateEmbeddings, checkPineconeNamespace } from "./pineconeService";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

// ============================================================================
// Helper function to handle rate limiting and retries
// ============================================================================
const queryPineconeWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // If rate limited (429), wait and retry
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000; // Exponential backoff

                console.warn(`[Pinecone] Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.warn(`[Pinecone] Request failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries}):`, error);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError || new Error("Max retries exceeded");
};

// Helper function for OpenAI API with retry logic
const openaiApiWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // If rate limited (429), check if we should retry or fail fast
            if (response.status === 429) {
                const errorBody = await response.text();
                const retryAfter = response.headers.get('retry-after');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt + 1) * 2000; // Longer backoff

                console.warn(`[OpenAI] Rate limited (attempt ${attempt + 1}/${maxRetries}): ${errorBody}`);

                // If this is the last attempt, don't wait - just fail
                if (attempt === maxRetries - 1) {
                    console.error(`[OpenAI] Persistent rate limiting after ${maxRetries} attempts`);
                    throw new Error("QUOTA_EXCEEDED");
                }

                console.warn(`[OpenAI] Waiting ${waitTime}ms before retry`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries - 1) {
                const waitTime = Math.pow(2, attempt + 1) * 1000; // Exponential backoff
                console.warn(`[OpenAI] Request failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries}):`, error);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError || new Error("Max retries exceeded for OpenAI API");
};

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

        // Query Pinecone with retry logic
        const response = await queryPineconeWithRetry(`https://${INDEX_HOST}/query`, {
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
            content: systemPrompt + (productContext ? `\n\nCONTEXT:\n${productContext}` : "")
        };

        const response = await openaiApiWithRetry("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // FIX: Speed & Cost
                messages: [systemMessage, ...messages],
                temperature: 0.5, // Lower temp = Less hallucinations
                max_tokens: 300 // Faster, concise chat responses
            })
        });

        console.log("[OpenAI Response Status]", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            let error;
            try {
                error = JSON.parse(errorText);
            } catch {
                console.error(`[OpenAI] Failed to parse error response: ${errorText}`);
                throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
            }

            const errorMessage = error?.error?.message || "Unknown error";
            const errorCode = error?.error?.code || "unknown";
            const errorType = error?.error?.type || "unknown";

            console.error(`[OpenAI] API Error Details:`, {
                status: response.status,
                message: errorMessage,
                code: errorCode,
                type: errorType,
                fullError: error
            });

            // Handle quota exceeded error
            if (errorCode === "insufficient_quota" || errorType === "insufficient_quota") {
                throw new Error("QUOTA_EXCEEDED");
            }

            // Handle rate limiting error
            if (response.status === 429) {
                throw new Error("QUOTA_EXCEEDED"); // Treat persistent 429 as quota issue
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
