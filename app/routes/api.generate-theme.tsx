import { type ActionFunctionArgs } from "react-router";
import { authenticate } from "app/shopify.server";
import { generateThemeSettings } from "app/services/ai/ai.service";

export async function action({ request }: ActionFunctionArgs) {
    await authenticate.admin(request);

    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return Response.json({ error: "Prompt is required" }, { status: 400 });
        }

        const generatedSettings = await generateThemeSettings(prompt);
        return Response.json({ settings: generatedSettings });
    } catch (error) {
        console.error("Error generating theme:", error);
        const message = error instanceof Error ? error.message : "Failed to generate theme";
        return Response.json({ error: message }, { status: 500 });
    }
}
