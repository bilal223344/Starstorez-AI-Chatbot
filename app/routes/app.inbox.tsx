
import { data, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { authenticate } from "app/shopify.server";
import { rtdb } from "app/services/firebaseAdmin.server";

// Client-side Firebase — lazy-init with config from loader
import { initializeApp, getApps, type FirebaseApp, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  query,
  limitToLast,
  onChildAdded,
  off,
  orderByKey,
  endBefore,
  get,
  push,
  type Database,
} from "firebase/database";

import { Loader2, ShoppingBag, Sparkles } from "lucide-react";
import "app/styles/inbox.css";
// import { generateAIResponse } from "@/services/ai/ai.service";
// import { AIMessage } from "~/types/chat.types";
import { useAppBridge } from "@shopify/app-bridge-react";
import { generateAIResponse } from "../services/ai/ai.service";
import { AIMessage } from "../types/chat.types";
// ============================================================================
// TYPES
// ============================================================================

interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

interface FirebaseMessage {
  id: string;
  sender: "user" | "ai" | "system" | "assistant";
  text: string;
  timestamp: number;
  product_ids?: string[];
}

interface ProductDetails {
  prodId: string;
  title: string;
  price: number;
  image: string;
  handle: string;
}

// Action for Smart Reply
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "generate_reply") {
    const messagesJson = formData.get("messages") as string;
    if (!messagesJson) return data({ reply: "" });

    try {
      const rawMessages = JSON.parse(messagesJson) as FirebaseMessage[];
      // Convert to AIMessage format
      const aiMessages: AIMessage[] = rawMessages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const response = await generateAIResponse(aiMessages, session.shop);
      let reply = "";
      if (typeof response === 'string') {
          reply = response;
      } else if (response && response.content) {
          reply = response.content;
      }

      return data({ reply });
    } catch (error) {
      console.error("Error generating reply:", error);
      return data({ reply: "", error: "Failed to generate reply" });
    }
  }

  return null;
};

interface SessionListItem {
  sessionId: string;
  email: string;
  lastMessage: string;
  lastSender: string;
  lastTimestamp: number;
  isHumanSupport: boolean;
  messageCount: number;
}

// ============================================================================
// LOADER — Fetch session list from Firebase Admin (server-side)
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    return data({ sessions: [] as SessionListItem[], shop: "", firebaseConfig: {} as FirebaseConfig });
  }

  const safeShop = session.shop.replace(/\./g, "_");
  const chatsRef = rtdb.ref(`chats/${safeShop}`);

  const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || "",
  };

  try {
    const snapshot = await chatsRef.get();

    if (!snapshot.exists()) {
      return data({
        sessions: [] as SessionListItem[],
        shop: session.shop,
        firebaseConfig,
      });
    }

    const allChats = snapshot.val() as Record<string, Record<string, unknown>>;
    const sessions: SessionListItem[] = [];

    for (const [sessionId, sessionData] of Object.entries(allChats)) {
      const messagesObj = (sessionData as Record<string, unknown>).messages as
        | Record<string, FirebaseMessage>
        | undefined;
      const metadata = (sessionData as Record<string, unknown>).metadata as
        | Record<string, unknown>
        | undefined;

      if (!messagesObj) continue;

      const msgs = Object.entries(messagesObj).map(([key, val]) => ({
        ...(val as FirebaseMessage),
        id: key,
      }));

      if (msgs.length === 0) continue;

      msgs.sort((a, b) => a.timestamp - b.timestamp);
      const lastMsg = msgs[msgs.length - 1];

      let email = "Guest";
      if (sessionId.includes("@")) {
        email = sessionId;
      } else if (
        metadata &&
        typeof (metadata as Record<string, unknown>).email === "string"
      ) {
        email = (metadata as Record<string, string>).email;
      }

      sessions.push({
        sessionId,
        email,
        lastMessage: lastMsg.text?.slice(0, 80) || "...",
        lastSender: lastMsg.sender,
        lastTimestamp: lastMsg.timestamp,
        isHumanSupport: !!(metadata as Record<string, unknown>)
          ?.isHumanSupport,
        messageCount: msgs.length,
      });
    }

    sessions.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    return data({
      sessions,
      shop: session.shop,
      firebaseConfig,
    });
  } catch (error) {
    console.error("[Inbox Loader] Error fetching sessions:", error);
    return data({
      sessions: [] as SessionListItem[],
      shop: session.shop,
      firebaseConfig,
    });
  }
};

