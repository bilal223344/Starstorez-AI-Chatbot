import { useState, useMemo, useEffect, useRef } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { CallbackEvent } from "@shopify/polaris-types";
import type { MasterState } from "./app.customization";

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

interface CustomerSidebarProps {
    customers: Customer[];
    selectedCustomerId: string | null;
    setSelectedCustomerId: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    aiEnabled: boolean;
    formatTime: (date: Date) => string;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockCustomers = (): Customer[] => {
    const customers: Customer[] = [];
    const sources = ["SHOPIFY", "WEBSITE", "MANUAL"];
    const firstNames = ["John", "Sarah", "Michael", "Emily", "David", "Jessica", "Chris", "Amanda"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];

    for (let i = 0; i < 15; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

        const chatCount = Math.floor(Math.random() * 2) + 1;
        const chats: ChatSession[] = [];

        for (let j = 0; j < chatCount; j++) {
            const messages: Message[] = [];
            const messageCount = Math.floor(Math.random() * 10) + 5;

            for (let k = 0; k < messageCount; k++) {
                const isUser = k % 2 === 0;
                messages.push({
                    id: `msg-${i}-${j}-${k}`,
                    content: isUser
                        ? `I'm looking for an update on order #100${i}. Can you help?`
                        : `Of course! Let me check the status of order #100${i} for you.`,
                    role: isUser ? "user" : "assistant",
                    createdAt: new Date(Date.now() - (messageCount - k) * 3600000),
                });
            }

            chats.push({
                id: `session-${i}-${j}`,
                customerId: `customer-${i}`,
                isGuest: false,
                createdAt: new Date(),
                messages,
            });
        }

        customers.push({
            id: `customer-${i}`,
            shopifyId: `gid://shopify/Customer/${1000 + i}`,
            email,
            firstName,
            lastName,
            phone: `+1-555-010${i}`,
            source: sources[i % sources.length],
            createdAt: new Date(),
            chats,
        });
    }
    return customers;
};

// ============================================================================
// LOADER
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return {};
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatsManagement() {
    const [customers] = useState<Customer[]>(() => generateMockCustomers());
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [aiEnabled, setAiEnabled] = useState(true);
    const [replyText, setReplyText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get selected customer
    const selectedCustomer = useMemo(
        () => customers.find((c) => c.id === selectedCustomerId),
        [customers, selectedCustomerId]
    );

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedCustomerId, selectedCustomer?.chats]);

    // Derived Data
    const allMessages = useMemo(() => {
        if (!selectedCustomer) return [];
        return selectedCustomer.chats
            .flatMap((s) => s.messages)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }, [selectedCustomer]);

    const filteredCustomers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return customers.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleAiSuggest = () => {
        const suggestions = [
            "I've checked your order and it's currently in transit. You should receive it by Tuesday!",
            "I'm sorry for the delay. I've expedited your request to our fulfillment team.",
            "Can you please provide your order number so I can assist you better?"
        ];
        setReplyText(suggestions[Math.floor(Math.random() * suggestions.length)]);
    };

