import { useState, useMemo, useEffect, useRef } from "react";
import { useLoaderData, LoaderFunctionArgs, useSearchParams } from "react-router";
import { CallbackEvent } from "@shopify/polaris-types";
import { formatDistanceToNow } from "date-fns";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    createdAt: Date;
    products?: {
        id?: string;
        title?: string;
        price?: number;
        handle?: string;
        image?: string;
        score?: number;
    }[];
}

interface ChatSession {
    id: string;
    customerId: string | null;
    isGuest: boolean;
    createdAt: Date;
    messages: Message[];
}

interface Customer {
    id: string;
    shopifyId: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    source: string;
    createdAt: Date;
    chats: ChatSession[];
}

interface CustomerSidebarProps {
    customers: Customer[];
    selectedCustomerId: string | null;
    setSelectedCustomerId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sourceFilter: string;
    setSourceFilter: (source: string) => void;
    modeFilter: string;
    setModeFilter: (mode: string) => void;
    dateFilter: string;
    setDateFilter: (date: string) => void;
    formatTime: (date: Date) => string;
}

interface ChatInterfaceProps {
    customer: Customer | undefined;
    messages: Message[];
    aiEnabled: boolean;
    setAiEnabled: (enabled: boolean) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    handleAiSuggest: () => void;
    formatTime: (date: Date) => string;
}

// ============================================================================
// LOADER: Fetch customers, chat sessions, and messages from database
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    
    // TODO: Port ChatSession and Customer listing to Firebase Realtime Database
    // Prisma tables (ChatSession, Message, Customer) are deleted.
    console.warn("app.chats.management loader needs to be ported to Firebase");

    if (!session?.shop) {
        return { customers: [] as Customer[] };
    }

    return { customers: [] as Customer[] };
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ChatsManagement() {
    const { customers: loaderCustomers } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();

    // Normalize date fields to Date instances on the client
    const [customers] = useState<Customer[]>(() =>
        loaderCustomers.map(c => ({
            ...c,
            createdAt: new Date(c.createdAt as unknown as string),
            chats: c.chats.map(s => ({
                ...s,
                createdAt: new Date(s.createdAt as unknown as string),
                messages: s.messages.map(m => ({
                    ...m,
                    createdAt: new Date(m.createdAt as unknown as string)
                }))
            }))
        }))
    );

    const initialCustomerIdFromUrl = searchParams.get("customerId");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
        initialCustomerIdFromUrl || customers[0]?.id || null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    const [modeFilter, setModeFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [aiEnabled, setAiEnabled] = useState(true);
    const [replyText, setReplyText] = useState("");

    const handleSelectCustomer = (id: string) => {
        setSelectedCustomerId(id);
        const next = new URLSearchParams(searchParams);
        next.set("customerId", id);
        setSearchParams(next);
    };

    const selectedCustomer = useMemo(
        () => customers.find((c) => c.id === selectedCustomerId),
        [customers, selectedCustomerId]
    );

    const allMessages = useMemo(() => {
        if (!selectedCustomer) return [];
        return selectedCustomer.chats
            .flatMap((s) => s.messages)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }, [selectedCustomer]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
            const matchesSource = !sourceFilter || c.source === sourceFilter;

            const lastMsg = c.chats[0]?.messages.slice(-1)[0];
            const isAiActive = lastMsg?.role === "assistant";
            const matchesMode = !modeFilter || (modeFilter === "ai" ? isAiActive : !isAiActive);

            // Date filtering logic
            if (!lastMsg) return false;
            const now = new Date();
            const diffDays = (now.getTime() - lastMsg.createdAt.getTime()) / (1000 * 3600 * 24);
            if (dateFilter === "recent" && diffDays > 1) return false;
            if (dateFilter === "7days" && diffDays > 7) return false;
            if (dateFilter === "30days" && diffDays > 30) return false;

            return matchesSearch && matchesSource && matchesMode;
        });
    }, [customers, searchQuery, sourceFilter, modeFilter, dateFilter]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleAiSuggest = () => {
        setReplyText("I've checked your order and it's currently in transit!");
    };

    return (
        <s-page heading="Inbox" inlineSize="large">
            <div style={{
                display: "grid",
                gridTemplateColumns: "350px 1fr",
                height: "calc(100vh - 20px)",
                border: "1px solid var(--p-color-border-subdued)",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#EEEEEE"
            }}>
                <CustomerSidebar
                    customers={filteredCustomers}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={handleSelectCustomer}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sourceFilter={sourceFilter}
                    setSourceFilter={setSourceFilter}
                    modeFilter={modeFilter}
                    setModeFilter={setModeFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    formatTime={formatTime}
                />

                <ChatInterface
                    customer={selectedCustomer}
                    messages={allMessages}
                    aiEnabled={aiEnabled}
                    setAiEnabled={setAiEnabled}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleAiSuggest={handleAiSuggest}
                    formatTime={formatTime}
                />
            </div>
        </s-page>
    );
}

