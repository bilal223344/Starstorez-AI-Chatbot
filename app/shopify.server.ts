import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { DEFAULT_CHATBOT_SETTINGS } from "./utils/defaultCustomizer";
import { Prisma } from "@prisma/client";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      // Trigger the sync process in the background
      console.log(`[Auth] afterAuth triggered for ${session.shop}`);
      const { performInitialSync } = await import("./services/syncService");
      if (session.accessToken) {
        console.log(`[Install] Starting background sync for ${session.shop}`);
        // Run without awaiting to avoid blocking the auth callback
        performInitialSync(session.shop, session.accessToken).catch((err) => {
          console.error(`[Install Error] Sync failed for ${session.shop}`, err);
        });
      }

      try {
        console.log(`[Install] Seeding default customization settings...`);

        await prisma.chatbotCustomization.upsert({
          where: { shop: session.shop },
          update: {},
          create: {
            shop: session.shop,
            settings: DEFAULT_CHATBOT_SETTINGS as unknown as Prisma.InputJsonValue,
          } as any,
        });
        console.log(`[Install] Default settings saved successfully.`);
      } catch (error) {
        console.error(`[Install Error] Failed to seed settings:`, error);
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
