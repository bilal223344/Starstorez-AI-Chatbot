// app/services/websocket.server.ts
import { WebSocketServer, WebSocket, RawData } from "ws"; // Added RawData
import type { Server, IncomingMessage } from "http";
import { processChat } from "app/services/chat/chat.processor";
import { WebSocketType } from "app/types/chat.types";

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================
export const WS_PORT = Number(process.env.WS_PORT || 3009);
export const WS_PATH = process.env.WS_PATH || "/ws/chat";

// Registry: "shop:email" -> WebSocket
const activeClients = new Map<string, WebSocketType>();

// Global Server Instance (to prevent double-init during HMR)
let wssInstance: WebSocketServer | null = null;

// ============================================================================
// 1. INITIALIZATION (CALLED BY VITE)
// ============================================================================

export function setupWebSocketServer(server: Server) {
  if (wssInstance) return; // Already initialized

  console.log("[WS-Init] Attaching WebSocket Server...");

  // 1. Create WebSocket Server (NoServer mode allows us to handle upgrades manually)
  wssInstance = new WebSocketServer({ noServer: true });

  // 2. Listen for HTTP Upgrades (ws:// requests)
  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);

    // Only handle OUR path
    if (url.pathname !== WS_PATH) return;

    // 3. Handle the Upgrade
    wssInstance!.handleUpgrade(request, socket, head, (ws) => {
      const shop = url.searchParams.get("shop");
      const custMail = url.searchParams.get("custMail");

      if (shop && custMail) {
        // Emit connection event to our logic
        wssInstance!.emit("connection", ws, request, { shop, custMail });
      } else {
        ws.close(1008, "Missing credentials");
      }
    });
  });

  // 3. Handle Connections
  wssInstance.on("connection", (ws: WebSocket, _req: IncomingMessage, clientInfo: any) => {
    const { shop, custMail } = clientInfo;

    // A. Register
    registerWebSocketClient(shop, custMail, ws);

    // B. Listen for Messages
    ws.on("message", async (rawMessage: RawData) => {
      try {
        const msgString = rawMessage.toString();
        // Call the Business Logic (Chat Processor)
        const result = await processChat(shop, custMail, msgString);
        sendToClient(ws, result);
      } catch (err) {
        console.error("Message processing failed", err);
      }
    });
  });

  console.log(`[WS-Init] ✅ Ready at ${WS_PATH}`);
}

// ============================================================================
// 2. CLIENT MANAGEMENT
// ============================================================================

export function registerWebSocketClient(shop: string, custMail: string, ws: WebSocketType) {
  const clientKey = `${shop}:${custMail}`;
  activeClients.set(clientKey, ws);
  setupCleanup(ws, clientKey);
  console.log(`[WS-Registry] Registered: ${clientKey} | Total: ${activeClients.size}`);
}

function setupCleanup(ws: WebSocketType, key: string) {
  const cleanup = () => {
    if (activeClients.get(key) === ws) {
      activeClients.delete(key);
      console.log(`[WS-Registry] Disconnected: ${key}`);
    }
  };

  ws.on("close", cleanup);
  ws.on("error", cleanup);
}

// ============================================================================
// 3. SENDING & BROADCASTING
// ============================================================================

export function sendToClient(ws: WebSocketType, data: unknown) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (e) {
      console.error("[WS-Send] Error:", e);
    }
  }
}

export function broadcastToClient(shop: string, custMail: string, data: unknown) {
  const key = `${shop}:${custMail}`;
  const ws = activeClients.get(key);
  if (ws) {
    sendToClient(ws, data);
    console.log(`[WS-Broadcast] Sent to ${key}`);
  }
}

// ============================================================================
// 4. UTILS
// ============================================================================

export function getWebSocketUrl(shop: string, custMail: string): string {
  const protocol = process.env.NODE_ENV === "production" ? "wss" : "ws";

  let host = "localhost:3000";

  if (process.env.SHOPIFY_APP_URL) {
    // This handles the Tunnel URL automatically (e.g. random-id.trycloudflare.com)
    host = new URL(process.env.SHOPIFY_APP_URL).host;
  } else if (process.env.PORT) {
    // Fallback to the local port if no tunnel exists yet
    host = `localhost:${process.env.PORT}`;
  }

  return `${protocol}://${host}${process.env.WS_PATH || "/ws/chat"}?shop=${encodeURIComponent(shop)}&custMail=${encodeURIComponent(custMail)}`;
}