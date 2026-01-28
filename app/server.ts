import { setupWebSocketServer } from "./routes/websocket.server";
import type { Server } from "http";

// Global variable to track if WebSocket is initialized
let wsInitialized = false;

/**
 * Initialize WebSocket server for React Router app
 * Call this function when your HTTP server starts
 */
export function initializeWebSocketServer(server: Server) {
  if (wsInitialized) {
    console.log("[Server] WebSocket server already initialized");
    return;
  }

  try {
    setupWebSocketServer(server);
    wsInitialized = true;
    console.log("[Server] ✅ WebSocket server initialized successfully");
  } catch (error) {
    console.error("[Server] ❌ Failed to initialize WebSocket server:", error);
  }
}

// Auto-initialize if server is available (for development)
if (typeof global !== "undefined") {
  const globalServer = (global as { httpServer?: Server }).httpServer;
  if (globalServer && !wsInitialized) {
    initializeWebSocketServer(globalServer);
  }
}
