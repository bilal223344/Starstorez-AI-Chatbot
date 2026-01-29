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
  
  const wss = new WebSocketServer({ 
    server, 
    path: "/ws/chat",
    // Allow connections from any origin (adjust for production)
    perMessageDeflate: false,
  });
  wsServerInstance = wss;

  const serverAddress = server.address();
  const port = typeof serverAddress === 'object' && serverAddress ? serverAddress.port : 'unknown';
  
  log("✅ WebSocket Server initialized at /ws/chat", {
    serverAddress: serverAddress,
    port: port,
    path: "/ws/chat",
    expectedPort: process.env.PORT || process.env.WS_PORT || process.env.SERVER_PORT || 'not set',
  });

  // Log when server is ready
  wss.on("listening", () => {
    log("🎧 WebSocket server is listening for connections");
  });

  // Log upgrade requests (before connection is established)
  server.on("upgrade", (request) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/ws/chat") {
      log("🔄 WebSocket upgrade request received", {
        url: request.url,
        headers: {
          upgrade: request.headers.upgrade,
          connection: request.headers.connection,
          "sec-websocket-key": request.headers["sec-websocket-key"] ? "present" : "missing",
        },
      });
    }
  });

  wss.on("connection", (ws, req) => {
    log("🔌 WebSocket connection established", {
      url: req.url,
      remoteAddress: req.socket.remoteAddress,
    });

    // 1. Extract Params from URL (ws://host/ws/chat?shop=x&custMail=y)
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const shop = url.searchParams.get("shop");
    const custMail = url.searchParams.get("custMail");

    if (!shop || !custMail) {
      log("❌ Connection rejected: Missing credentials", {
        remoteAddress: req.socket.remoteAddress,
        url: req.url,
      });
      ws.close(1008, "Missing shop or custMail params");
      return;
    }

    log("🔌 Client connecting", {
      shop,
      custMail,
      remoteAddress: req.socket.remoteAddress,
    });

    // 2. Register Client using the helper function
    registerWebSocketClient(shop, custMail, ws);

    log("✅ Client connected and registered", {
      shop,
      custMail,
      remoteAddress: req.socket.remoteAddress,
    });

    // 3. Handle Messages using the helper function
    ws.on("message", async (rawMessage) => {
      const payload = rawMessage.toString();
      log("📨 Message received", { shop, custMail, raw: payload });

      try {
        // Parse incoming message (Client sends: { "message": "Show me blue shirts" })
        const data = JSON.parse(payload);
        const userMessage = data.message as string | undefined;

        if (!userMessage) {
          log("⚠️ Ignored message without 'message' field", { shop, custMail });
          ws.send(
            JSON.stringify({
              success: false,
              error: "INVALID_REQUEST",
              errorMessage: "Missing 'message' field",
            })
          );
          return;
        }

        const start = Date.now();

        // --- USE THE HELPER FUNCTION FROM ACTION ---
        const result = await handleWebSocketMessage(shop, custMail, userMessage, ws);

        log("✅ Message processed", {
          shop,
          custMail,
          durationMs: Date.now() - start,
          success: result.success,
          productsCount: result.products?.length || 0,
        });
      } catch (error) {
        log("❌ Message error", {
          shop,
          custMail,
          error: (error as Error).message,
        });
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              success: false,
              error: "SYSTEM_ERROR",
              errorMessage: (error as Error).message || "Processing failed",
            })
          );
        }
      }
    });

    ws.on("close", (code, reason) => {
      log("🔌 Client disconnected", {
        shop,
        custMail,
        code,
        reason: reason.toString(),
      });
      // Client cleanup is handled by registerWebSocketClient
    });

    ws.on("error", (err) => {
      log("❌ Socket error", {
        shop,
        custMail,
        error: (err as Error).message,
      });
    });
  });

  wss.on("error", (error) => {
    log("❌ WebSocket Server error", { error: (error as Error).message });
  });

  log("🚀 WebSocket Server ready and listening");
}

// Auto-initialize if server is available in global scope (for some environments)
if (typeof global !== "undefined") {
  const globalAny = global as { httpServer?: Server };
  if (globalAny.httpServer && globalAny.httpServer instanceof Server) {
    setupWebSocketServer(globalAny.httpServer);
  }
}

// Also try to get server from process (for Node.js environments)
if (typeof process !== "undefined" && (process as { httpServer?: Server }).httpServer) {
  const processServer = (process as { httpServer?: Server }).httpServer;
  if (processServer instanceof Server) {
    setupWebSocketServer(processServer);
  }
}
