import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Shared Firebase Admin initialization — used by orchestrator.ts and inbox loader
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "ai-chat-bot-425d2",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const rtdb = getDatabase();
