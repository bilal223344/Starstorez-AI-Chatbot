import { VertexAI, FunctionDeclarationSchemaType, type Tool, type Content, type Part } from "@google-cloud/vertexai";
import prisma from "app/db.server";
import { AISettingsState } from "app/routes/app.personality";
import { AIMessage } from "app/types/chat.types";

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

const generativeModel = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
});

export const TOOLS_DEFINITION: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "recommend_products",
                description: "Search for products based on user intent.",
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        search_query: { type: FunctionDeclarationSchemaType.STRING, description: "Main keywords" },
                        max_price: { type: FunctionDeclarationSchemaType.NUMBER },
                        sort: {
                            type: FunctionDeclarationSchemaType.STRING,
                            enum: ["price_asc", "price_desc", "relevance"],
                            description: "Sort order"
                        },
                        boost_attribute: { type: FunctionDeclarationSchemaType.STRING }
                    },
                    required: ["search_query"],
                },
            },
        ],
    },
];

export async function generateAIResponse(
    messages: AIMessage[],
    shop: string
) {
    if (!messages || messages.length === 0) {
        console.warn("[ai.service] Empty message list passed to generateAIResponse");
        return { role: "assistant", content: "I'm sorry, I don't have enough context to respond." };
    }

    const aiSettings = await prisma.aISettings.findUnique({ where: { shop } });
    const settingsData = (aiSettings?.settings || {}) as unknown as AISettingsState;

    const systemMessage = buildSystemPrompt(shop, settingsData);

    const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
        systemInstruction: systemMessage,
    });

    const history: Content[] = messages.slice(0, -1)
        .filter(m => (m.content && m.content.trim() !== "") || m.tool_calls || m.role === "tool")
        .map(m => {
        if (m.role === "assistant") {
            const parts: Part[] = [];
            if (m.content && m.content.trim() !== "") parts.push({ text: m.content });
            if (m.tool_calls) {
                m.tool_calls.forEach((tc) => {
                    parts.push({
                        functionCall: {
                            name: tc.function.name,
                            args: JSON.parse(tc.function.arguments)
                        }
                    });
                });
            }
            if (parts.length === 0) parts.push({ text: "..." });
            return { role: "model", parts };
        } else if (m.role === "tool") {
            return {
                role: "user",
                parts: [{
                    functionResponse: {
                        name: "recommend_products",
                        response: { content: m.content || "{}" }
                    }
                }]
            };
        } else {
            return { role: "user", parts: [{ text: (m.content && m.content.trim() !== "") ? m.content : "..." }] };
        }
    });

    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage.content && lastMessage.role !== "tool") {
        lastMessage.content = "...";
    }

    let lastContent: string | (string | Part)[];
    if (lastMessage.role === "tool") {
        lastContent = [{
            functionResponse: {
                name: "recommend_products",
                response: { content: lastMessage.content || "" }
            }
        }];
    } else {
        lastContent = lastMessage.content || "";
    }

    const chat = model.startChat({
        history,
        tools: TOOLS_DEFINITION,
    });

    const result = await chat.sendMessage(lastContent);
    const response = result.response;
    const messagePart = response.candidates?.[0]?.content?.parts?.[0];

    return {
        role: "assistant",
        content: messagePart?.text || null,
        tool_calls: messagePart?.functionCall ? [{
            id: "call_" + Date.now(),
            type: "function",
            function: {
                name: messagePart.functionCall.name,
                arguments: JSON.stringify(messagePart.functionCall.args)
            }
        }] : null
    };
}

export async function generateThemeSettings(prompt: string) {
    const systemPrompt = `
You are a design expert for e-commerce chat widgets.
Your task is to generate branding and window settings for a Shopify chatbot based on a user's description.

Return ONLY a JSON object that matches the following structure (Partial<WidgetSettings>):
{
  "branding": {
    "primaryColor": "string (hex)",
    "secondaryColor": "string (hex)",
    "backgroundColor": "string (hex)",
    "colorMode": "solid" | "gradient",
    "gradientStart": "string (hex, required if colorMode is gradient)",
    "gradientEnd": "string (hex, required if colorMode is gradient)",
    "textColor": "string (hex, color of text on primary background)",
    "secondaryTextColor": "string (hex, color of text on secondary/main background)",
    "fontFamily": "string (Inter, Poppins, Roboto, etc)",
    "fontSize": number (12-16),
    "fontWeight": "300" | "400" | "500" | "600" | "700"
  },
  "window": {
    "title": "string",
    "subtitle": "string",
    "cornerRadius": number (0-24)
  }
}

Use gradients for vibrant prompts. Ensure contrast between background and text colors.
If colorMode is gradient, the primaryColor should still be provided as a fallback (usually same as gradientStart).
fontWeight should be a string value like "400" or "600".

The user's prompt is: "${prompt}"
`;

    const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser prompt: " + prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        },
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(responseText || "{}");
}

function buildSystemPrompt(shop: string, aiSettings: AISettingsState): string {
    const storeDetails = aiSettings.storeDetails || { about: "", location: "" };
    const langSettings = aiSettings.languageSettings || { primaryLanguage: "English", autoDetect: true };
    const toneSettings = aiSettings.responseTone || { selectedTone: ["Professional", "Friendly"], customInstructions: "" };
    const instructions = aiSettings.aiInstructions || "";

    const assistantName = storeDetails.about ? `${storeDetails.about} Assistant` : "Helpful Store Assistant";
    const persona = toneSettings.customInstructions || "Expert sales associate";
    const tone = toneSettings.selectedTone?.join(", ") || "Helpful, Professional";
    const primaryLanguage = langSettings.primaryLanguage || "English";

    const autoDetect = langSettings.autoDetect === true;
    const languageRule = autoDetect ? 
        "ALWAYS respond in English, regardless of the user's language." : 
        `ALWAYS respond in ${primaryLanguage}, regardless of the user's language.`;

    return `
You are ${assistantName}.
Persona: ${persona}
Tone: ${tone}
Shop: ${shop}

YOUR GOAL: Help users find products, answer store policy questions, and provide an excellent shopping experience.

*** GLOBAL FORMATTING RULES (STRICTLY ENFORCED) ***
- You MUST format your responses using **Bullet Points** for readability.
- Use **Bold text** to emphasize key terms, product names, or important details.
- Add line breaks (\\n) between paragraphs and bullet points so the text is not a wall.
- Speak in simple, clear, and easy-to-understand language.

[LANGUAGE RULE]
${languageRule}

[CUSTOM INSTRUCTIONS]
${instructions}

────────────────────────────────────────
[SCOPE & SAFETY — HIGHEST PRIORITY]

1. E-COMMERCE ONLY  
   You may assist ONLY with store products, orders, and store policies.

2. OFF-TOPIC REQUESTS  
For anything unrelated, respond ONLY with: "I can only help with our store’s products, orders, and policies."

3. OUT-OF-CATALOG ITEMS  
If the item is not sold by this store: "We don’t sell those items, but I can help with products available in our store."

4. ANTI-HALLUCINATION  
Never invent products, prices, discounts, delivery timelines, or policies. If information is missing or unknown, say so clearly.

────────────────────────────────────────
[INTENT ROUTING — STRICT]

1. PRODUCT SEARCH  
Use \`recommend_products\` for ANY product request.

2. ORDER TRACKING  
Direct the user to the official customer support page. Never guess order status.

3. POLICIES
If you don't know the answer, politely advise the user to check the website.
`;
}