// ============================================================================
// SUB-COMPONENT: SIDEBAR
// ============================================================================

export function CustomerSidebar({
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    searchQuery,
    setSearchQuery,
    sourceFilter,
    setSourceFilter,
    modeFilter,
    setModeFilter,
    dateFilter,
    setDateFilter,
}: CustomerSidebarProps) {
    return (
        <s-box borderStyle="none solid none none">
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <s-stack gap="none">
                    <div style={{ backgroundColor: "#B5EAEA", height: "72px" }}>
                        <s-box padding="base" borderStyle="none none solid none">
                            <s-grid gridTemplateColumns="1fr auto" gap="small" alignItems="center">
                                <s-search-field
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onInput={(e: CallbackEvent<"s-search-field">) => setSearchQuery(e.currentTarget.value)}
                                />
                                <s-button icon="filter" variant="secondary" commandFor="sidebar-filters"></s-button>
                                <s-popover id="sidebar-filters" minInlineSize="250px">
                                    <s-box padding="base">
                                        <s-stack gap="base">
                                            <s-choice-list
                                                label="Last Message"
                                                values={[dateFilter]}
                                                onChange={(e: CallbackEvent<"s-choice-list">) => setDateFilter(e.currentTarget.values[0] || "all")}
                                            >
                                                <s-choice value="all">All time</s-choice>
                                                <s-choice value="recent">Today</s-choice>
                                                <s-choice value="7days">Last 7 days</s-choice>
                                                <s-choice value="30days">Last 30 days</s-choice>
                                            </s-choice-list>
                                            <s-divider />
                                            <s-choice-list
                                                label="Source"
                                                values={[sourceFilter]}
                                                onChange={(e: CallbackEvent<"s-choice-list">) => setSourceFilter(e.currentTarget.values[0] || "")}
                                            >
                                                <s-choice value="">All Sources</s-choice>
                                                <s-choice value="SHOPIFY">Shopify</s-choice>
                                                <s-choice value="WEBSITE">Website</s-choice>
                                            </s-choice-list>
                                            <s-divider />
                                            <s-choice-list
                                                label="Mode"
                                                values={[modeFilter]}
                                                onChange={(e: CallbackEvent<"s-choice-list">) => setModeFilter(e.currentTarget.values[0] || "")}
                                            >
                                                <s-choice value="">All Modes</s-choice>
                                                <s-choice value="ai">AI Active</s-choice>
                                                <s-choice value="manual">Manual</s-choice>
                                            </s-choice-list>
                                        </s-stack>
                                    </s-box>
                                </s-popover>
                            </s-grid>
                        </s-box>
                    </div>

                    <div style={{ flex: "1", overflowY: "auto" }}>
                        {customers.map((customer) => {
                            const lastMsg = customer.chats[0]?.messages.slice(-1)[0];
                            return (
                                <div key={customer.id}>
                                    <s-clickable onClick={() => setSelectedCustomerId(customer.id)} borderRadius="base">
                                        <s-box padding="base" background={customer.id === selectedCustomerId ? "transparent" : undefined} borderStyle="solid">
                                            <s-stack gap="small-200">
                                                <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                                    <s-heading><span style={{ fontSize: "15px" }}>{customer.firstName ?? customer.email} {customer.lastName ?? ""}</span></s-heading>
                                                    <s-text tone="neutral">
                                                        <span style={{ fontSize: "10px" }}>{lastMsg ? formatDistanceToNow(lastMsg.createdAt, { addSuffix: true }) : ""}</span>
                                                    </s-text>
                                                </s-grid>
                                                <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    <s-text tone="neutral">{lastMsg?.content || "No history"}</s-text>
                                                </div>
                                            </s-stack>
                                        </s-box>
                                    </s-clickable>
                                    <s-divider />
                                </div>
                            );
                        })}
                    </div>
                </s-stack>
            </div>
        </s-box>
    );
}

