import { useState } from "react";
import { WidgetSettings } from "app/types";
import {
    Send,
    X,
    MessageCircle,
    MessageSquare,
    MessageSquareDot,
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

    const getActiveAvatar = () => {
        // Mock avatar mapping
        return {
            icon: <Headset size={20} />,
            gradient: "linear-gradient(135deg, #3b82f6, #2563eb)"
        };
    };

    const renderLauncherIcon = (iconId: string, size: number) => {
        const iconMap: Record<string, LucideIcon> = {
            "message-circle": MessageCircle,
            "message-square": MessageSquare,
            "message-square-dot": MessageSquareDot,
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
                flex: 1,
                backgroundColor: "rgba(241, 245, 249, 0.5)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                minHeight: "900px",
                width: "100%",
                borderRadius: "12px"
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
                            alignItems: launcher.position === 'left' ? 'flex-start' : 'flex-end'
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
                                    width: isMobilePreview ? "340px" : `${windowSettings.width}px`,
                                    height: isMobilePreview ? "550px" : `${windowSettings.height}px`,
                                    borderRadius: `${windowSettings.cornerRadius}px`,
                                    backgroundColor: branding.backgroundColor,
                                    fontFamily: branding.fontFamily,
                                    transition: "all 0.3s ease-out"
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
                                        backgroundColor: branding.primaryColor,
                                        color: "#FFF",
                                        height: "70px" // Using a standard header height
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
                                            color: "white",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                                            background: getActiveAvatar().gradient
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
                                <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "rgba(241, 245, 249, 0.5)", display: "flex", flexDirection: "column", gap: `${windowSettings.messageVerticalPadding}px` }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "rgba(241, 245, 249, 0.8)", padding: "4px 12px", borderRadius: "9999px", backdropFilter: "blur(4px)" }}>Today</span>
                                    </div>

                                    {/* AI Message */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: getActiveAvatar().gradient, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", alignSelf: "flex-end", marginBottom: "4px" }}>
                                            {getActiveAvatar().icon}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "85%" }}>
                                            <div style={{
                                                fontSize: `${branding.fontSize}px`,
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                lineHeight: 1.5,
                                                backgroundColor: "#f1f5f9",
                                                color: "#0f172a",
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
                                            <div style={{ display: "flex", overflowX: "auto", paddingBottom: "16px", marginLeft: "-8px", paddingLeft: "8px", maxWidth: "100%", gap: "12px" }}>
                                                {[{ name: "Abstract Art Print", price: "$45.00", img: "https://images.unsplash.com/photo-1579783902614-a3fb392796a5?auto=format&fit=crop&w=300&q=80" }, { name: "Ceramic Vase", price: "$28.50", img: "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=300&q=80" }].map((item, idx) => (
                                                    <div key={idx} style={{
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                        transition: "all 0.2s",
                                                        backgroundColor: addOns.productSlider.cardBackground,
                                                        overflow: "hidden",
                                                        cursor: "pointer",
                                                        width: `${addOns.productSlider.cardWidth}px`,
                                                        height: `${addOns.productSlider.cardHeight}px`,
                                                        padding: "12px",
                                                        borderRadius: "12px",
                                                        border: "1px solid #e2e8f0"
                                                    }}>
                                                        <div style={{ width: "100%", backgroundColor: "#f1f5f9", overflow: "hidden", marginBottom: "12px", flexShrink: 0, position: "relative", height: "100px", borderRadius: "8px" }}>
                                                            <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        </div>
                                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                                                            <h4 style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</h4>
                                                            <div style={{ color: "#64748b", marginTop: "2px", fontSize: "12px" }}>{item.price}</div>
                                                            <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                                                                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid transparent", backgroundColor: "transparent", color: branding.primaryColor, cursor: "pointer", width: "32px", height: "32px" }}>
                                                                    <MessageCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div style={{ paddingLeft: "44px", overflowX: "auto", display: "flex", paddingBottom: "8px", gap: "8px" }}>
                                        {content.quickActions.map(action => (
                                            <button key={action} style={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                transition: "all 0.2s",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                color: "#475569",
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
                                                color: "#0f172a",
                                                fontSize: "14px",
                                                padding: "12px 16px",
                                                paddingRight: "48px",
                                                border: "none",
                                                outline: "none"
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
                                                backgroundColor: branding.primaryColor,
                                                color: "#fff",
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
                                width: `${launcher.iconSize}px`,
                                height: `${launcher.iconSize}px`,
                                borderRadius: "50%",
                                backgroundColor: branding.primaryColor,
                                color: "#FFF",
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
