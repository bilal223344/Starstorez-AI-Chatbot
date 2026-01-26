import { LoaderFunctionArgs } from "react-router";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Helper function to return JSON responses
const json = (data: unknown, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...init?.headers,
        },
    });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    console.log("[OpenAI Test] Environment check:");
    console.log("- OPENAI_API_KEY exists:", !!OPENAI_API_KEY);
    console.log("- OPENAI_API_KEY starts with 'sk-':", OPENAI_API_KEY.startsWith('sk-'));
    console.log("- OPENAI_API_KEY length:", OPENAI_API_KEY.length);
    
    if (!OPENAI_API_KEY) {
        return json({ 
            success: false, 
            error: "OPENAI_API_KEY not configured" 
        }, { status: 500 });
    }

    try {
        console.log("[OpenAI Test] Making API call...");
        console.log("[OpenAI Test] API Key prefix:", OPENAI_API_KEY.substring(0, 20) + "...");
        console.log("[OpenAI Test] API Key length:", OPENAI_API_KEY.length);
        
        const requestBody = {
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Hello"
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };
        
        console.log("[OpenAI Test] Request body:", JSON.stringify(requestBody, null, 2));
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`[OpenAI Test] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[OpenAI Test] Error response: ${errorText}`);
            
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }

            return json({
                success: false,
                status: response.status,
                error: errorData,
                apiKeyPrefix: OPENAI_API_KEY.substring(0, 20) + "...",
                headers: Object.fromEntries(response.headers.entries())
            });
        }

        const data = await response.json();
        console.log(`[OpenAI Test] Success:`, data);

        return json({
            success: true,
            response: data.choices[0]?.message?.content,
            usage: data.usage,
            model: data.model,
            apiKeyPrefix: OPENAI_API_KEY.substring(0, 20) + "..."
        });

    } catch (error) {
        console.error("[OpenAI Test] Network error:", error);
        return json({
            success: false,
            error: "Network error",
            message: error instanceof Error ? error.message : String(error),
            apiKeyPrefix: OPENAI_API_KEY.substring(0, 20) + "..."
        }, { status: 500 });
    }
};