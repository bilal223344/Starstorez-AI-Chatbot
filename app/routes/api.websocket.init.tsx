import { LoaderFunctionArgs } from "react-router";
import { setupWebSocketServer } from "./websocket.server";

// This route initializes the WebSocket server on first access
// Call this once when your app starts: GET /api/websocket/init
let wsInitialized = false;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the HTTP server from the request
  // Note: This might not work in all environments
  // For production, initialize WebSocket server separately
  
  try {
    if (wsInitialized) {
      return Response.json({ 
        success: true, 
        message: "WebSocket server already initialized" 
      });
    }

    // Try to get the server instance
    // In React Router/Vite, we need to access the server differently
    const server = (request as any).server || (global as any).httpServer;
    
    if (server) {
      setupWebSocketServer(server);
      wsInitialized = true;
      return Response.json({ 
        success: true, 
        message: "WebSocket server initialized" 
      });
    } else {
      return Response.json({ 
        success: false, 
        message: "HTTP server not available. WebSocket initialization skipped." 
      });
    }
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error?.message || "Failed to initialize WebSocket server" 
    }, { status: 500 });
  }
};