// ============================================================================
// SUB-COMPONENT: CHAT INTERFACE
// ============================================================================

function ChatInterface({
    customer,
    messages,
    // aiEnabled,
    // setAiEnabled,
    // replyText,
    // setReplyText,
    // handleAiSuggest,
}: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const [visibleCount, setVisibleCount] = useState<number>(30);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const primaryColor = "#B5EAEA";

    // Reset visible messages when switching customer
    useEffect(() => {
        const base = 30;
        setVisibleCount(messages.length < base ? messages.length : base);
        const last = messages[messages.length - 1]?.id ?? null;
        lastMessageIdRef.current = last;
    }, [customer?.id, messages]);

    // Auto-scroll to bottom only when a new message arrives
    useEffect(() => {
        if (!isAtBottom) return;
        const last = messages[messages.length - 1]?.id ?? null;
        if (last !== lastMessageIdRef.current) {
            lastMessageIdRef.current = last;
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, isAtBottom]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        if (scrollTop <= 10 && visibleCount < messages.length) {
            setVisibleCount(prev =>
                Math.min(prev + 30, messages.length)
            );
        }

        const threshold = 10;
        const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        setIsAtBottom(atBottom);
    };

    const scrollToBottom = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        setIsAtBottom(true);
    };

    const visibleMessages = useMemo(() => {
        if (messages.length <= visibleCount) return messages;
        const start = messages.length - visibleCount;
        return messages.slice(start);
    }, [messages, visibleCount]);

    if (!customer) {
        return (<div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
            <s-text tone="neutral">Select a customer to start chatting</s-text>
        </div>);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ height: "72px", padding: "0 20px", background: primaryColor, color: "#000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: "18px" }}>{customer.firstName} {customer.lastName}</div>
                    <div style={{ fontSize: "10px", opacity: 0.9 }}>{customer.email} | {customer.source}</div>
                </div>
            </div>

            <div
                ref={scrollRef}
                style={{ overflowY: "auto", height: "75vh", padding: "20px", display: "flex", flexDirection: "column", backgroundColor: "#F9F7F7" }}
                onScroll={handleScroll}
            >
                {visibleMessages.map(msg => {
                    const isUser = msg.role === "user";
                    return (
                        <div
                            key={msg.id}
                            style={{
                                alignSelf: isUser ? "flex-end" : "flex-start",
                                backgroundColor: isUser ? "#EEEEEE" : primaryColor,
                                color: isUser ? "#000" : "#000",
                                padding: "5px 16px",
                                borderRadius: isUser ? "1em 1em 0 1em" : "1em 1em 1em 0",
                                marginBottom: "6px",
                                maxWidth: "70%",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: (msg.content || "").replace(/\n/g, "<br/>")
                                }}
                            />

                            {!!msg.products?.length && (
                                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {msg.products.map(prod => (
                                        <div
                                            key={prod.id ?? prod.handle ?? prod.title}
                                            style={{
                                                width: "140px",
                                                borderRadius: "10px",
                                                border: "1px solid rgba(0,0,0,0.06)",
                                                overflow: "hidden",
                                                backgroundColor: "#FFFFFF",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                                            }}
                                        >
                                            {prod.image && (
                                                <div style={{ width: "100%", height: "90px", overflow: "hidden" }}>
                                                    <img
                                                        src={prod.image}
                                                        alt={prod.title || ""}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ padding: "6px 8px" }}>
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        marginBottom: "2px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    {prod.title}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#444" }}>
                                                    {typeof prod.price === "number" ? `$${prod.price}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                style={{
                                    fontSize: "8px",
                                    marginTop: "1px",
                                    opacity: 0.8,
                                    textAlign: isUser ? "right" : "left"
                                }}
                            >
                                {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isAtBottom && messages.length > 0 && (
                <div style={{ textAlign: "center", padding: "4px 0" }}>
                    <s-button variant="tertiary" onClick={scrollToBottom}>
                        Go to latest message
                    </s-button>
                </div>
            )}
        </div>
    );
}