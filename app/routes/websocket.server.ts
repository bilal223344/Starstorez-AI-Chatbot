import { WebSocketServer, WebSocket } from "ws";
import {
  handleWebSocketMessage,
  registerWebSocketClient,
} from "./api.chat.$shop.$custMail";
import { Server } from "http";

function log(label: string, details: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[WS][${timestamp}] ${label}`, details);
}

// Track if WebSocket server is already set up
let wsServerInstance: WebSocketServer | null = null;

export function setupWebSocketServer(server: Server) {
  // Prevent duplicate initialization
  if (wsServerInstance) {
    log("⚠️ WebSocket server already initialized, skipping");
    return;
  }

  // 1. Initialize with 'noServer: true' so it doesn't auto-attach
  const wss = new WebSocketServer({
    noServer: true,
    // Remove 'path' here, we handle it manually below
    perMessageDeflate: false,
  });
  wsServerInstance = wss;

  log("✅ WebSocket Server initialized (waiting for upgrades on /ws/chat)");

  // Log when server is ready
  wss.on("listening", () => {
    log("🎧 WebSocket server is listening for connections");
  });

  // 2. Manually handle the upgrade event
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;

    // 🚨 CRITICAL: Only handle upgrades for YOUR path
    if (pathname === "/ws/chat") {
      log("🔄 WebSocket upgrade request received for /ws/chat");

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
    // 🚨 CRITICAL: If path is NOT /ws/chat, do NOTHING. 
    // This allows Vite's internal listener to handle HMR updates.
  });

  wss.on("connection", (ws, req) => {
    log("🔌 WebSocket connection established", {
      url: req.url,
      remoteAddress: req.socket.remoteAddress,
    });

    // 1. Extract Params from URL (ws://host/ws/chat?shop=x&custMail=y)
    // Note: req.url here comes from the handleUpgrade call
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const shop = url.searchParams.get("shop");
    const custMail = url.searchParams.get("custMail");

    if (!shop || !custMail) {
      log("❌ Connection rejected: Missing credentials");
      ws.close(1008, "Missing shop or custMail params");
      return;
    }

    // 2. Register Client
    registerWebSocketClient(shop, custMail, ws);

    log("✅ Client connected", { shop, custMail });

    // 3. Handle Messages
    ws.on("message", async (rawMessage) => {
      const payload = rawMessage.toString();

      try {
        const data = JSON.parse(payload);
        const userMessage = data.message as string | undefined;

        if (!userMessage) {
          ws.send(JSON.stringify({ success: false, error: "INVALID_REQUEST" }));
          return;
        }

        // Handle Logic
        const result = await handleWebSocketMessage(shop, custMail, userMessage, ws);

        log("✅ Message processed", { success: result.success });
      } catch (error) {
        log("❌ Message error", { error: (error as Error).message });
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ success: false, error: "SYSTEM_ERROR" }));
        }
      }
    });

    ws.on("close", () => {
      log("🔌 Client disconnected", { shop, custMail });
    });

    ws.on("error", (err) => {
      log("❌ Socket error", { error: (err as Error).message });
    });
  });

  wss.on("error", (error) => {
    log("❌ WebSocket Server error", { error: (error as Error).message });
  });
}