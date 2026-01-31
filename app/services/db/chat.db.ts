import prisma from "app/db.server";
import { ChatProduct, HistoryFilter } from "app/types/chat.types";

/**
 * 1. WRITES: Manage Sessions & Messages
 */
export async function getOrCreateSession(shop: string, custMail: string) {
    if (!custMail || custMail === "guest") {
        const guestSession = await prisma.chatSession.create({
            data: { shop, isGuest: true },
            include: { messages: true }
        });

        return { session: guestSession, customerId: null };
    }

    // 1. Ensure Customer Exists
    const customer = await prisma.customer.upsert({
        where: { shop_email: { shop, email: custMail } },
        update: {},
        create: { shop, email: custMail },
    });

    // 2. Find Active Session
    const session = await prisma.chatSession.findFirst({
        where: { customerId: customer.id, shop },
        include: {
            messages: { take: 10, orderBy: { createdAt: "asc" } }
        }
    });

    if (session) return { session, customerId: customer.id };

    // 3. Create New
    const newSession = await prisma.chatSession.create({
        data: { shop, customerId: customer.id, isGuest: false },
        include: { messages: true }
    });

    return { session: newSession, customerId: customer.id };
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
                price: p.price,
                handle: p.handle,
                image: p.image,
                score: p.score
            }))
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

    // 3. Execute Database Query
    // We fetch sessions AND their messages in one go
    const sessions = await prisma.chatSession.findMany({
        where: whereClause,
        include: {
            messages: {
                // For paginated mode, we filter messages by date
                where: mode === "paginated" && beforeDate
                    ? { createdAt: { lt: beforeDate } }
                    : undefined,
                orderBy: { createdAt: "desc" }, // Newest first
                take: mode === "paginated" ? limit : undefined, // Limit only if paginating
                include: { recommendedProducts: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // 4. Analytics Calculation (Only for 'analyze' mode)
    let statistics = null;
    if (mode === "analyze") {
        const totalSessions = sessions.length;
        const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
        const totalProducts = sessions.reduce(
            (sum, s) => sum + s.messages.reduce((mSum, m) => mSum + m.recommendedProducts.length, 0),
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
    const formattedSessions = sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        messages: session.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            products: msg.recommendedProducts.map(p => ({
                id: p.productProdId,
                title: p.title,
                price: p.price,
                handle: p.handle,
                image: p.image,
                score: p.score
            }))
        })).reverse() // Flip back to chronological order (Oldest -> Newest) for Chat UI
    }));

    // 6. Handle Pagination Logic (Single Stream of Messages)
    let resultMessages: any[] = [];
    let paging = { hasMore: false, nextBefore: null as string | null };

    if (mode === "paginated") {
        // Flatten all messages from all sessions into one timeline
        const allMessages = sessions.flatMap(s => s.messages);
        // Sort Newest -> Oldest
        allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Check if we have more
        if (allMessages.length >= limit) {
            paging.hasMore = true;
            paging.nextBefore = allMessages[allMessages.length - 1].createdAt.toISOString();
        }

        // Format the flattened list
        resultMessages = allMessages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
            products: msg.recommendedProducts.map(p => ({
                id: p.productProdId,
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