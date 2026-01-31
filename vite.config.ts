import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteDevServer } from "vite";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the Vite server.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

// --- FIX START ---
// Ensure the URL string has a protocol (https://) before passing it to new URL()
let appUrl = process.env.SHOPIFY_APP_URL || "http://localhost";
if (!appUrl.startsWith("http")) {
  appUrl = `https://${appUrl}`;
}
const host = new URL(appUrl).hostname;
// --- FIX END ---

// Get port from environment or use default
const serverPort = Number(process.env.PORT || process.env.SERVER_PORT || 59599);

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: serverPort,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: serverPort,
    strictPort: true, 
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    {
      name: "websocket-init",
      configureServer(server: ViteDevServer) {
        console.log(`[Vite Plugin] Server configured on port: ${serverPort} (strictPort: true)`);

        server.httpServer?.once("listening", () => {
          const actualPort = server.httpServer?.address();
          console.log(`[Vite Plugin] HTTP server listening on:`, actualPort);

          setTimeout(async () => {
            try {
              console.log("[Vite Plugin] Attempting to initialize WebSocket server...");

              if (!server.httpServer) {
                console.error("[Vite Plugin] ❌ HTTP server not available");
                return;
              }

              const websocketModule = await server.ssrLoadModule("/app/routes/websocket.server.ts");

              console.log("[Vite Plugin] Module loaded:", !!websocketModule);

              if (websocketModule.setupWebSocketServer) {
                websocketModule.setupWebSocketServer(server.httpServer!);
                const address = server.httpServer.address();
                const port = typeof address === 'object' && address ? address.port : 'unknown';
                console.log(`[Vite Plugin] ✅ WebSocket server initialized at /ws/chat on port ${port}`);
              } else {
                console.error("[Vite Plugin] ❌ setupWebSocketServer function not found in module");
              }
            } catch (err: any) {
              console.error("[Vite Plugin] ❌ Failed to initialize WebSocket server:", err?.message || err);
            }
          }, 500); 
        });
      },
    },
  ],
  build: {
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react"],
  },
}) satisfies UserConfig;