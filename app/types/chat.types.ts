// app/types/chat.types.ts

// 1. Export the missing type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebSocketType = any;

export interface ChatProduct {
    id: string;
    title: string;
    price: number;
    handle: string;
    image: string;
    score: number;
    description?: string;
}

export interface AIMessage {
    role: "user" | "assistant" | "tool";
    content?: string | null;
    tool_calls?: {
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        }
    }[] | null;
    tool_call_id?: string;
}

export interface ChatSessionWithMessages {
    id: string;
    messages: {
        role: string;
        content: string;
        createdAt: Date;
    }[];
}

export interface ChatResult {
    success: boolean;
    sessionId: string;
    responseType: "AI" | "KEYWORD" | "MANUAL_HANDOFF";
    userMessage: { role: "user"; content: string };
    assistantMessage: { role: "assistant"; content: string };
    products?: ChatProduct[];
    error?: string;
    debugInfo?: Record<string, unknown>;
}

// Params for the history fetcher
export interface HistoryFilter {
    shop: string;
    custMail: string;
    mode?: "paginated" | "analyze" | "all";
    limit?: number;
    beforeDate?: Date;
    startDate?: string;
    endDate?: string;
}

export interface PineconeMatch {
    id: string;
    score: number;
    metadata: {
        product_id: string;
        title: string;
        price: string | number;
        inventory_status: string;
        handle: string;
        image: string;
        product_type?: string;
        vendor?: string;
        tags?: string[] | string;
        description?: string;
        [key: string]: string | number | string[] | undefined;
    };
}
