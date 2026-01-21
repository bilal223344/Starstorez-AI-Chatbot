import { MasterState } from "app/routes/app.customization";
import {
    IconSend,
    IconX,
    IconMinus,
    IconMessageCircle
} from "@tabler/icons-react";

interface ChatbotPreviewProps {
    data: MasterState;
}

export default function ChatbotPreview({ data }: ChatbotPreviewProps) {
    const { chatWindow, messageBox, topNav, welcome, position, btnSize, btnAnim } = data;

    // --- 1. THEME ENGINE ---
    // We calculate the primary background once. 
    // This variable controls the Header, Bot Bubbles, and the Launcher Button.
    const primaryThemeBackground = chatWindow.colorMode === 'gradient'
        ? `linear-gradient(135deg, ${chatWindow.gradientStart}, ${chatWindow.gradientEnd})`
        : chatWindow.primaryColor;

    // --- 2. DYNAMIC STYLES ---

    const headerStyle: React.CSSProperties = {
        background: primaryThemeBackground, // <--- Unified Theme
        height: `${topNav.headerHeight}px`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        padding: "0 15px",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        justifyContent: "space-between",
        fontFamily: chatWindow.fontFamily,
    };

    // Shared styles for both bubbles
    const bubbleBaseStyle: React.CSSProperties = {
        borderRadius: `${messageBox.borderRadius}px`,
        padding: `${messageBox.paddingVertical}px ${messageBox.paddingHorizontal}px`,
        marginBottom: `${messageBox.messageSpacing}px`,
        fontSize: `${chatWindow.fontSize}px`,
        fontWeight: chatWindow.fontWeight,
        fontFamily: chatWindow.fontFamily,
        maxWidth: '85%',
        wordWrap: "break-word",
        lineHeight: "1.4",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    };

    const botMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: primaryThemeBackground, // <--- Unified Theme
        color: "#ffffff", // White text ensures contrast on your primary brand color
        borderBottomLeftRadius: "2px",
        alignSelf: "flex-start",
    };

    const userMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: chatWindow.secondaryColor || "#f1f1f1", // Uses Secondary color from ChatWindow settings
        color: chatWindow.textColor || "#000000",           // Uses Text color from ChatWindow settings
        borderBottomRightRadius: "2px",
        alignSelf: "flex-end",
    };

    const positionStyle: React.CSSProperties = {
        position: "absolute",
        zIndex: position.zIndex,
        bottom: `${position.marginBottom}px`,
        [position.chatButtonPosition === "Left corner" ? "left" : "right"]: `${position.marginRight}px`,
    };

    return (
        <div style={{
            width: "100%",
            height: "600px",
            backgroundColor: "#e5e5e5",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #dcdcdc"
        }}>

            {/* --- CHAT WINDOW CONTAINER --- */}
            <div style={{
                position: "absolute",
                bottom: `${position.marginBottom + btnSize.size + 20}px`,
                [position.chatButtonPosition === "Left corner" ? "left" : "right"]: `${position.marginRight}px`,
                width: "350px",
                height: "450px",
                backgroundColor: chatWindow.backgroundColor || "#ffffff", // Uses Background color from ChatWindow settings
                borderRadius: "12px",
                boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                zIndex: position.zIndex,
                fontFamily: chatWindow.fontFamily
            }}>

                {/* 1. Header */}
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {chatWindow.avatar && (
                            <img
                                src={chatWindow.avatar}
                                alt="Bot"
                                style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }}
                            />
                        )}
                        <div style={{ lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 600, fontSize: '15px' }}>{chatWindow.botName}</div>
                            {topNav.showOnlineStatus && (
                                <div style={{ fontSize: "11px", opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: 6, height: 6, background: '#44b700', borderRadius: '50%', boxShadow: "0 0 4px #44b700" }}></span>
                                    {topNav.onlineStatusType === "Custom" ? topNav.customOnlineText : topNav.onlineStatusType}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                        <IconMinus size={18} color="white" />
                        <IconX size={18} color="white" />
                    </div>
                </div>

                {/* 2. Chat Body */}
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                    {/* Bot Greeting */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <div style={botMessageStyle}>
                            {welcome.greeting || "Hello! How can I help?"}
                        </div>
                        {messageBox.timestampDisplay && (
                            <span style={{ fontSize: '10px', color: '#999', marginLeft: 5, marginBottom: 10 }}>10:30 AM</span>
                        )}
                    </div>

                    {/* Simulated User Message */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', marginTop: '10px' }}>
                        <div style={userMessageStyle}>
                            Hi! I&apos;m looking for the best sellers.
                        </div>
                        {messageBox.timestampDisplay && (
                            <span style={{ fontSize: '10px', color: '#999', marginRight: 5, marginBottom: 10 }}>10:31 AM</span>
                        )}
                    </div>

                    {/* Typing Indicator */}
                    {messageBox.typingIndicator !== "None" && (
                        <div style={{ ...botMessageStyle, width: 'fit-content', marginTop: 10, padding: '8px 16px' }}>
                            {messageBox.typingIndicator === "Dots (animated)" ? "•••" : "AI is typing..."}
                        </div>
                    )}

                    {/* Quick Questions (Chips) */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px' }}>
                        {welcome.quickQuestions.map((q, i) => (
                            <button key={i} style={{
                                background: "rgba(0,0,0,0.03)", // Subtle background
                                border: `1px solid ${chatWindow.primaryColor}`, // Border matches theme
                                color: chatWindow.primaryColor, // Text matches theme
                                padding: "8px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: chatWindow.fontFamily
                            }}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Footer Input */}
                <div style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", gap: "10px", background: "#fff", borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <input
                        type="text"
                        placeholder={welcome.inputPlaceholder}
                        readOnly
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "14px",
                            fontFamily: chatWindow.fontFamily,
                            color: "#333"
                        }}
                    />

                    <div style={{
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.9
                    }}>
                        {messageBox.sendIcon ? (
                            <img src={messageBox.sendIcon} width={messageBox.sendIconSize} height={messageBox.sendIconSize} alt="Send" />
                        ) : (
                            // Send Icon also takes the Primary Color
                            <IconSend size={messageBox.sendIconSize} color={chatWindow.primaryColor} />
                        )}
                    </div>
                </div>
            </div>


            {/* --- LAUNCHER BUTTON --- */}
            <div style={positionStyle}>
                <button style={{
                    width: `${btnSize.size}px`,
                    height: `${btnSize.size}px`,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: primaryThemeBackground, // <--- Unified Theme
                    boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    transform: btnAnim.animationType === "Zoom" ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.3s ease-in-out",
                    animation: btnAnim.animationType === "Breathing" ? "breathing 2s infinite" : "none"
                }}>
                    <IconMessageCircle size={btnSize.size * 0.55} stroke={1.5} />
                </button>

                <style>{`
                    @keyframes breathing {
                        0% { box-shadow: 0 0 0 0 rgba(215, 53, 53, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(215, 53, 53, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(215, 53, 53, 0); }
                    }
                `}</style>
            </div>

        </div>
    );
}