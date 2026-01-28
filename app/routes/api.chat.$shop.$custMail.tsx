import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import prisma from "app/db.server";
import { OpenAI } from "openai";
import { generateEmbeddings } from "app/services/pineconeService";
import { AISettingsState } from "./app.personality";

// WebSocket support: we accept either browser WebSocket or `ws` (Node) sockets.
// In this route file, keep it as `any` so we can call `on(...)` (ws) or
// `addEventListener(...)` (browser) without TS blocking builds.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebSocketType = any;

// Store active WebSocket connections
const wsClients = new Map<string, WebSocketType>();

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

interface PineconeMatch {
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

// Simplified product shape used in chat responses & persistence
interface ChatProduct {
  id: string;
  title: string;
  price: number;
  handle: string;
  image: string;
  score: number;
  description?: string;
}

// ============================================================================
// 2. CONFIGURATION
// ============================================================================

const openai = new OpenAI();
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_HOST = process.env.INDEX_HOST || "";

// ============================================================================
// 3. MAIN ACTION HANDLER (Shared core logic)
// ============================================================================

interface ChatResult {
  success: boolean;
  sessionId: string;
  responseType: "AI" | "KEYWORD" | "MANUAL_HANDOFF";
  userMessage: { role: "user"; content: string };
  assistantMessage: { role: "assistant"; content: string };
  products?: ChatProduct[];
  performance?: { responseTime: number; productsFound: number };
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const startTime = Date.now();
  
