import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteDevServer } from "vite";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the Vite server.
// The CLI will eventually stop passing in HOST,
// so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

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
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      // See https://vitejs.dev/config/server-options.html#server-fs-allow for more information
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    {
      name: "websocket-init",
      configureServer(server: ViteDevServer) {
        server.httpServer?.once("listening", () => {
          // Small delay to ensure server is fully ready
          setTimeout(async () => {
            try {
              console.log("[Vite Plugin] Attempting to initialize WebSocket server...");
              
              if (!server.httpServer) {
                console.error("[Vite Plugin] ❌ HTTP server not available");
                return;
              }

              // Use Vite's ssrLoadModule to properly resolve and load the module
              const websocketModule = await server.ssrLoadModule("/app/routes/websocket.server.ts");
              
              console.log("[Vite Plugin] Module loaded:", !!websocketModule);
              console.log("[Vite Plugin] setupWebSocketServer exists:", !!websocketModule.setupWebSocketServer);
              
              if (websocketModule.setupWebSocketServer) {
                websocketModule.setupWebSocketServer(server.httpServer!);
                console.log("[Vite Plugin] ✅ WebSocket server initialized at /ws/chat");
              } else {
                console.error("[Vite Plugin] ❌ setupWebSocketServer function not found in module");
              }
            } catch (err: any) {
              console.error("[Vite Plugin] ❌ Failed to initialize WebSocket server:");
              console.error("[Vite Plugin] Error:", err?.message || err);
              console.error("[Vite Plugin] Stack:", err?.stack);
              console.log("[Vite Plugin] ℹ️ HTTP POST will still work. WebSocket disabled.");
            }
          }, 500); // 500ms delay to ensure server is ready
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
