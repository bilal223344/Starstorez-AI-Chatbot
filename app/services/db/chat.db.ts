import prisma from "app/db.server";
import { rtdb } from "app/services/firebaseAdmin.server";
import { ChatProduct, HistoryFilter } from "app/types/chat.types";

/**
 * 1. WRITES: Manage Sessions & Messages
 */
export async function getOrCreateSession(shop: string, custMail: string, providedSessionId?: string) {
    if (providedSessionId) {
        const session = await prisma.chatSession.findUnique({
            where: { id: providedSessionId }
        }) as any;

        if (session) {
            return { session, customerId: session.customerId };
        }
    }

    if (!custMail || custMail === "guest") {
        const guestSession = (await prisma.chatSession.create({
            data: { id: providedSessionId, shop, isGuest: true }
        } as any)) as any;

        return { session: guestSession, customerId: null };
    }

    // 1. Ensure Customer Exists
    const customer = (await prisma.customer.upsert({
        where: { shop_email: { shop, email: custMail } },
        update: {},
        create: {
            shop,
            email: custMail,
            updatedAt: new Date()
        } as any,
    })) as any;

    if (!providedSessionId) {
        // 2. Find Active Session if no sessionId provided
        const activeSession = (await prisma.chatSession.findFirst({
            where: { customerId: customer.id, shop },
            orderBy: { createdAt: "desc" }
        } as any)) as any;

        if (activeSession) {
            return { session: activeSession, customerId: customer.id };
        }
    }

    // 3. Create New
    const newSession = (await prisma.chatSession.create({
        data: { id: providedSessionId, shop, customerId: customer.id, isGuest: false }
    } as any)) as any;

    return { session: newSession, customerId: customer.id };
}

export async function saveSingleMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
) {
    return await prisma.message.create({
        data: { sessionId, role, content }
    });
}

export async function saveChatTurn(
    sessionId: string,
    userText: string,
    aiText: string,
    products: ChatProduct[]
) {
    // Use transaction for data integrity
    const [, assistantMsg] = await prisma.$transaction([
        prisma.message.create({ data: { sessionId, role: "user", content: userText } }),
        prisma.message.create({ data: { sessionId, role: "assistant", content: aiText } })
    ]);

    if (products.length > 0) {
        await prisma.messageProduct.createMany({
            data: products.map(p => ({
                messageId: assistantMsg.id,
                productProdId: p.id,
                title: p.title,
                price: (typeof p.price === 'number' && !isNaN(p.price)) ? p.price : 0,
                handle: p.handle,
                image: p.image || "",
                score: p.score || 0
            })) as any
        });
    }
}

/**
 * 2. READS: Fetch History & Analytics
 * Handles pagination, analytics calculation, and data formatting.
 */
export async function fetchChatHistory(filter: HistoryFilter) {
    const {
        shop,
        custMail,
        limit = 20,
        mode = "paginated",
        startDate,
        endDate,
        beforeDate
    } = filter;

    // 1. Get Customer (or return early if guest/not found)
    // Note: We select specific fields to avoid leaking sensitive data
    const customer = await prisma.customer.findUnique({
        where: { shop_email: { shop, email: custMail } },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            source: true,
        }
    });

    if (!customer && custMail !== "guest") {
        // Return empty state for UI instead of throwing error 
        return {
            customer: null,
            sessions: [],
            paging: { hasMore: false, nextBefore: null }
        };
    }

    // 2. Build Query Filters based on Mode
    const whereClause: any = { shop };
    if (customer) whereClause.customerId = customer.id;

    // Date Filtering (for Analytics mode)
    if ((startDate || endDate) && (mode === "analyze" || mode === "all")) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    // 3. Execute Database Query to get Sessions
    const sessionsList = (await prisma.chatSession.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    } as any)) as any[];

    const safeShop = shop.replace(/\./g, "_");

    // 3.5 Fetch Messages for all matching sessions from Firebase
    const sessions = await Promise.all(sessionsList.map(async (s) => {
        try {
            const snap = await rtdb.ref(`chats/${safeShop}/${s.id}/messages`).get();
            const msgs = snap.val() || {};
            const sessionMessages = Object.values(msgs).map((m: any) => ({
                id: m.timestamp.toString(), // Pseudo ID
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
                createdAt: new Date(m.timestamp),
                recommendedProducts: m.recommendedProducts || []
            }));
            
            // Sort chronologically (oldest to newest)
            sessionMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            return { ...s, messages: sessionMessages };
        } catch (e) {
            console.error(`Failed to fetch fb messages for session ${s.id}`, e);
            return { ...s, messages: [] };
        }
    }));

    // If paginated mode and beforeDate is set, filter out newer messages locally
    if (mode === "paginated" && beforeDate) {
        sessions.forEach(s => {
            s.messages = s.messages.filter((m: any) => m.createdAt < beforeDate);
        });
    }

    // 4. Analytics Calculation (Only for 'analyze' mode)
    let statistics = null;
    if (mode === "analyze") {
        const totalSessions = sessions.length;
        const totalMessages = sessions.reduce((sum: number, s: any) => sum + s.messages.length, 0);
        const totalProducts = sessions.reduce(
            (sum: number, s: any) => sum + s.messages.reduce((mSum: number, m: any) => mSum + m.recommendedProducts.length, 0),
            0
        );

        statistics = {
            totalSessions,
            totalMessages,
            totalProductsRecommended: totalProducts,
            averageMessagesPerSession: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0,
        };
    }

    // 5. Format Data for Frontend
    const formattedSessions = sessions.map((session: any) => ({
        id: session.id,
        createdAt: session.createdAt,
        messages: session.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            products: msg.recommendedProducts.map((p: any) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                handle: p.handle,
                image: p.image,
                score: p.score
            }))
        })) // Already chronological
    }));

    // 6. Handle Pagination Logic (Single Stream of Messages)
    let resultMessages: any[] = [];
    let paging = { hasMore: false, nextBefore: null as string | null };

    if (mode === "paginated") {
        // Flatten all messages from all sessions into one timeline
        const allMessages = sessions.flatMap((s: any) => s.messages);
        // Sort Newest -> Oldest
        allMessages.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

        // Check if we have more
        if (allMessages.length >= limit) {
            paging.hasMore = true;
            paging.nextBefore = allMessages[allMessages.length - 1].createdAt.toISOString();
        }
        
        // Take limit
        const slicedMessages = allMessages.slice(0, limit);

        // Format the flattened list
        resultMessages = slicedMessages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            products: msg.recommendedProducts.map((p: any) => ({
                id: p.id,
                title: p.title,
                price: p.price,
                handle: p.handle,
                image: p.image
            }))
        })).reverse(); // Return Chronological for UI
    }

    return {
        customer,
        // If paginated, return flat messages. If analyze, return grouped sessions.
        messages: mode === "paginated" ? resultMessages : [],
        sessions: mode !== "paginated" ? formattedSessions : [],
        statistics,
        paging
    };
}