  try {
    // Step 1: Extract parameters
    const { shop, custMail } = params;
    const url = new URL(request.url);

    // Query params:
    //   - mode: "paginated" (default) | "all" | "analyze"
    //   - limit: how many messages to fetch (default 20, max 50) - for paginated mode
    //   - before: ISO timestamp; only messages older than this are returned - for paginated mode
    //   - startDate: ISO date string - for analyze mode
    //   - endDate: ISO date string - for analyze mode
    const mode = url.searchParams.get("mode") || "paginated";
    const limitParam = url.searchParams.get("limit");
    const beforeParam = url.searchParams.get("before");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    
    const limitRaw = limitParam ? parseInt(limitParam, 10) : 20;
    const limit = Number.isNaN(limitRaw) ? 20 : Math.min(Math.max(limitRaw, 1), 50);
    const beforeDate = beforeParam ? new Date(beforeParam) : new Date();


    // Step 2: Validate required route params
    if (!shop) {
      return Response.json(
        { error: "Shop parameter is required" },
        { status: 400 },
      );
    }
    if (!custMail) {
      console.log("[LOADER] ❌ Validation failed: Customer email missing");
      return Response.json(
        { error: "Customer email is required" },
        { status: 400 },
      );
    }

    // Step 3: Find customer (DO NOT CREATE - only GET if exists)
    let customerId: string | null = null;
    let customer = null;
    
    if (custMail && custMail !== "guest") {      
      customer = await prisma.customer.findUnique({
        where: { shop_email: { shop, email: custMail } },
        select: {
          id: true,
          shopifyId: true,
          shop: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          source: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      // If customer not found, return empty response
      if (!customer) {
        return Response.json({
          session: null,
          messages: [],
          customer: null,
          paging: { hasMore: false, nextBefore: null },
          error: "User not found",
        });
      }
      
      customerId = customer.id;
    }

    // Step 4: Handle different modes
    if (mode === "analyze" || mode === "all") {
      
      // Return ALL sessions with full analysis
      const where: { shop: string; customerId?: string; createdAt?: { gte?: Date; lte?: Date } } = { shop };
      if (customerId) {
        where.customerId = customerId;
      }
      if (startDateParam || endDateParam) {
        where.createdAt = {};
        if (startDateParam) where.createdAt.gte = new Date(startDateParam);
        if (endDateParam) where.createdAt.lte = new Date(endDateParam);
      }

      const chatSessions = await prisma.chatSession.findMany({
        where,
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              recommendedProducts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate statistics
      const totalSessions = chatSessions.length;
      const totalMessages = chatSessions.reduce(
        (sum, session) => sum + session.messages.length,
        0
      );
      const userMessages = chatSessions.reduce(
        (sum, session) =>
          sum + session.messages.filter((m) => m.role === "user").length,
        0
      );
      const assistantMessages = chatSessions.reduce(
        (sum, session) =>
          sum + session.messages.filter((m) => m.role === "assistant").length,
        0
      );
      const totalProductsRecommended = chatSessions.reduce(
        (sum, session) =>
          sum +
          session.messages.reduce(
            (msgSum, msg) => msgSum + msg.recommendedProducts.length,
            0
          ),
        0
      );

      const formattedSessions = chatSessions.map((session) => ({
        id: session.id,
        shop: session.shop,
        customerId: session.customerId,
        isGuest: session.isGuest,
        createdAt: session.createdAt,
        customer: session.customer
          ? {
              id: session.customer.id,
              email: session.customer.email,
              firstName: session.customer.firstName,
              lastName: session.customer.lastName,
              phone: session.customer.phone,
              source: session.customer.source,
            }
          : null,
        messages: session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          products:
            msg.role === "assistant" && msg.recommendedProducts.length > 0
              ? msg.recommendedProducts.map((p) => ({
                  id: p.productProdId,
                  title: p.title,
                  price: p.price,
                  handle: p.handle || null,
                  image: p.image || null,
                  score: p.score || null,
                }))
              : undefined,
        })),
        messageCount: session.messages.length,
        productRecommendations: session.messages.reduce(
          (sum, msg) => sum + msg.recommendedProducts.length,
          0
        ),
      }));

      if (mode === "analyze") { 
        return Response.json({
          success: true,
          shop,
          mode: "analyze",
          customer: customer
            ? {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                source: customer.source,
              }
            : null,
          statistics: {
            totalSessions,
            totalMessages,
            userMessages,
            assistantMessages,
            totalProductsRecommended,
            averageMessagesPerSession:
              totalSessions > 0
                ? parseFloat((totalMessages / totalSessions).toFixed(2))
                : 0,
            averageProductsPerSession:
              totalSessions > 0
                ? parseFloat(
                    (totalProductsRecommended / totalSessions).toFixed(2)
                  )
                : 0,
          },
          sessions: formattedSessions,
          filters: {
            startDate: startDateParam || null,
            endDate: endDateParam || null,
          },
        });
      } else {
        
        return Response.json({
          success: true,
          shop,
          mode: "all",
          customer: customer
            ? {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                source: customer.source,
              }
            : null,
          summary: {
            totalSessions,
            totalMessages,
            totalProductsRecommended: totalProductsRecommended,
          },
          sessions: formattedSessions,
        });
      }
    }

    
    // Aggregate messages from ALL sessions for this customer
    if (customerId) {
      // Get ALL sessions for this customer
      const allSessions = await prisma.chatSession.findMany({
        where: { customerId: customerId, shop: shop },
        include: {
          messages: {
            where: { createdAt: { lt: beforeDate } },
            orderBy: { createdAt: "desc" },
            include: {
              recommendedProducts: true,
            },
          },
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      });


      if (allSessions.length === 0) {
        return Response.json({
          session: null,
          messages: [],
          customer: customer,
          paging: { hasMore: false, nextBefore: null },
        });
      }

      // Aggregate all messages from all sessions, sorted by createdAt (newest first)
      const allMessages = allSessions
        .flatMap((session) =>
          session.messages.map((msg) => ({
            ...msg,
            sessionId: session.id,
          }))
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Take only the requested limit
      const paginatedMessages = allMessages.slice(0, limit);

      // Get the latest session for session metadata
      const latestSession = allSessions[0];

      // Reverse to show oldest first (for display)
      const messagesAsc = [...paginatedMessages].reverse();

      return Response.json({
        session: {
          id: latestSession.id,
          shop: latestSession.shop,
          customerId: latestSession.customerId,
          isGuest: latestSession.isGuest,
        },
        messages: messagesAsc.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          products:
            m.role === "assistant" && m.recommendedProducts.length > 0
              ? m.recommendedProducts.map((p) => ({
                  id: p.productProdId,
                  title: p.title,
                  price: p.price,
                  handle: p.handle || "",
                  image: p.image || "",
                  score: p.score || undefined,
                }))
              : undefined,
        })),
        customer: latestSession.customer || customer,
        paging: {
          hasMore: allMessages.length > limit,
          nextBefore:
            paginatedMessages.length > 0
              ? paginatedMessages[paginatedMessages.length - 1].createdAt.toISOString()
              : null,
        },
      });
    }
    
    return Response.json({
      session: null,
      messages: [],
      customer: customer,
      paging: { hasMore: false, nextBefore: null },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("[LOADER] ❌ Error fetching chat history:", error);
    console.error("[LOADER] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTime,
    });
    console.log("[LOADER] ===== Chat Loader Failed =====");
    
    return Response.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
};

// ============================================================================
// WebSocket Message Handler (can be called from WebSocket server)
// ============================================================================
export async function handleWebSocketMessage(
  shop: string,
  custMail: string,
  message: string,
  ws?: WebSocketType
): Promise<ChatResult> {
  console.log("[WS Action] Processing WebSocket message:", { shop, custMail, message });
  
  try {
    if (!shop || !custMail) {
      const error = {
        success: false,
        error: "INVALID_ROUTE_PARAMS",
        errorMessage: "Both 'shop' and 'custMail' are required.",
      };
      
      if (ws && typeof ws.send === "function") {
        try {
          ws.send(JSON.stringify(error));
        } catch (e) {
          console.error("[WS Action] Error sending error response:", e);
        }
      }
      return error as unknown as ChatResult;
    }

    if (!message || typeof message !== "string") {
      const error = {
        success: false,
        error: "INVALID_REQUEST",
        errorMessage: "Missing or invalid 'message' field.",
      };
      
      if (ws && typeof ws.send === "function") {
        try {
          ws.send(JSON.stringify(error));
        } catch (e) {
          console.error("[WS Action] Error sending error response:", e);
        }
      }
      return error as unknown as ChatResult;
    }

    // Use the same processChat logic
    const result = await processChat(shop, custMail, message);

    // Send response via WebSocket if connection provided
    if (ws && typeof ws.send === "function") {
      try {
        // Check if WebSocket is open (readyState === 1 for OPEN)
        const isOpen = ws.readyState === undefined || ws.readyState === 1;
        if (isOpen) {
          ws.send(JSON.stringify(result));
          console.log("[WS Action] Response sent via WebSocket");
        }
      } catch (e) {
        console.error("[WS Action] Error sending WebSocket response:", e);
      }
    }

    return result;
  } catch (error: unknown) {
    console.error("[WS Action Error]:", error instanceof Error ? error.message : String(error));
    const errorResponse = {
      success: false,
      error: "SYSTEM_ERROR",
      errorMessage: error instanceof Error ? error.message : String(error),
    };
    
    if (ws && typeof ws.send === "function") {
      try {
        const isOpen = ws.readyState === undefined || ws.readyState === 1;
        if (isOpen) {
          ws.send(JSON.stringify(errorResponse));
        }
      } catch (e) {
        console.error("[WS Action] Error sending error response:", e);
      }
    }
    
    return errorResponse as unknown as ChatResult;
  }
}

// ============================================================================
// Broadcast message to all WebSocket clients for a shop/customer
// ============================================================================
export function broadcastToWebSocketClients(
  shop: string,
  custMail: string,
  data: unknown
): void {
  const clientKey = `${shop}:${custMail}`;
  const message = JSON.stringify(data);
  let sentCount = 0;
  
  wsClients.forEach((ws, key) => {
    if (key === clientKey && ws && typeof ws.send === "function") {
      try {
        const isOpen = ws.readyState === undefined || ws.readyState === 1;
        if (isOpen) {
          ws.send(message);
          sentCount++;
          console.log("[WS Broadcast] Sent to client:", clientKey);
        } else {
          // Remove closed connections
          wsClients.delete(key);
        }
      } catch (error) {
        console.error("[WS Broadcast] Error sending to client:", error);
        wsClients.delete(key);
      }
    }
  });
  
  if (sentCount > 0) {
    console.log("[WS Broadcast] Broadcasted to", sentCount, "client(s) for", clientKey);
  }
}

// ============================================================================
// Register WebSocket client
// ============================================================================
export function registerWebSocketClient(
  shop: string,
  custMail: string,
  ws: WebSocketType
): void {
  const clientKey = `${shop}:${custMail}`;
  wsClients.set(clientKey, ws);
  console.log("[WS Register] Client registered:", clientKey, "Total clients:", wsClients.size);
  
  // Clean up on close/error (supports both browser WebSocket and `ws` package)
  if (ws && typeof ws.on === "function") {
    // `ws` package (Node)
    ws.on("close", () => {
      wsClients.delete(clientKey);
    });
    ws.on("error", (error: unknown) => {
      console.error("[WS Register] Client error:", clientKey, error);
      wsClients.delete(clientKey);
    });
  } else if (ws && typeof ws.addEventListener === "function") {
    // Browser WebSocket
    ws.addEventListener("close", () => {
      wsClients.delete(clientKey);
    });
    ws.addEventListener("error", (error: unknown) => {
      console.error("[WS Register] Client error:", clientKey, error);
      wsClients.delete(clientKey);
    });
  }
}

// ============================================================================
// Get WebSocket client count for a shop/customer
// ============================================================================
export function getWebSocketClientCount(shop: string, custMail: string): number {
  const clientKey = `${shop}:${custMail}`;
  return wsClients.has(clientKey) ? 1 : 0;
}

// React-Router Action – handles HTTP POST /api/chat/:shop/:custMail
export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const { shop, custMail } = params;

    // Check if this is a WebSocket upgrade request
    const upgradeHeader = request.headers.get("upgrade");
    const connectionHeader = request.headers.get("connection");
    
    if (upgradeHeader?.toLowerCase() === "websocket" || 
        connectionHeader?.toLowerCase().includes("upgrade")) {
      console.log("[Action] WebSocket upgrade detected - should be handled by WebSocket server");
      // WebSocket upgrades should be handled by a separate WebSocket server
      // Return 426 Upgrade Required to indicate WebSocket support
      return new Response("WebSocket upgrade required. Connect to ws://host/ws/chat", {
        status: 426,
        headers: {
          "Upgrade": "websocket",
          "Connection": "Upgrade",
        },
      });
    }

    // Parse JSON body from client: { "message": "..." }
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      // If body is not valid JSON, treat as bad request
      return Response.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          errorMessage: "Request body must be valid JSON.",
        },
        { status: 400 },
      );
    }

