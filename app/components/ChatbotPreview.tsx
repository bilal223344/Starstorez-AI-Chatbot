import { MasterState } from "app/routes/app.customization";
import { useState } from "react";
import {
    IconSend,
    IconX,
    IconMinus,
    IconMessageCircle,
    IconMessage,
    IconMessage2,
    IconMessageDots,
    IconHeadset,
    IconBulb,
    IconHelp,
    IconMoodSmile,
    IconPhone,
    IconArrowRight,
    IconPlane,
    IconArrowForward,
    IconChevronRight,
    IconArrowUpRight,
    IconArrowRightCircle,
    IconSend2
} from "@tabler/icons-react";

interface ChatbotPreviewProps {
    data: MasterState;
}

export default function ChatbotPreview({ data }: ChatbotPreviewProps) {
    const { chatWindow, messageBox, topNav, welcome, position, btnSize, btnAnim, closeButtonAnim, footer } = data;
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    // Helper function to get font family with fallbacks
    const getFontFamily = (fontName: string): string => {
        // If font name contains spaces, wrap it in quotes and add fallback
        if (fontName.includes(' ')) {
            return `"${fontName}", sans-serif`;
        }
        return `${fontName}, sans-serif`;
    };

    // Icon mapping for send button
    const getSendIcon = () => {
        const iconMap: Record<string, typeof IconSend> = {
            "send": IconSend,
            "arrow-right": IconArrowRight,
            "plane": IconPlane,
            "arrow-forward": IconArrowForward,
            "chevron-right": IconChevronRight,
            "arrow-up-right": IconArrowUpRight,
            "arrow-right-circle": IconArrowRightCircle,
            "send2": IconSend2
        };
        const IconComponent = iconMap[footer.sendIconName] || IconSend;
        return <IconComponent size={footer.sendIconSize} color={footer.sendButtonIconColor} />;
    };

    // Icon mapping for launcher button
    const getLauncherIcon = () => {
        const iconMap: Record<string, typeof IconMessageCircle> = {
            "message-circle": IconMessageCircle,
            "message": IconMessage,
            "message2": IconMessage2,
            "message-dots": IconMessageDots,
            "headset": IconHeadset,
            "bulb": IconBulb,
            "help": IconHelp,
            "mood-smile": IconMoodSmile,
            "phone": IconPhone
        };
        const IconComponent = iconMap[btnSize.launcherIconName] || IconMessageCircle;
        return <IconComponent size={btnSize.launcherIconSize} stroke={1.5} color="white" />;
    };

    // Get button animation based on animation type
    const getButtonAnimation = (): string => {
        const duration = `${(btnAnim.transitionDuration || 300) / 1000}s`;
        switch (btnAnim.animationType) {
            case "Breathing":
                return `breathing 2s infinite`;
            case "Pulse":
                return `pulse ${duration} infinite`;
            case "Bounce":
                return `bounce ${duration} infinite`;
            case "Shake":
                return `shake 0.5s infinite`;
            case "Rotate":
                return `rotate 2s linear infinite`;
            case "Glow":
                return `glow ${duration} ease-in-out infinite`;
            case "Flash":
                return `flash ${duration} infinite`;
            default:
                return "none";
        }
    };

    // --- 1. THEME ENGINE ---
    // We calculate the primary background once. 
    // This variable controls the Header, Bot Bubbles, and the Launcher Button.
    const primaryThemeBackground = chatWindow.colorMode === 'gradient'
        ? `linear-gradient(135deg, ${chatWindow.gradientStart}, ${chatWindow.gradientEnd})`
        : chatWindow.primaryColor;
    
    // For borders and text colors, we need a solid color (use gradientStart when in gradient mode)
    const primaryThemeColor = chatWindow.colorMode === 'gradient'
        ? chatWindow.gradientStart
        : chatWindow.primaryColor;

    // --- 2. DYNAMIC STYLES ---

    const headerStyle: React.CSSProperties = {
        background: primaryThemeBackground, // <--- Unified Theme
        height: `${topNav.headerHeight}px`,
        color: chatWindow.textColor || "#fff",
        display: "flex",
        alignItems: "center",
        padding: "0 15px",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        justifyContent: "space-between",
        fontFamily: getFontFamily(chatWindow.fontFamily),
    };

    // Shared styles for both bubbles
    const bubbleBaseStyle: React.CSSProperties = {
        borderTopLeftRadius: `${messageBox.borderRadiusTop}px`,
        borderTopRightRadius: `${messageBox.borderRadiusRight}px`,
        borderBottomRightRadius: `${messageBox.borderRadiusBottom}px`,
        borderBottomLeftRadius: `${messageBox.borderRadiusLeft}px`,
        padding: `${messageBox.paddingVertical}px ${messageBox.paddingHorizontal}px`,
        marginBottom: `${messageBox.messageSpacing}px`,
        fontSize: `${chatWindow.fontSize}px`,
        fontWeight: chatWindow.fontWeight,
        fontFamily: getFontFamily(chatWindow.fontFamily),
        maxWidth: '85%',
        wordWrap: "break-word",
        lineHeight: "1.4",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    };

    const botMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: primaryThemeBackground, // <--- Unified Theme
        color: chatWindow.textColor || "#ffffff", // Uses Primary Text color from ChatWindow settings
        alignSelf: "flex-start",
    };

    const userMessageStyle: React.CSSProperties = {
        ...bubbleBaseStyle,
        background: chatWindow.secondaryColor || "#f1f1f1", // Uses Secondary color from ChatWindow settings
        color: chatWindow.secondaryTextColor || "#000000",   // Uses Secondary Text color from ChatWindow settings
        alignSelf: "flex-end",
    };

    const positionStyle: React.CSSProperties = {
        position: "absolute",
        zIndex: position.zIndex,
        bottom: `${position.marginBottom}px`,
        [position.chatButtonPosition === "Left corner" ? "left" : "right"]: `${position.marginRight}px`,
    };

    // Close handler with animation
    const handleClose = () => {
        setIsClosing(true);
        const duration = closeButtonAnim.transitionDuration || 300;

        setTimeout(() => {
            setIsChatOpen(false);
            setIsClosing(false);
            // Reset after animation completes for preview purposes
            setTimeout(() => {
                setIsChatOpen(true);
            }, 100);
        }, duration);
    };

    // Get animation styles based on selected animation type
    const getCloseAnimationStyle = (): React.CSSProperties => {
        if (!isClosing) return {};

        const duration = closeButtonAnim.transitionDuration || 300;
        const transition = `all ${duration}ms ease`;

        switch (closeButtonAnim.animationType) {
            case "Fade Out":
                return {
                    opacity: 0,
                    transition
                };
            case "Slide Down":
                return {
                    transform: `translateY(${chatWindow.height + 100}px)`,
                    opacity: 0,
                    transition
                };
            case "Slide Up":
                return {
                    transform: `translateY(-${chatWindow.height + 100}px)`,
                    opacity: 0,
                    transition
                };
            case "Scale Down":
                return {
                    transform: "scale(0)",
                    opacity: 0,
                    transition
                };
            case "Rotate Out":
                return {
                    transform: "rotate(180deg) scale(0)",
                    opacity: 0,
                    transition
                };
            case "Instant":
                return {
                    display: "none"
                };
            default:
                return {
                    opacity: 0,
                    transition
                };
        }
    };

    return (
        <div style={{
            width: "100%",
            height: `${chatWindow.height + 75}px`,
            backgroundColor: "#e5e5e5",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #dcdcdc"
        }}>

            {/* --- CHAT WINDOW CONTAINER --- */}
            {isChatOpen && (
                <div style={{
                    position: "absolute",
                    bottom: `${position.marginBottom + btnSize.size + 20}px`,
                    [position.chatButtonPosition === "Left corner" ? "left" : "right"]: `${position.marginRight}px`,
                    width: `${chatWindow.width}px`,
                    maxWidth: "calc(100vw - 40px)",
                    height: `${chatWindow.height}px`,
                    maxHeight: "calc(100vh - 120px)",
                    backgroundColor: chatWindow.backgroundColor || "#ffffff", // Uses Background color from ChatWindow settings
                    borderRadius: `${chatWindow.borderRadius}px`,
                    boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: position.zIndex,
                    fontFamily: getFontFamily(chatWindow.fontFamily),
                    overflow: "hidden",
                    ...(isClosing ? getCloseAnimationStyle() : {})
                }}>

                    {/* 1. Header */}
                    <div style={headerStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {topNav.avatar && (
                                <img
                                    src={topNav.avatar}
                                    alt="Bot"
                                    style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }}
                                />
                            )}
                            <div style={{ lineHeight: '1.2' }}>
                                <div style={{ fontWeight: topNav.headerFontWeight || "600", fontSize: `${topNav.headerFontSize || 15}px` }}>{topNav.botName}</div>
                                {topNav.showOnlineStatus && (
                                    <div style={{ fontSize: "11px", opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ width: 6, height: 6, background: '#44b700', borderRadius: '50%', boxShadow: "0 0 4px #44b700" }}></span>
                                        {topNav.onlineStatusType === "Custom" ? topNav.customOnlineText : topNav.onlineStatusType}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', padding: '4px' }}
                                onClick={handleClose}
                                title="Minimize"
                                aria-label="Minimize chat"
                            >
                                <IconMinus size={18} color={chatWindow.textColor || "#fff"} />
                            </button>
                            <button
                                type="button"
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', padding: '4px' }}
                                onClick={handleClose}
                                title="Close"
                                aria-label="Close chat"
                            >
                                <IconX size={18} color={chatWindow.textColor || "#fff"} />
                            </button>
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
                                <span style={{ fontSize: '10px', color: '#999', marginRight: 5, }}>10:31 AM</span>
                            )}
                        </div>

                        {/* Typing Indicator */}
                        {messageBox.typingIndicator !== "None" && (
                            <div style={{ ...botMessageStyle, width: 'fit-content', marginTop: 10, padding: '8px 16px' }}>
                                {messageBox.typingIndicator === "Dots (animated)" ? "•••" : "AI is typing..."}
                            </div>
                        )}

                        {/* Quick Questions (Chips) */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: `${welcome.quickQuestionGap}px`, justifyContent: 'flex-end', paddingTop: '10px' }}>
                            {welcome.quickQuestions.map((q, i) => (
                                <button key={i} style={{
                                    background: "rgba(0,0,0,0.03)", // Subtle background
                                    border: `1px solid ${primaryThemeColor}`, // Border matches theme
                                    color: primaryThemeColor, // Text matches theme
                                    padding: `${welcome.quickQuestionPadding}px ${welcome.quickQuestionPadding * 1.5}px`,
                                    borderRadius: `${welcome.quickQuestionBorderRadius}px`,
                                    fontSize: `${welcome.quickQuestionFontSize}px`,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    fontFamily: getFontFamily(chatWindow.fontFamily)
                                }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Footer Input */}
                    <div className="chat-preview-footer" style={{
                        padding: `${footer.inputPaddingVertical}px ${footer.inputPaddingHorizontal}px`,
                        borderTop: `1px solid ${footer.borderTopColor}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: footer.backgroundColor,
                        borderBottomLeftRadius: `${footer.borderRadiusBottom}px`,
                        borderBottomRightRadius: `${footer.borderRadiusBottom}px`
                    }}>
                        <style>{`
                        .chat-preview-footer input::placeholder { color: ${footer.placeholderColor}; }
                    `}</style>
                        <input
                            type="text"
                            placeholder={welcome.inputPlaceholder}
                            readOnly
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                background: "transparent",
                                fontSize: `${footer.inputFontSize}px`,
                                fontFamily: getFontFamily(chatWindow.fontFamily),
                                color: footer.inputTextColor
                            }}
                        />

                        <button
                            type="button"
                            style={{
                                cursor: "pointer",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: footer.sendButtonBackgroundColor === "transparent" ? "transparent" : footer.sendButtonBackgroundColor,
                                border: "none",
                                borderRadius: `${footer.sendButtonBorderRadius}px`,
                                width: `${footer.sendButtonSize}px`,
                                height: `${footer.sendButtonSize}px`,
                                padding: 0,
                                opacity: footer.sendButtonHoverOpacity,
                                transition: "opacity 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = footer.sendButtonHoverOpacity.toString();
                            }}
                        >
                            {getSendIcon()}
                        </button>
                    </div>
                </div>
            )}


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
                    transition: `all ${btnAnim.transitionDuration || 300}ms ease-in-out`,
                    animation: getButtonAnimation()
                }}>
                    {getLauncherIcon()}
                </button>

                <style>{`
                    @keyframes breathing {
                        0% { box-shadow: 0 0 0 0 rgba(215, 53, 53, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(215, 53, 53, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(215, 53, 53, 0); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes glow {
                        0%, 100% { opacity: 1; box-shadow: 0 4px 15px rgba(0,0,0,0.25); }
                        50% { opacity: 0.8; box-shadow: 0 4px 25px rgba(215, 53, 53, 0.6); }
                    }
                    @keyframes flash {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>

        </div>
    );
}