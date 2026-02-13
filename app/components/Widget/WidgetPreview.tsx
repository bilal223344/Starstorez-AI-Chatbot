import { useState } from "react";
import { WidgetSettings } from "app/types";
import {
    Send,
    X,
    MessageCircle,
    MessageSquare,
    MessageSquareDot,
    BotMessageSquare,
    MessageCirclePlus,
    MessageSquareMore,
    MessageSquareQuote,
    MessageSquareText,
    MessagesSquare,
    Headset,
    Lightbulb,
    HelpCircle,
    Smile,
    Phone,
    LucideIcon,
    Monitor,
    Smartphone,
    RefreshCcw,
    ChevronDown,
    Ban
} from "lucide-react";

interface WidgetPreviewProps {
    settings: WidgetSettings;
}

export default function WidgetPreview({ settings }: WidgetPreviewProps) {
    const { branding, window: windowSettings, launcher, content, addOns } = settings;
    const [isMobilePreview, setIsMobilePreview] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [resetKey, setResetKey] = useState(0);

    // Helper function to get font family with fallbacks
    const getFontFamily = (fontName: string): string => {
        if (!fontName) return "Inter, sans-serif";
        if (fontName.includes(' ')) {
            return `"${fontName}", sans-serif`;
        }
        return `${fontName}, sans-serif`;
    };

    // --- THEME ENGINE ---
    const primaryThemeBackground = branding.colorMode === 'gradient'
        ? `linear-gradient(135deg, ${branding.gradientStart}, ${branding.gradientEnd})`
        : branding.primaryColor;

    const primaryThemeColor = branding.colorMode === 'gradient'
        ? branding.gradientStart || branding.primaryColor
        : branding.primaryColor;

    const getActiveAvatar = () => {
        // Mock avatar mapping
        return {
            icon: <Headset size={20} />,
            gradient: primaryThemeBackground
        };
    };

    const renderLauncherIcon = (iconId: string, size: number) => {
        const iconMap: Record<string, LucideIcon> = {
            "message-circle": MessageCircle,
            "message-square": MessageSquare,
            "message-square-dot": MessageSquareDot,
            "bot-message-square": BotMessageSquare,
            "message-circle-plus": MessageCirclePlus,
            "message-square-more": MessageSquareMore,
            "message-square-quote": MessageSquareQuote,
            "message-square-text": MessageSquareText,
            "messages-square": MessagesSquare,
            "headset": Headset,
            "lightbulb": Lightbulb,
            "help-circle": HelpCircle,
            "smile": Smile,
            "phone": Phone
        };
        const Icon = iconMap[iconId] || MessageCircle;
        return <Icon size={size} />;
    };

    return (
        <div
            style={{
                backgroundColor: "rgba(241, 245, 249, 0.5)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                height: "100%",
                width: "100%",
                borderRadius: "12px",
                minHeight: "600px", // Reduced min height to prevent overflow on smaller screens
            }}
        >
            {/* Background Grid */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.1, // Reduced for subtle effect
                    pointerEvents: "none",
                    backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                }}
            ></div>

            {/* Device Controls */}
            <div
                style={{
                    position: "absolute",
                    top: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    zIndex: 20
                }}
            >
                <div style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", padding: "4px", display: "flex" }}>
                    <button
                        onClick={() => setIsMobilePreview(false)}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            transition: "all 0.2s",
                            backgroundColor: !isMobilePreview ? "#f1f5f9" : "transparent",
                            color: !isMobilePreview ? "#0f172a" : "#94a3b8",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        <Monitor size={18} />
                    </button>
                    <button
                        onClick={() => setIsMobilePreview(true)}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            transition: "all 0.2s",
                            backgroundColor: isMobilePreview ? "#f1f5f9" : "transparent",
                            color: isMobilePreview ? "#0f172a" : "#94a3b8",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        <Smartphone size={18} />
                    </button>
                </div>
                <button
                    onClick={() => { setResetKey(k => k + 1); setIsPreviewOpen(true); }}
                    style={{
                        padding: "10px",
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#64748b",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    title="Restart Preview"
                >
                    <RefreshCcw size={16} />
                </button>
            </div>

            {/* Preview Container */}
            <div
                key={resetKey}
                style={{
                    position: "relative",
                    transition: "all 0.5s ease-in-out",
                    overflow: "hidden",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    ...(isMobilePreview ? {
                        width: "375px",
                        height: "720px",
                        borderRadius: "3rem",
                        border: "8px solid #1e293b",
                        backgroundColor: "#fff"
                    } : {
                        width: "100%",
                        height: "100%",
                        maxWidth: "1024px",
                        maxHeight: "990px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fff",
                        margin: "48px"
                    })
                }}
            >
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.3);
                    }
                    /* Firefox */
                    .custom-scrollbar::-webkit-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    }

                    /* Launcher Animations */
                    @keyframes anim-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                    @keyframes anim-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                    @keyframes anim-shake { 0% { transform: rotate(0deg); } 25% { transform: rotate(-3deg); } 75% { transform: rotate(3deg); } 100% { transform: rotate(0deg); } }
                    @keyframes anim-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes anim-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } 50% { box-shadow: 0 0 10px 2px rgba(99, 102, 241, 0.3); } }

                    /* Window Transitions */
                    @keyframes window-fade-in { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes window-slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes window-scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                    @keyframes window-rotate-in { from { opacity: 0; transform: rotate(-5deg) scale(0.9); } to { opacity: 1; transform: rotate(0) scale(1); } }
                `}</style>

                {/* Mock Website Content */}
                <div style={{ width: "100%", height: "100%", backgroundColor: "#fff", display: "flex", flexDirection: "column", pointerEvents: "none", userSelect: "none", opacity: 0.4, filter: "grayscale(100%)" }}>
                    <div style={{ height: "64px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between", backgroundColor: "#fff" }}>
                        <div style={{ width: "96px", height: "20px", backgroundColor: "#e2e8f0", borderRadius: "6px" }}></div>
                        <div style={{ display: "flex", gap: "24px" }}>
                            <div style={{ width: "64px", height: "16px", backgroundColor: "#f1f5f9", borderRadius: "6px" }}></div>
                            <div style={{ width: "64px", height: "16px", backgroundColor: "#f1f5f9", borderRadius: "6px" }}></div>
                            <div style={{ width: "64px", height: "16px", backgroundColor: "#f1f5f9", borderRadius: "6px" }}></div>
                        </div>
                    </div>
                    <div style={{ padding: "40px", flex: 1, backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "40px" }}>
                        <div style={{ width: "100%", height: "320px", backgroundColor: "#e2e8f0", borderRadius: "16px" }}></div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                            <div style={{ height: "160px", backgroundColor: "#e2e8f0", borderRadius: "12px" }}></div>
                            <div style={{ height: "160px", backgroundColor: "#e2e8f0", borderRadius: "12px" }}></div>
                            <div style={{ height: "160px", backgroundColor: "#e2e8f0", borderRadius: "12px" }}></div>
                        </div>
                    </div>
                </div>

                {/* LIVE WIDGET */}
                {((launcher.position === 'right' || launcher.position === 'left')) ? (
                    <div
                        style={{
                            position: "absolute",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            pointerEvents: "auto",
                            zIndex: 50,
                            bottom: `${launcher.marginV}px`,
                            [launcher.position]: `${launcher.marginH}px`,
                            alignItems: launcher.position === 'left' ? 'flex-start' : 'flex-end',
                            maxWidth: `calc(100% - ${launcher.marginH * 2}px)`,
                            maxHeight: `calc(100% - ${launcher.marginV * 2}px)`
                        }}
                    >
                        {/* Chat Window */}
                        {isPreviewOpen && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    overflow: "hidden",
                                    width: isMobilePreview ? "100%" : `${windowSettings.width}px`,
                                    height: isMobilePreview ? "100%" : `${windowSettings.height}px`,
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    borderRadius: `${windowSettings.cornerRadius}px`,
                                    backgroundColor: branding.backgroundColor,
                                    fontFamily: getFontFamily(branding.fontFamily),
                                    transition: "all 0.3s ease-out",
                                    animation: launcher.windowTransition.type === 'instant'
                                        ? 'none'
                                        : `window-${launcher.windowTransition.type}-in ${launcher.windowTransition.duration}s ease-out forwards`
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        padding: "0 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        position: "relative",
                                        flexShrink: 0,
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                        zIndex: 10,
                                        background: primaryThemeBackground,
                                        color: branding.textColor || "#FFF",
                                        height: "70px",
                                        fontFamily: getFontFamily(branding.fontFamily),
                                    }}
                                >
                                    <div style={{ position: "relative" }}>
                                        <div style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: branding.textColor || "white",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                                            background: "rgba(255, 255, 255, 0.2)",
                                            border: "2px solid rgba(255, 255, 255, 0.2)"
                                        }}>
                                            {getActiveAvatar().icon}
                                        </div>
                                        <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", backgroundColor: "#4ade80", border: "2px solid transparent", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}></span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ lineHeight: 1.25, fontSize: "16px", fontWeight: 700, margin: 0 }}>
                                            {windowSettings.title}
                                        </h3>
                                        <p style={{ fontSize: "12px", opacity: 0.9, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", margin: 0 }}>
                                            {windowSettings.subtitle || 'Online'}
                                        </p>
                                    </div>
                                    <button onClick={() => setIsPreviewOpen(false)} style={{ opacity: 0.7, padding: "8px", background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Messages Body */}
                                <div className="custom-scrollbar" style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "rgba(241, 245, 249, 0.5)", display: "flex", flexDirection: "column", gap: `${windowSettings.messageVerticalPadding}px` }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "rgba(241, 245, 249, 0.8)", padding: "4px 12px", borderRadius: "9999px", backdropFilter: "blur(4px)" }}>Today</span>
                                    </div>

                                    {/* AI Message */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: primaryThemeBackground, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", alignSelf: "flex-end", marginBottom: "4px", color: branding.textColor || "white" }}>
                                            {getActiveAvatar().icon}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "85%" }}>
                                            <div style={{
                                                fontSize: `${branding.fontSize}px`,
                                                fontWeight: branding.fontWeight || "400",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                lineHeight: 1.5,
                                                background: primaryThemeBackground,
                                                color: branding.textColor || "#ffffff",
                                                borderRadius: `${windowSettings.messageBorderRadius.tl}px ${windowSettings.messageBorderRadius.tr}px ${windowSettings.messageBorderRadius.br}px ${windowSettings.messageBorderRadius.bl}px`,
                                                padding: "12px 16px"
                                            }}>
                                                {content.welcomeMessage}
                                            </div>
                                            <div style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "4px" }}>10:42 AM</div>
                                        </div>
                                    </div>

                                    {/* Product Slider */}
                                    {addOns.productSlider.enabled && (
                                        <div style={{ display: "flex", gap: "12px", paddingLeft: "44px" }}>
                                            <div className="custom-scrollbar" style={{ display: "flex", overflowX: "auto", paddingBottom: "16px", marginLeft: "-8px", paddingLeft: "8px", maxWidth: "100%", gap: "12px" }}>
                                                {[
                                                    { name: "Abstract Art Print", price: "$45.00", img: "https://images.unsplash.com/photo-1579783902614-a3fb392796a5?auto=format&fit=crop&w=300&q=80", stock: 10, handle: "abstract-art-print" },
                                                    { name: "Ceramic Vase", price: "$28.50", img: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=300&q=80", stock: 0, handle: "ceramic-vase" }
                                                ].map((item, idx) => (
                                                    <div key={idx} style={{
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "space-between",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                        transition: "all 0.2s",
                                                        backgroundColor: addOns.productSlider.cardBackground,
                                                        overflow: "hidden",
                                                        width: `${addOns.productSlider.cardWidth}px`,
                                                        height: "auto", // Allow height to grow
                                                        minHeight: `${addOns.productSlider.cardHeight}px`,
                                                        padding: "8px",
                                                        borderRadius: "8px",
                                                        border: "1px solid #e1e3e5"
                                                    }}>
                                                        <div>
                                                            <div style={{ width: "100%", height: "100px", overflow: "hidden", borderRadius: "6px", marginBottom: "8px" }}>
                                                                <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            </div>
                                                            <div style={{ padding: "4px 0" }}>
                                                                <h4 style={{ margin: "0 0 4px", fontWeight: "600", color: "#202223", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "13px" }} title={item.name}>{item.name}</h4>
                                                                <p style={{ margin: 0, color: primaryThemeColor, fontWeight: "bold", fontSize: "13px" }}>
                                                                    {item.price}
                                                                    {item.stock <= 0 && <span style={{ color: "#d82c0d", fontSize: "11px", fontWeight: "600", marginLeft: "6px" }}>Sold Out</span>}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                                            <button
                                                                style={{
                                                                    display: "block",
                                                                    background: "#f1f2f3",
                                                                    textAlign: "center",
                                                                    textDecoration: "none",
                                                                    color: "#202223",
                                                                    padding: "6px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "500",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    width: "100%",
                                                                    fontFamily: "inherit"
                                                                }}
                                                            >
                                                                View Details
                                                            </button>
                                                            <button
                                                                style={{
                                                                    background: "none",
                                                                    border: `1px solid ${primaryThemeColor}`,
                                                                    color: primaryThemeColor,
                                                                    padding: "4px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "11px",
                                                                    cursor: "pointer",
                                                                    fontWeight: "500",
                                                                    width: "100%"
                                                                }}
                                                            >
                                                                Ask AI
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* User Message (Mock) */}
                                    <div style={{ display: "flex", gap: "12px", alignSelf: "flex-end" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "85%", alignItems: "flex-end" }}>
                                            <div style={{
                                                fontSize: `${branding.fontSize}px`,
                                                fontWeight: branding.fontWeight || "400",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                lineHeight: 1.5,
                                                backgroundColor: branding.secondaryColor || "#f1f1f1",
                                                color: branding.secondaryTextColor || "#000000",
                                                borderRadius: `${windowSettings.messageBorderRadius.tl}px ${windowSettings.messageBorderRadius.tr}px ${windowSettings.messageBorderRadius.br}px ${windowSettings.messageBorderRadius.bl}px`,
                                                padding: "12px 16px"
                                            }}>
                                                How can I track my order?
                                            </div>
                                            <div style={{ fontSize: "10px", color: "#94a3b8", marginRight: "4px" }}>10:43 AM</div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div style={{ paddingLeft: "44px", display: "flex", gap: "8px", flexShrink: 0, marginTop: "auto", maxWidth: "100%", flexWrap: "wrap", paddingBottom: "8px" }}>
                                        {content.quickActions.map(action => (
                                            <button key={action} style={{
                                                backgroundColor: "#fff",
                                                border: `1px solid ${primaryThemeColor}`,
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                transition: "all 0.2s",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                color: primaryThemeColor,
                                                padding: "8px 16px",
                                                borderRadius: "12px",
                                                fontSize: "13px",
                                                cursor: "pointer"
                                            }}>
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ position: "relative", padding: "16px", flexShrink: 0, zIndex: 10, backgroundColor: "#fff", borderTop: "1px solid #f1f5f9" }}>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            style={{
                                                width: "100%",
                                                borderRadius: "12px",
                                                transition: "box-shadow 0.2s",
                                                backgroundColor: "#f8fafc",
                                                color: branding.secondaryTextColor || "#0f172a",
                                                fontSize: "14px",
                                                padding: "12px 16px",
                                                paddingRight: "48px",
                                                border: "none",
                                                outline: "none",
                                                fontFamily: getFontFamily(branding.fontFamily)
                                            }}
                                        />
                                        <button
                                            style={{
                                                position: "absolute",
                                                right: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                background: primaryThemeBackground,
                                                color: branding.textColor || "#fff",
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "8px",
                                                border: "none",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                    <div style={{ textAlign: "center", marginTop: "10px", opacity: 0.6 }}>
                                        <span style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                                            Powered by <span style={{ fontWeight: 700, color: "#64748b" }}>StartStorez</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Launcher Button */}
                        <button
                            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                                transition: "all 0.2s",
                                animation: launcher.animation.type === 'static'
                                    ? 'none'
                                    : `anim-${launcher.animation.type} ${launcher.animation.duration}s infinite ease-in-out`,
                                width: `${launcher.iconSize}px`,
                                height: `${launcher.iconSize}px`,
                                borderRadius: "50%",
                                background: primaryThemeBackground,
                                color: branding.textColor || "#FFF",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {isPreviewOpen ? <ChevronDown size={30} strokeWidth={2.5} /> : renderLauncherIcon(launcher.iconId, 24)}
                        </button>
                    </div>
                ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(4px)", zIndex: 30 }}>
                        <div style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", color: "#fff", padding: "8px 16px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Ban size={14} />
                            Hidden on this device
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