    const userMessageContent =
      typeof body?.message === "string" ? body.message : undefined;

    if (!userMessageContent) {
      return Response.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          errorMessage: "Missing 'message' field in request body.",
        },
        { status: 400 },
      );
    }

    if (!shop || !custMail) {
      return Response.json(
        {
          success: false,
          error: "INVALID_ROUTE_PARAMS",
          errorMessage: "Both 'shop' and 'custMail' route params are required.",
        },
        { status: 400 },
      );
    }

    console.log("[Action] Processing HTTP POST message:", { shop, custMail });

    // Delegate to shared chat logic (also used by WebSocket server)
    const result = await processChat(shop, custMail, userMessageContent);

    // Broadcast to WebSocket clients if any are connected
    if (result.success) {
      broadcastToWebSocketClients(shop, custMail, result);
    }

    return Response.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: unknown) {
    console.error("[HTTP Action Error]:", error);
    return Response.json(
      {
        success: false,
        error: "SYSTEM_ERROR",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};

export async function processChat(
  shop: string,
  custMail: string,
  userMessageContent: string,
): Promise<ChatResult> {
  const startTime = Date.now();

  try {
    if (!shop) throw new Error("Shop required");
    // Clean shop string if needed
    const cleanShop = shop;

    // --- A. LOAD CONTEXT ---
    let customerId: string | null = null;
    if (custMail && custMail !== "guest") {
      const customer = await prisma.customer.upsert({
        where: { shop_email: { shop: cleanShop, email: custMail } },
        update: {},
        create: {
          shop: cleanShop,
          email: custMail,
          // Other fields (firstName, lastName, etc.) can be populated later
        },
      });
      customerId = customer.id;
    }

    const aiSettingsRecord = await prisma.aISettings.findUnique({
      where: { shop: cleanShop },
    });
    const aiSettingsData = (aiSettingsRecord?.settings ||
      {}) as unknown as AISettingsState;

    // --- B. SESSION MANAGEMENT ---
    let sessionId = "";
    let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (customerId) {
      const session = await prisma.chatSession.findFirst({
        where: { customerId: customerId, shop: cleanShop },
        include: { messages: { take: 8, orderBy: { createdAt: "desc" } } },
      });

      if (session) {
        sessionId = session.id;
        history = session.messages.reverse().map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
      } else {
        const newSession = await prisma.chatSession.create({
          data: { shop: cleanShop, customerId: customerId, isGuest: false },
        });
        sessionId = newSession.id;
      }
    }

    // --- C. DEFINE TOOLS & PROMPT ---
    const systemPrompt = buildSystemPrompt(aiSettingsData);

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "recommend_products",
          description:
            "Search the store inventory. Use this to find products, prices, or details. WARNING: Do NOT use this for 'Order Tracking' or 'Buying'.",
          parameters: {
            type: "object",
            properties: {
              search_query: {
                type: "string",
                description: "The product noun. Remove adjectives.",
              },
              max_price: { type: "number" },
              min_price: { type: "number" },
              sort: {
                type: "string",
                enum: ["price_asc", "price_desc", "relevance"],
              },
            },
            required: ["search_query"],
          },
        },
      },
    ];

    // --- D. FIRST AI CALL ---
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessageContent },
    ];

    const firstResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.4,
    });

    const choice = firstResponse.choices[0].message;
    let finalAiText = choice.content || "";
    let rawProducts: ChatProduct[] = [];

    // --- E. TOOL EXECUTION ---
    if (choice.tool_calls) {
      messages.push(choice);

      for (const toolCall of choice.tool_calls) {
        const fn = (toolCall as any).function;
        if (fn?.name === "recommend_products") {
          const args = JSON.parse(fn.arguments);
          console.log(`[AI-Core] Searching: "${args.search_query}"`);

          const matches = await searchPinecone(
            cleanShop,
            args.search_query,
            args.min_price,
            args.max_price,
            args.sort,
          );

          rawProducts = matches
            .filter((m) => m.metadata && m.metadata.title)
            .map((m) => ({
              id: String(m.metadata.product_id),
              title: String(m.metadata.title),
              price:
                parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) ||
                0,
              handle: String(m.metadata.handle || ""),
              image: String(m.metadata.image || ""),
              score: m.score,
              description: m.metadata.description
                ? String(m.metadata.description)
                : undefined,
            }));

          const toolResultText = formatProductsForAI(rawProducts); // Using local helper logic
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResultText,
          });
        }
      }

      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.4,
      });
      finalAiText = secondResponse.choices[0].message.content || "";
    }

    // --- F. SAVE & RETURN ---
    if (sessionId) {
      console.log("sessionId", sessionId);
      console.log("finalAiText", finalAiText);
      console.log("rawProducts", rawProducts);
      // 1. Save user and assistant messages and get assistant message ID back
      const [, assistantMessage] = await prisma.$transaction([
        prisma.message.create({
          data: { sessionId, role: "user", content: userMessageContent },
        }),
        prisma.message.create({
          data: { sessionId, role: "assistant", content: finalAiText },
        }),
      ]);

      // 2. Persist any products recommended by the AI for this assistant message
      if (rawProducts.length > 0) {
        await prisma.messageProduct.createMany({
          data: rawProducts.map((p) => ({
            messageId: assistantMessage.id,
            productProdId: String(p.id),
            title: p.title,
            price: typeof p.price === "number" ? p.price : parseFloat(String(p.price)) || 0,
            handle: p.handle || null,
            image: p.image || null,
            score: typeof p.score === "number" ? p.score : null,
          })),
        });
      }
    }

    return {
      success: true,
      sessionId: sessionId,
      responseType: "AI",
      userMessage: { role: "user", content: userMessageContent },
      assistantMessage: { role: "assistant", content: finalAiText },
      products: rawProducts,
      performance: {
        responseTime: Date.now() - startTime,
        productsFound: rawProducts.length,
      },
    };
  } catch (error: unknown) {
    console.error("[Core Logic Error]:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: "SYSTEM_ERROR",
      errorMessage: error instanceof Error ? error.message : String(error),
    } as unknown as ChatResult;
  }
}

