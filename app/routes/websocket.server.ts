import { WebSocketServer, WebSocket } from "ws";
import { processChat } from "./api.chat.$shop.$custMail";
import { Server } from "http";

// Store active connections if needed (optional)
const clients = new Map<WebSocket, { shop: string; custMail: string }>();

function log(label: string, details: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[WS][${timestamp}] ${label}`, details);
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  log("Server initialized at /ws/chat");

  wss.on("connection", (ws, req) => {
    // 1. Extract Params from URL (ws://host/ws/chat?shop=x&custMail=y)
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const shop = url.searchParams.get("shop");
    const custMail = url.searchParams.get("custMail");

    if (!shop || !custMail) {
      log("Connection rejected: Missing credentials", {
        remoteAddress: req.socket.remoteAddress,
      });
      ws.close(1008, "Missing shop or custMail params");
      return;
    }

    // 2. Register Client
    clients.set(ws, { shop, custMail });
    log("Client connected", {
      shop,
      custMail,
      remoteAddress: req.socket.remoteAddress,
    });

    // 3. Handle Messages
    ws.on("message", async (rawMessage) => {
      const payload = rawMessage.toString();
      log("Message received", { shop, custMail, raw: payload });

      try {
        // Parse incoming message (Client sends: { "message": "Show me blue shirts" })
        const data = JSON.parse(payload);
        const userMessage = data.message as string | undefined;

        if (!userMessage) {
          log("Ignored message without 'message' field", { shop, custMail });
          return;
        }

        const start = Date.now();

        // --- CALL SHARED LOGIC ---
        const result = await processChat(shop, custMail, userMessage);

        log("Message processed", {
          shop,
          custMail,
          durationMs: Date.now() - start,
          success: result.success,
        });

        // --- Send Response ---
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(result));
        } else {
          log("Skipped send: socket not open", { shop, custMail });
        }
      } catch (error) {
        log("Message error", {
          shop,
          custMail,
          error: (error as Error).message,
        });
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({ success: false, error: "Processing failed" }),
          );
        }
      }
    });

    ws.on("close", (code, reason) => {
      clients.delete(ws);
      log("Client disconnected", {
        shop,
        custMail,
        code,
        reason: reason.toString(),
      });
    });

    ws.on("error", (err) => {
      log("Socket error", {
        shop,
        custMail,
        error: (err as Error).message,
      });
    });
  });
}