// ============================================================================
// HELPERS
// ============================================================================

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitial(email: string): string {
  if (!email || email === "Guest") return "G";
  return email.charAt(0).toUpperCase();
}

function getDateLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = today.getTime() - msgDay.getTime();
  const dayDiff = Math.floor(diff / 86400000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Safely initialize client-side Firebase from loader config */
function getClientFirebase(config: FirebaseConfig): { app: FirebaseApp; db: Database } | null {
  if (!config.databaseURL || !config.apiKey) return null;
  try {
    const existing = getApps();
    const app = existing.length > 0 ? getApp() : initializeApp(config);
    const db = getDatabase(app);
    return { app, db };
  } catch (e) {
    console.error("[Inbox] Client Firebase init failed:", e);
    return null;
  }
}

const ProductCard = ({ product, shop, onAsk }: { product: ProductDetails; shop: string; onAsk: (p: ProductDetails) => void }) => {
  if (!product) return <div className="product-card" style={{ height: 300, background: '#f3f4f6' }}></div>;
  
  const handle = product.handle || product.prodId.split("/").pop();
  const productUrl = `https://${shop}/products/${handle}`;

  return (
    <div className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card__info">
        <h4 className="product-card__title" title={product.title}>{product.title}</h4>
        <p className="product-card__price">${product.price}</p>
      </div>
      <div className="product-card__actions">
        <a 
          href={productUrl}
          target="_blank" 
          rel="noreferrer"
          className="product-card__btn product-card__btn--secondary"
        >
          View Details
        </a>
        <button 
          onClick={() => onAsk(product)}
          className="product-card__btn product-card__btn--primary"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function Inbox() {
  const { sessions: initialSessions, firebaseConfig, shop } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const fetcher = useFetcher<{ reply?: string; error?: string }>(); // For action (generate reply)
  const productFetcher = useFetcher<{ products: ProductDetails[] }>(); // For loader (products)

  // State
  const sessions = initialSessions;
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "human">("all");

  // Cache for product details
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetails>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const BATCH_SIZE = 20;

  // Client-side Firebase DB — initialized from loader config
  const clientDb = useMemo<Database | null>(() => {
    const result = getClientFirebase(firebaseConfig as FirebaseConfig);
    return result?.db ?? null;
  }, [firebaseConfig]);

  const safeShop = useMemo(() => shop.replace(/\./g, "_"), [shop]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    let list = sessions;
    if (filterTab === "human") {
      list = list.filter((s: SessionListItem) => s.isHumanSupport);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s: SessionListItem) =>
        s.email.toLowerCase().includes(q) ||
        s.lastMessage.toLowerCase().includes(q) ||
        s.sessionId.toLowerCase().includes(q),
    );
  }, [sessions, searchQuery, filterTab]);

  // Selected session metadata
  const selectedSession = useMemo(
    () => sessions.find((s: SessionListItem) => s.sessionId === selectedSessionId),
    [sessions, selectedSessionId],
  );

  // ── Firebase listener for messages ──
  useEffect(() => {
    if (!selectedSessionId || !clientDb) return;

    setMessages([]);
    setLoadingMessages(true);
    setHasOlderMessages(true);
    isInitialLoad.current = true;

    const chatPath = `chats/${safeShop}/${selectedSessionId}/messages`;
    const q = query(ref(clientDb, chatPath), limitToLast(BATCH_SIZE));

    const handleNewMsg = (snapshot: { key: string | null; val: () => FirebaseMessage }) => {
      const val = snapshot.val();
      if (!val) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === snapshot.key)) return prev;
        return [...prev, { ...val, id: snapshot.key! }];
      });

      setLoadingMessages(false);

      if (!isInitialLoad.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        });
      }
    };

    onChildAdded(q, handleNewMsg);

    // After initial batch loads, scroll to bottom
    setTimeout(() => {
      isInitialLoad.current = false;
      setLoadingMessages(false);
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }, 800);

    return () => {
      off(q, "child_added", handleNewMsg);
    };
  }, [selectedSessionId, clientDb, safeShop]);

  // ── Load older messages ──
  const loadOlderMessages = useCallback(async () => {
    if (!clientDb || !selectedSessionId || messages.length === 0 || loadingOlder)
      return;

    setLoadingOlder(true);
    const chatPath = `chats/${safeShop}/${selectedSessionId}/messages`;
    const firstMsgId = messages[0].id;
    const prevScrollHeight = scrollRef.current?.scrollHeight || 0;

    try {
      const olderQuery = query(
        ref(clientDb, chatPath),
        orderByKey(),
        endBefore(firstMsgId),
        limitToLast(BATCH_SIZE),
      );
      const snapshot = await get(olderQuery);

      if (snapshot.exists()) {
        const olderMsgs: FirebaseMessage[] = [];
        snapshot.forEach((child) => {
          olderMsgs.push({ ...child.val(), id: child.key! });
        });

        if (olderMsgs.length < BATCH_SIZE) {
          setHasOlderMessages(false);
        }

        setMessages((prev) => [...olderMsgs, ...prev]);

        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      } else {
        setHasOlderMessages(false);
      }
    } catch (err) {
      console.error("[Inbox] Error loading older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [clientDb, selectedSessionId, messages, loadingOlder, safeShop]);

  // --- Batch Fetch Missing Product IDs ---
  useEffect(() => {
    // 1. Identify IDs needed
    const allProductIds = new Set<string>();
    messages.forEach(msg => {
      if (msg.product_ids && Array.isArray(msg.product_ids)) {
        msg.product_ids.forEach(id => allProductIds.add(id));
      }
    });

    // 2. Filter out already cached
    const missingIds = Array.from(allProductIds).filter(id => !productDetails[id]);

    // 3. Fetch if needed (debounce slightly effectively by dependency array)
    if (missingIds.length > 0 && productFetcher.state === "idle" && !productFetcher.data) {
      console.log("Fetching missing products:", missingIds);
      productFetcher.load(`/api/products?ids=${missingIds.join(",")}`);
    }
  }, [messages, productDetails, productFetcher.state, productFetcher]);

  // Update cache when products loaded
  useEffect(() => {
    if (productFetcher.data?.products) {
      setProductDetails(prev => {
        const next = { ...prev };
        productFetcher.data?.products.forEach((p) => {
          next[p.prodId] = p;
        });
        return next;
      });
    }
  }, [productFetcher.data]);

  // Handle Smart Reply Result
  useEffect(() => {
    if (fetcher.data && fetcher.data.reply) {
      setReplyText(fetcher.data.reply);
    }
  }, [fetcher.data]);


  // --- Event Handlers -------------------------

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Reset pagination state when switching sessions
    // setLastMessageTimestamp(null); // This was for a different pagination approach
    setHasOlderMessages(true);
    // Determine if mobile (based on window width or similar,
    // though simpler to just use CSS classes for visibility)
  };

  // ── Send message ──
  const handleSend = useCallback(async (text: string = replyText, productIds: string[] = []) => {
    if ((!text.trim() && productIds.length === 0) || !clientDb || !selectedSessionId || isSending) return;

    setIsSending(true);
    const chatPath = `chats/${safeShop}/${selectedSessionId}/messages`;

    try {
      await push(ref(clientDb, chatPath), {
        sender: "assistant",
        text: text.trim(),
        timestamp: Date.now(),
        ...(productIds.length > 0 ? { product_ids: productIds } : {})
      });
      setReplyText("");
    } catch (err) {
      console.error("[Inbox] Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  }, [replyText, clientDb, selectedSessionId, isSending, safeShop]);

  const handleProductPicker = async () => {
    const selected = await shopify.resourcePicker({ type: "product", multiple: true });
    if (selected) {
      const ids = selected.map((p: any) => p.id); // "gid://shopify/Product/..."
      
      // Just send the IDs, no text
      await handleSend("", ids);
    }
  };

  const handleAskProduct = (product: ProductDetails) => {
    handleSend(`Tell me more about ${product.title}`);
  };

  const handleGenerateReply = () => {
    if (messages.length === 0) return;
    // Take last 10 messages for context
    const recentMessages = messages.slice(-10);
    fetcher.submit(
        { intent: "generate_reply", messages: JSON.stringify(recentMessages) },
        { method: "post" }
    );
  };

  // ── Group messages by date ──
  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: FirebaseMessage[] }[] = [];
    let currentLabel = "";

    for (const msg of messages) {
      const label = getDateLabel(msg.timestamp);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }, [messages]);

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="inbox-layout">
      {/* ── SIDEBAR ── */}
      <div className="inbox-sidebar">
        <div className="inbox-sidebar__header">
          <div className="inbox-sidebar__title-row">
            <h2>Inbox</h2>
            <span className="inbox-sidebar__count">{sessions.length}</span>
          </div>
          <div className="inbox-sidebar__search">
            <svg
              className="inbox-sidebar__search-icon"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="inbox-sidebar__filters">
            <button
              className={`inbox-filter-btn ${filterTab === "all" ? "inbox-filter-btn--active" : ""}`}
              onClick={() => setFilterTab("all")}
            >
              All
            </button>
            <button
              className={`inbox-filter-btn ${filterTab === "human" ? "inbox-filter-btn--active" : ""}`}
              onClick={() => setFilterTab("human")}
            >
              🙋 Needs Human
            </button>
          </div>
        </div>

        <div className="inbox-sidebar__list">
          {filteredSessions.length === 0 ? (
            <div className="inbox-sidebar__empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>{searchQuery ? "No matching conversations" : "No conversations yet"}</p>
            </div>
          ) : (
            filteredSessions.map((s) => (
              <div
                key={s.sessionId}
                className={`session-card ${selectedSessionId === s.sessionId ? "session-card--active" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleSelectSession(s.sessionId);
                  setShowDetail(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectSession(s.sessionId);
                    setShowDetail(false);
                  }
                }}
              >
                <div
                  className={`session-card__avatar ${s.email === "Guest" ? "session-card__avatar--guest" : "session-card__avatar--customer"}`}
                >
                  {getInitial(s.email)}
                </div>
                <div className="session-card__content">
                  <div className="session-card__top-row">
                    <span className="session-card__name">
                      {s.email === "Guest" ? `Guest · ${s.sessionId.slice(0, 6)}` : s.email}
                    </span>
                    <span className="session-card__time">
                      {formatTime(s.lastTimestamp)}
                    </span>
                  </div>
                  <div className="session-card__preview">
                    <span className="session-card__sender-tag">
                      {s.lastSender === "ai" ? "AI" : s.lastSender === "user" ? "Customer" : "System"}
                    </span>
                    {s.lastMessage}
                  </div>
                  <div className="session-card__meta">
                    <span className="session-card__msg-count">{s.messageCount} msgs</span>
                    {s.isHumanSupport && (
                      <span className="session-card__badge session-card__badge--human">
                        🙋 Needs human
                      </span>
                    )}
                    {!s.isHumanSupport && (
                      <span className="session-card__badge session-card__badge--ai">
                        🤖 AI Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      {selectedSessionId && selectedSession ? (
        <div className="inbox-chat">
          {/* Header */}
          <div className="inbox-chat__header">
            <div className="inbox-chat__header-info">
              <div
                className={`session-card__avatar ${selectedSession.email === "Guest" ? "session-card__avatar--guest" : "session-card__avatar--customer"}`}
                style={{ width: 38, height: 38, minWidth: 38, fontSize: 14 }}
              >
                {getInitial(selectedSession.email)}
              </div>
              <div className="inbox-chat__header-text">
                <h3>
                  {selectedSession.email === "Guest"
                    ? `Guest · ${selectedSession.sessionId.slice(0, 8)}`
                    : selectedSession.email}
                </h3>
                <div className="inbox-chat__header-meta">
                  <span className={`inbox-status-dot ${selectedSession.isHumanSupport ? "inbox-status-dot--warning" : "inbox-status-dot--active"}`} />
                  <span>{selectedSession.isHumanSupport ? "Waiting for agent" : "AI handling"}</span>
                  <span className="inbox-chat__header-sep">·</span>
                  <span>{selectedSession.messageCount} messages</span>
                </div>
              </div>
            </div>
            <div className="inbox-chat__header-actions">
              {selectedSession.isHumanSupport && (
                <span className="inbox-escalated-badge">⚡ Escalated</span>
              )}
              <button
                className={`inbox-icon-btn ${showDetail ? "inbox-icon-btn--active" : ""}`}
                onClick={() => setShowDetail(!showDetail)}
                title="Customer details"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="inbox-chat__messages" ref={scrollRef}>
            {/* Load More */}
            {hasOlderMessages && messages.length >= BATCH_SIZE && (
              <div className="inbox-chat__load-more">
                <button onClick={loadOlderMessages} disabled={loadingOlder}>
                  {loadingOlder ? (
                    <>
                      <span className="inbox-mini-spinner" />
                      Loading...
                    </>
                  ) : "↑ Load older messages"}
                </button>
              </div>
            )}

            {loadingMessages ? (
              <div className="inbox-loading">
                <div className="inbox-loading__spinner" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="inbox-empty inbox-empty--transparent">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>No messages in this session</p>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.label} className="inbox-chat__group">
                  <div className="inbox-date-sep">
                    <span className="inbox-date-sep__line" />
                    <span className="inbox-date-sep__text">{group.label}</span>
                    <span className="inbox-date-sep__line" />
                  </div>
                  {group.messages.map((msg) => (
                    <div key={msg.id} className={`msg msg--${msg.sender}`}>
                      {/* Avatar */}
                      <div className={`msg__avatar msg__avatar--${msg.sender}`}>
                        {msg.sender === "user" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        ) : msg.sender === "ai" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zM9.5 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
                        ) : msg.sender === "assistant" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                        )}
                      </div>
                      {/* Bubble */}
                      <div className="msg__body">
                        <div className="msg__label">
                          <span className="msg__sender-name">
                            {msg.sender === "user" ? "Customer" : msg.sender === "ai" ? "AI Assistant" : msg.sender === "assistant" ? "Merchant" : "System"}
                          </span>
                          <span className="msg__timestamp">{formatFullTime(msg.timestamp)}</span>
                        </div>
                        <div className="msg__bubble">
                          {msg.text && <p>{msg.text}</p>}

                          {/* Render Product Cards if any */}
                          {msg.product_ids && msg.product_ids.length > 0 && (
                              <div className="product-carousel">
                                  {msg.product_ids.map(id => (
                                      <ProductCard 
                                        key={id} 
                                        product={productDetails[id]} 
                                        shop={shop}
                                        onAsk={handleAskProduct}
                                      />
                                  ))}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="inbox-chat__footer" style={{ borderTop: "1px solid #e3e5e8", background: "#fff" }}>
            {/* Toolbar */}
            <div style={{ padding: "8px 24px 0", display: "flex", gap: "8px" }}>
                 <button
                    onClick={handleProductPicker}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Recommend Product"
                 >
                    <ShoppingBag size={18} />
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>Recommend</span>
                 </button>
                 <button
                    onClick={handleGenerateReply}
                    style={{ background: "none", border: "none", cursor: "pointer", color: fetcher.state !== "idle" ? "#9333ea" : "#6b7280", padding: "4px", display: "flex", alignItems: "center", gap: "4px"  }}
                    title="Generate AI Reply"
                    disabled={fetcher.state !== "idle"}
                 >
                    <Sparkles size={18} className={fetcher.state !== "idle" ? "animate-pulse" : ""} />
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>Smart Reply</span>
                 </button>
            </div>

            {/* Input Area */}
            <div className="inbox-chat__input">
              <div className="inbox-chat__input-row">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className="inbox-chat__send-btn"
                  onClick={() => handleSend()}
                  disabled={!replyText.trim() && !isSending}
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="inbox-empty">
          <div className="inbox-empty__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>Select a conversation</h3>
          <p>Choose a chat session from the sidebar to view messages and respond to customers.</p>
        </div>
      )}

      {/* ── DETAIL PANEL ── */}
      {showDetail && selectedSession && (
        <div className="inbox-detail">
          <div className="inbox-detail__header">
            <h3>Customer Profile</h3>
            <button
              className="inbox-detail__close"
              onClick={() => setShowDetail(false)}
            >
              ✕
            </button>
          </div>

          {/* Avatar Block */}
          <div className="inbox-detail__identity">
            <div
              className={`inbox-detail__avatar ${selectedSession.email === "Guest" ? "session-card__avatar--guest" : "session-card__avatar--customer"}`}
            >
              {getInitial(selectedSession.email)}
            </div>
            <h4>
              {selectedSession.email === "Guest"
                ? "Guest User"
                : selectedSession.email}
            </h4>
          </div>

          {/* Metrics */}
          <div className="inbox-detail__metrics">
            <div className="inbox-detail__metric">
              <span className="inbox-detail__metric-label">Messages</span>
              <span className="inbox-detail__metric-value">{selectedSession.messageCount}</span>
            </div>
            <div className="inbox-detail__metric">
              <span className="inbox-detail__metric-label">Status</span>
              <span className={`inbox-detail__metric-value ${selectedSession.isHumanSupport ? "inbox-detail__metric-value--warning" : "inbox-detail__metric-value--success"}`}>
                {selectedSession.isHumanSupport ? "Escalated" : "AI Active"}
              </span>
            </div>
          </div>

          <div className="inbox-detail__section">
            <div className="inbox-detail__label">Session ID</div>
            <div
              className="inbox-detail__value inbox-detail__value--mono"
            >
              {selectedSession.sessionId}
            </div>
          </div>

          <div className="inbox-detail__section">
            <div className="inbox-detail__label">Last Activity</div>
            <div className="inbox-detail__value">
              {new Date(selectedSession.lastTimestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}