// ============================================================================
// 4. SMART SEARCH LOGIC (THE BRAIN)
// ============================================================================

async function searchPinecone(
  shop: string,
  query: string,
  minPrice?: number,
  maxPrice?: number,
  sort?: "price_asc" | "price_desc" | "relevance",
): Promise<PineconeMatch[]> {
  try {
    const namespace = shop.replace(/\./g, "_");
    const embedding = await generateEmbeddings([query]);

    if (!embedding || embedding.length === 0) return [];

    const response = await fetch(`https://${INDEX_HOST}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
        "X-Pinecone-Api-Version": "2025-10",
      },
      body: JSON.stringify({
        namespace: namespace,
        vector: embedding[0],
        topK: 60,
        includeMetadata: true,
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!data.matches) return [];

    let matches = data.matches as PineconeMatch[];

    // --- QUERY ANALYSIS ---
    const lowerQuery = query.toLowerCase().trim();
    const isGeneric = [
      "items",
      "products",
      "stuff",
      "inventory",
      "goods",
      "gift",
      "gifts",
      "store",
      "everything",
      "shop",
      "sale",
    ].includes(lowerQuery);
    const hasSort = sort !== undefined && sort !== "relevance";
    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;

    matches = matches.filter((m) => {
      // Guard against results without metadata
      if (!m.metadata) return false;

      const title = String(m.metadata.title || "");
      const productType = String(m.metadata.product_type || "");
      const tagsValue = Array.isArray(m.metadata.tags)
        ? m.metadata.tags.join(" ")
        : String(m.metadata.tags || "");

      const combinedText = `${title} ${productType} ${tagsValue}`.toLowerCase();

      // A. EXACT NAME BOOST
      if (title && title.toLowerCase().includes(lowerQuery)) {
        m.score = 0.99;
        return true;
      }

      // B. PRICE FILTERING
      const priceVal =
        parseFloat(String(m.metadata.price ?? "").replace(/[^0-9.]/g, "")) ||
        0;
      if (minPrice !== undefined && priceVal < minPrice) return false;
      if (maxPrice !== undefined && priceVal > maxPrice) return false;

      // C. KEYWORD ENFORCEMENT (Anti-Hallucination)
      if (!isGeneric && !hasSort && m.score < 0.85) {
        const queryWords = lowerQuery.split(" ").filter((w) => w.length > 3);
        const forbidden = [
          "cheap",
          "best",
          "good",
          "nice",
          "expensive",
          "sale",
        ];
        const validWords = queryWords.filter((w) => !forbidden.includes(w));

        if (validWords.length > 0) {
          const hasKeywordMatch = validWords.some((w) =>
            combinedText.includes(w),
          );
          if (!hasKeywordMatch) return false;
        }
      }

      // D. SEMANTIC THRESHOLDING
      const threshold = isGeneric || hasSort || hasPriceFilter ? 0.15 : 0.4;
      if (m.score < threshold) return false;

      return true;
    });

    // 3. SORTING
    if (sort === "price_asc") {
      matches.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "price_desc") {
      matches.sort((a, b) => getPrice(b) - getPrice(a));
    } else {
      matches.sort((a, b) => b.score - a.score);
    }

    return matches.slice(0, 5);
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

function getPrice(m: PineconeMatch): number {
  return parseFloat(String(m.metadata.price).replace(/[^0-9.]/g, "")) || 0;
}

function formatProductsForAI(products: ChatProduct[]): string {
  if (products.length === 0)
    return "Result: No matching products found in inventory. Please apologize to the user.";

  return products
    .map((p) => {
      const title = p.title;
      const price = p.price;
      const desc = p.description
        ? p.description.substring(0, 300) + "..."
        : "No detailed description available.";
      const link = `/products/${p.handle}`;
      return `PRODUCT: ${title}\nPRICE: ${price}\nLINK: ${link}\nDETAILS: ${desc}\n---`;
    })
    .join("\n");
}

// ============================================================================
// 5. SYSTEM PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(aiSettings: AISettingsState): string {
  const storeDetails = aiSettings.storeDetails || {};
  const policies = aiSettings.policies || {};

  // 1. Merchant Picks (From the React Component)
  // Used to populate the [PRIORITY RECOMMENDATIONS] section
  const merchantPicks =
    aiSettings.recommendedProducts && aiSettings.recommendedProducts.length > 0
      ? aiSettings.recommendedProducts
          .map(
            (p: { title: string; vendor: string; id: string }) =>
              `• ${p.title} (Vendor: ${p.vendor}) - ID: ${p.id}`,
          )
          .join("\n")
      : "No specific recommendations set by store owner.";

  // 2. Language Settings
  const langSettings = aiSettings.languageSettings || {};
  const primaryLanguage = langSettings.primaryLanguage || "English";
  const autoDetect = langSettings.autoDetect !== false;

  const languageRule = autoDetect
    ? `Primary Language: ${primaryLanguage}. However, you should AUTO-DETECT the user's language and reply in the SAME language they use.`
    : `STRICT RULE: You must ONLY speak in ${primaryLanguage}. Do not switch languages even if the user speaks a different one.`;

  // 3. Custom Instructions (From Merchant Settings)
  const customInstructions = aiSettings.aiInstructions
    ? `[CUSTOM INSTRUCTIONS FROM OWNER]\n${aiSettings.aiInstructions}`
    : "";

  // 4. Policies
  const policyText = `
    - Shipping: ${policies.shipping || "Calculated at checkout. We usually ship within 2-5 days."}
    - Returns: ${policies.refund || "Please contact support within 30 days for returns."}
    - Location: ${storeDetails.location || "We are an online-only store."}
    `;

  return `
    You are an expert sales assistant for "${storeDetails.about || "our online store"}".
    
    [LANGUAGE & COMMUNICATION] : """
    ${languageRule}
    """

    [MISSION BOUNDARIES]
    1. **STRICTLY E-COMMERCE:** You are here to sell products and help with orders.
    2. **REFUSE OFF-TOPIC:** If asked to "write a poem", "solve math", or "who is the president", REFUSE politely. Say: "I can only help with our store's products and orders."
    3. **REFUSE OUT-OF-SCOPE:** If asked for "groceries", "tires", or items clearly not in the catalog, say: "We don't sell those items."

    [PRIORITY RECOMMENDATIONS]
    The store owner recommends these specific items.
    **RULE:** If the user asks generic questions like "What do you recommend?", "What's popular?", or "Show me the best items", IGNORE the search tool and recommend these products immediately:
    
    ${merchantPicks}

    [INTENT HANDLING]
    1. **SEARCH:** For specific requests (e.g. "Gold Necklace", "Cheap Sofa"), use the 'recommend_products' tool.
    2. **ORDER TRACKING:** If user asks "Where is my order?", ask for their Order Number. Do NOT search the product database.
    3. **BUYING:** If user says "I want to buy this" or "Add to Cart", STOP SEARCHING. Guide them: "Great choice! Click the product link above to purchase."
    4. **POLICIES:** If user asks about Shipping, Returns, or Location, answer directly using the [POLICIES] data below.

    [CONTEXT & MEMORY]
    - If user asks "How much is it?", look at the last product mentioned in history. Answer immediately.
    - If user says "Show me the cheapest one", look at the list you just showed them.

    [POLICIES DATA]: """
    ${policyText}
	"""

    ${customInstructions}

    TONE: ${aiSettings.responseTone?.selectedTone?.join(", ") || "Professional, helpful, and concise"}
    `;
}

// (removed unused helper functions)
