import { data, type ActionFunctionArgs } from "react-router";
import { summarizeConversation } from "app/services/ai/orchestrator";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;

    if (!sessionId) {
      return data({ error: "Session ID is required" }, { status: 400 });
    }

    // Fetch chat history
    // TODO: Port to Firebase. Requires 'shop' parameter.
    const messages: { role: string; content: string }[] = [];

    if (messages.length === 0) {
      return data({ error: "No messages found for this session" }, { status: 404 });
    }

    // Generate summary
    const summary = await summarizeConversation(messages);

    return data({ summary });
  } catch (error) {
    console.error("Summary API Error:", error);
    return data({ error: "Failed to generate summary" }, { status: 500 });
  }
};
