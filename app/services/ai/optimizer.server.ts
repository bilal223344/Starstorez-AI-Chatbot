import { VertexAI, GenerationConfig } from "@google-cloud/vertexai";
import prisma from "app/db.server";
import { fetchStoreContext } from "app/services/context.server";

const LOCATION = "us-central1";

const vertexAI = new VertexAI({
    project: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
    location: LOCATION,
    googleAuthOptions: {
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }
    }
});

const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
});

export async function optimizeAISettings(shop: string) {
    try {
        // 1. Fetch Store Context
        const storeContext = await fetchStoreContext(shop);

        // 2. Fetch Sample Products for more context
        const products = await prisma.product.findMany({
            where: { shop },
            take: 10,
            select: {
                title: true,
                collection: true,
                tags: true,
            }
        });

        const productContext = products.length > 0
            ? `SAMPLE PRODUCTS:\n${products.map(p => `- ${p.title} (${p.collection?.[0] || 'Product'})`).join('\n')}`
            : "No products synchronized yet.";

        const prompt = `
You are an expert AI Prompt Engineer and E-commerce Specialist.
Your goal is to generate the optimal configuration for a Shopify AI Sales Assistant based on the store's profile and products.

${storeContext}

${productContext}

Generate a JSON configuration with the following fields:
1. assistantName: A catchy, brand-aligned name (max 20 chars).
2. basePersona: One of ["support_agent", "sales_associate", "brand_ambassador"].
3. customInstructions: Detailed persona instructions (max 200 chars).
4. toneOfVoice: One of ["friendly", "professional", "enthusiastic"].
5. responseLength: One of ["concise", "balanced", "detailed"].
6. allowEmojis: boolean.
7. behaviors: An array containing any of ["proactive_selling", "inventory_check", "lead_capture", "smart_handoff"].

Ensure the output is ONLY a valid JSON object.
`.trim();

        const generationConfig: GenerationConfig = {
            responseMimeType: "application/json",
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

        const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("No response from Gemini");
        }

        return JSON.parse(responseText);

    } catch (error) {
        console.error("[Optimizer] Failed to optimize AI settings:", error);
        throw error;
    }
}
