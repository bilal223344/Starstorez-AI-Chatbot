import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
// IMPORTANT: Adjust this path to match where your websocket.server.ts is located.
// Based on your logs, it seems to be in app/routes/ or app/services/
import { setupWebSocketServer } from "app/websocket.server";

const app = express();
const httpServer = createServer(app);

// ============================================================================
// 1. SECURITY: Fix CSP "Frame Ancestors" Error
// ============================================================================
// This middleware ensures Shopify can load your app in an iframe
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  );
  next();
});

// ============================================================================
// 2. WEBSOCKETS: Initialize Server
// ============================================================================
// We pass the raw HTTP server instance so it can handle the "upgrade" protocol
setupWebSocketServer(httpServer);

// ============================================================================
// 3. STANDARD MIDDLEWARE
// ============================================================================
app.use(compression());
app.disable("x-powered-by");
app.use(morgan("tiny"));

// Serve Static Assets (Cache Control)
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));

// ============================================================================
// 4. REACT ROUTER HANDLER
// ============================================================================
// Dynamically import the server build to avoid issues during development
// @ts-ignore
const build = await import("./build/server/index.js");

app.all(
  "*",
  createRequestHandler({
    build: build as any,
    mode: process.env.NODE_ENV,
  })
);

// ============================================================================
// 5. START SERVER
// ============================================================================
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`✅ Express server listening on http://localhost:${port}`);
  console.log(`✅ WebSocket server ready at /ws/chat`);
});