import { rtdb } from "app/services/firebaseAdmin.server";
import { ChatProduct, HistoryFilter } from "app/types/chat.types";
import { v4 as uuidv4 } from "uuid";

/**
 * 1. WRITES: Manage Sessions & Messages
 */
export async function getOrCreateSession(shop: string, custMail: string, providedSessionId?: string) {
    if (providedSessionId) {
        return { 
            session: { id: providedSessionId, shop, isGuest: custMail === "guest" }, 
            customerId: custMail !== "guest" ? custMail : null 
        };
    }

    const newSessionId = uuidv4();
    return { 
        session: { id: newSessionId, shop, customerId: custMail !== "guest" ? custMail : null, isGuest: custMail === "guest" }, 
        customerId: custMail !== "guest" ? custMail : null 
    };
}

export async function saveSingleMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
) {
    // Legacy support, replaced by direct Firebase writes in orchestrator
    return { id: "mock_id", sessionId, role, content };
}

export async function saveChatTurn(
    sessionId: string,
    userText: string,
    aiText: string,
    products: ChatProduct[]
) {
     // Legacy support, replaced by direct Firebase writes in orchestrator
     return;
}

/**
 * 2. READS: Fetch History & Analytics
 * Handles pagination, analytics calculation, and data formatting.
 */
export async function fetchChatHistory(filter: HistoryFilter) {
    // TODO: Port Chat History Dashboard Fetcher to Firebase
    // Prisma ChatSession and Customer tables have been removed.
    console.warn("fetchChatHistory needs to be ported to Firebase RTDB");
    return {
        customer: null,
        messages: [],
        sessions: [],
        statistics: null,
        paging: { hasMore: false, nextBefore: null }
    };
}