    return (
        <s-page heading="Inbox" inlineSize="large">
            <div style={{
                display: "grid",
                gridTemplateColumns: "350px 1fr",
                height: "calc(100vh - 140px)",
                border: "1px solid var(--p-color-border-subdued)",
                borderRadius: "8px",
                overflow: "hidden",
                background: "var(--p-color-bg-surface)"
            }}>
                <CustomerSidebar
                    customers={filteredCustomers}
                    selectedCustomerId={selectedCustomerId}
                    setSelectedCustomerId={setSelectedCustomerId}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    aiEnabled={aiEnabled}
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


function CustomerSidebar({
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    searchQuery,
    setSearchQuery,
    aiEnabled,
    formatTime
}: CustomerSidebarProps) {
    return (
        <div style={{ background: "var(--p-color-bg-surface-secondary)", borderRight: "1px solid var(--p-color-border)" }}>
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Search Header */}
                <div style={{ padding: "1rem", borderBottom: "1px solid var(--p-color-border)" }}>
                    <s-search-field
                        placeholder="Search customers..."
                        value={searchQuery}
                        onInput={(e: CallbackEvent<"s-search-field">) => setSearchQuery(e.currentTarget.value)}
                    />
                </div>

                {/* Scrollable Customer List */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {customers.length === 0 ? (
                        <div style={{ padding: "1rem" }}>
                            <s-text color="subdued">No customers found</s-text>
                        </div>
                    ) : (
                        customers.map(customer => {
                            const isSelected = customer.id === selectedCustomerId;
                            const lastMsg = customer.chats[0]?.messages.slice(-1)[0];
                            return (
                                <s-clickable key={customer.id} onClick={() => setSelectedCustomerId(customer.id)}>
                                    <div style={{ 
                                        padding: "1rem", 
                                        background: isSelected ? "var(--p-color-bg-surface-selected)" : "transparent",
                                        borderBottom: "1px solid var(--p-color-border)"
                                    }}>
                                        <s-stack gap="small-100">
                                            <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                                                <s-heading>{customer.firstName} {customer.lastName}</s-heading>
                                                <s-text color="subdued">{lastMsg ? formatTime(lastMsg.createdAt) : ""}</s-text>
                                            </s-grid>
                                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                <s-text color="subdued">
                                                    {lastMsg?.content || "No history"}
                                                </s-text>
                                            </div>
                                            <s-badge tone={aiEnabled ? "success" : "neutral"}>
                                                {aiEnabled ? "AI Active" : "Manual"}
                                            </s-badge>
                                        </s-stack>
                                    </div>
                                </s-clickable>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}


function ChatInterface({
    customer,
    messages,
    aiEnabled,
    setAiEnabled,
    replyText,
    setReplyText,
    handleAiSuggest,
    formatTime
}: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Default styling matching ChatbotPreview (from customization defaults)
    const defaultStyles: MasterState = {
        chatWindow: {
            avatar: "",
            botName: "Start Store Assistant",
            colorMode: "solid",
            primaryColor: "#D73535",
            gradientStart: "#1CB5E0",
            gradientEnd: "#000851",
            secondaryColor: "#FF937E",
            backgroundColor: "#FCF8F8",
            textColor: "#111F35",
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: "Regular (400)"
        },
        messageBox: {
            borderRadius: 12,
            messageSpacing: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            sendIcon: "",
            sendIconSize: 16,
            timestampDisplay: false
        },
        welcome: {
            greeting: "👋 Welcome! How can I help you today?",
            quickQuestions: [],
            inputPlaceholder: "Type your message here...",
            sendOnEnter: false
        },
        topNav: {
            headerHeight: 60,
            headerContent: "StartStorez",
            showOnlineStatus: true,
            onlineStatusType: "Online",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Left corner",
            marginRight: 30,
            marginBottom: 30,
            zIndex: 2147483647
        },
        btnSize: {
            size: 60
        },
        btnAnim: {
            animationType: "Static"
        }
    };

    // Calculate primary theme background (same logic as ChatbotPreview)
    const primaryThemeBackground = defaultStyles.chatWindow.colorMode === 'gradient'
        ? `linear-gradient(135deg, ${defaultStyles.chatWindow.gradientStart}, ${defaultStyles.chatWindow.gradientEnd})`
        : defaultStyles.chatWindow.primaryColor;

    // Shared bubble base style (same as ChatbotPreview)
    const bubbleBaseStyle: React.CSSProperties = {
        borderRadius: `${defaultStyles.messageBox.borderRadius}px`,
        padding: `${defaultStyles.messageBox.paddingVertical}px ${defaultStyles.messageBox.paddingHorizontal}px`,
        marginBottom: `${defaultStyles.messageBox.messageSpacing}px`,
        fontSize: `${defaultStyles.chatWindow.fontSize}px`,
        fontWeight: defaultStyles.chatWindow.fontWeight,
        fontFamily: defaultStyles.chatWindow.fontFamily,
        maxWidth: '85%',
        wordWrap: "break-word",
        lineHeight: "1.4",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    };

    // Bot message style (assistant messages)
    const botMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: primaryThemeBackground,
        color: "#ffffff",
        borderBottomLeftRadius: "2px",
        alignSelf: "flex-start",
    };

    // User message style
    const userMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: defaultStyles.chatWindow.secondaryColor || "#f1f1f1",
        color: defaultStyles.chatWindow.textColor || "#000000",
        borderBottomRightRadius: "2px",
        alignSelf: "flex-end",
    };

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!customer) {
        return (
            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <s-text color="subdued">Select a customer to start chatting</s-text>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: defaultStyles.chatWindow.fontFamily }}>
            {/* Chat Header */}
            <div style={{ 
                padding: "1rem", 
                borderBottom: "1px solid var(--p-color-border)",
                background: primaryThemeBackground,
                color: "#fff"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>
                            {customer.firstName} {customer.lastName}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.9, display: "flex", gap: "8px", alignItems: "center" }}>
                            <span>{customer.email}</span>
                            <span style={{ 
                                background: "rgba(255,255,255,0.2)", 
                                padding: "2px 8px", 
                                borderRadius: "12px",
                                fontSize: "10px"
                            }}>
                                {customer.source}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px" }}>AI Agent</span>
                        <s-switch checked={aiEnabled} onChange={(e: CallbackEvent<"s-switch">) => setAiEnabled(e.currentTarget.checked)} />
                    </div>
                </div>
            </div>

            {/* Message Feed - styled like ChatbotPreview */}
            <div 
                ref={scrollRef} 
                style={{ 
                    flex: 1, 
                    overflowY: "auto", 
                    padding: "20px", 
                    display: "flex", 
                    flexDirection: "column",
                    backgroundColor: defaultStyles.chatWindow.backgroundColor || "#ffffff"
                }}
            >
                {messages.map(msg => {
                    const isUser = msg.role === "user";
                    const messageStyle = isUser ? userMessageStyle : botMessageStyle;
                    
                    return (
                        <div 
                            key={msg.id} 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: isUser ? 'flex-end' : 'flex-start', 
                                width: '100%',
                                marginBottom: defaultStyles.messageBox.messageSpacing
                            }}
                        >
                            <div style={messageStyle}>
                                {msg.content}
                            </div>
                            {defaultStyles.messageBox.timestampDisplay && (
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: '#999', 
                                    marginTop: '4px',
                                    marginLeft: isUser ? 0 : 5,
                                    marginRight: isUser ? 5 : 0
                                }}>
                                    {formatTime(msg.createdAt)}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sticky Reply Composer - styled like ChatbotPreview footer */}
            <div style={{ 
                padding: "15px", 
                borderTop: "1px solid #eee", 
                display: "flex", 
                flexDirection: "column",
                gap: "10px",
                background: "#fff"
            }}>
                <textarea
                    rows={3}
                    placeholder={defaultStyles.welcome.inputPlaceholder || `Message ${customer.firstName}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        fontFamily: defaultStyles.chatWindow.fontFamily,
                        color: "#333",
                        resize: "none",
                        padding: "8px"
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px" }}>
                        <s-text color="subdued">
                            {aiEnabled ? "AI will auto-reply." : "Manual mode active."}
                        </s-text>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <s-button variant="secondary" onClick={handleAiSuggest} disabled={!aiEnabled}>
                            AI Suggest Reply
                        </s-button>
                        <s-button variant="primary" disabled={!replyText.trim()} onClick={() => setReplyText("")}>
                            Send
                        </s-button>
                    </div>
                </div>
            </div>
        </div>
    );
}