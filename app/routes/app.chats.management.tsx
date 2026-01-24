import { useState, useMemo, useEffect, useRef } from "react";
import { CallbackEvent } from "@shopify/polaris-types";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    createdAt: Date;
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
    dateFilter: string; // New
    setDateFilter: (date: string) => void; // New
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
// MAIN PAGE COMPONENT
// ============================================================================

export default function ChatsManagement() {
    const [customers] = useState<Customer[]>(() => generateMockCustomers());
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    const [modeFilter, setModeFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [aiEnabled, setAiEnabled] = useState(true);
    const [replyText, setReplyText] = useState("");

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
                // background: "var(--p -color-bg-surface)"
            }}>
                <CustomerSidebar
                    customers={filteredCustomers}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={setSelectedCustomerId}
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
    // formatTime,
}: CustomerSidebarProps) {
    return (
        <s-box borderStyle="none solid none none">
            {/* Fix: Wrapped s-stack in a div to handle height since s-stack doesn't take 'style' */}
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
                                <>
                                    <s-clickable key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} borderRadius="base">
                                        <s-box padding="base" background={customer.id === selectedCustomerId ? "transparent" : undefined} borderStyle="solid">
                                            <s-stack gap="small-200">
                                                <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                                    <s-heading><span style={{ fontSize: "15px" }}>{customer.firstName} {customer.lastName}</span></s-heading>
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
                                </>
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
    aiEnabled,
    setAiEnabled,
    replyText,
    setReplyText,
    handleAiSuggest,
    // formatTime
}: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const primaryColor = "#B5EAEA";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!customer) {
        return (
            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <s-text tone="neutral">Select a customer to start chatting</s-text>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ height: "72px", padding: "0 20px", background: primaryColor, color: "#000", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: "18px" }}>{customer.firstName} {customer.lastName}</div>
                    <div style={{ fontSize: "10px", opacity: 0.9 }}>{customer.email} | {customer.source}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>AI Agent</span>
                    <s-switch checked={aiEnabled} onChange={(e: CallbackEvent<"s-switch">) => setAiEnabled(e.currentTarget.checked)} />
                </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", backgroundColor: "#F9F7F7" }}>
                {messages.map(msg => {
                    const isUser = msg.role === "user";
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isUser ? "flex-end" : "flex-start",
                            backgroundColor: isUser ? "#EEEEEE" : primaryColor,
                            color: isUser ? "#000" : "#000",
                            padding: "5px 16px",
                            borderRadius: isUser ? "1em 1em 0 1em" : "1em 1em 1em 0",
                            marginBottom: "6px",
                            maxWidth: "70%",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                        }}>
                            <div>{msg.content}</div>
                            <div style={{ fontSize: "8px", marginTop: "1px", opacity: 0.8, textAlign: isUser ? "right" : "left" }}>
                                {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: "10px 14px", borderTop: `2px solid ${primaryColor}`, background: "#EEEEEE" }}>
                <textarea
                    rows={3}
                    placeholder="Type your message..."
                    value={replyText}
                    disabled={!aiEnabled}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ maxWidth: "100%", width: "98%", height: "40px", border: "1px solid #1B211A", color: "#1B211A", borderRadius: "0.8em", padding: "6px 9px", marginBottom: "4px", resize: "none", outline: "none" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <s-heading><span style={{ fontSize: "16px" }}>{aiEnabled ? "AI auto-reply on" : "Manual mode"}</span></s-heading>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <s-button variant="secondary" onClick={handleAiSuggest} disabled={!aiEnabled}>AI Suggest</s-button>
                        <s-button variant="primary" onClick={() => setReplyText("")} disabled={!replyText.trim()}>Send</s-button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockCustomers = (): Customer[] => {
    const customers: Customer[] = [];
    const sources = ["SHOPIFY", "WEBSITE", "MANUAL"];
    const firstNames = ["John", "Sarah", "Michael", "Emily", "David", "Jessica"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"];

    for (let i = 0; i < 15; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

        customers.push({
            id: `customer-${i}`,
            shopifyId: `gid://shopify/Customer/${1000 + i}`,
            email,
            firstName,
            lastName,
            phone: `+1-555-010${i}`,
            source: sources[i % sources.length],
            createdAt: new Date(),
            chats: [{
                id: `session-${i}`,
                customerId: `customer-${i}`,
                isGuest: false,
                createdAt: new Date(),
                messages: [
                    { id: `msg-${i}-1`, content: "I'm looking for an update on my order.", role: "user", createdAt: new Date(Date.now() - 3600000) },
                    { id: `msg-${i}-2`, content: "I'd be happy to help with that!", role: "assistant", createdAt: new Date(Date.now() - 1800000) },
                    { id: `msg-${i}-3`, content: "I'd be happy to help with that, I'd be happy to help with that, I'd be happy to help with that", role: "user", createdAt: new Date(Date.now() - 1800000) },
                    { id: `msg-${i}-4`, content: "I'd be happy to help with that!", role: "assistant", createdAt: new Date(Date.now() - 1800000) }
                ]
            }],
        });
    }
    return customers;
};