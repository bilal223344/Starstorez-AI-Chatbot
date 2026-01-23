import { MasterState } from "app/routes/app.customization";

interface PresetTemplatesProps {
    onApplyPreset: (preset: MasterState) => void;
}

export default function PresetTemplates({ onApplyPreset }: PresetTemplatesProps) {
    // Preset 1: Modern Minimal
    const modernMinimal: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#2563EB",
            gradientStart: "#1CB5E0",
            gradientEnd: "#000851",
            secondaryColor: "#E5E7EB",
            backgroundColor: "#FFFFFF",
            textColor: "#FFFFFF",
            secondaryTextColor: "#1F2937",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "400",
            width: 380,
            height: 500,
            borderRadius: 16
        },
        messageBox: {
            borderRadiusTop: 16,
            borderRadiusRight: 16,
            borderRadiusBottom: 4,
            borderRadiusLeft: 16,
            messageSpacing: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "👋 Hi! How can I help you today?",
            quickQuestions: [
                "What are your best sellers?",
                "Where is my order?",
                "Can you help me find something?"
            ],
            inputPlaceholder: "Type your message...",
            sendOnEnter: false,
            quickQuestionPadding: 8,
            quickQuestionBorderRadius: 20,
            quickQuestionFontSize: 12,
            quickQuestionGap: 8
        },
        topNav: {
            avatar: "",
            botName: "Support Assistant",
            headerHeight: 64,
            headerContent: "Support",
            headerFontSize: 16,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Online",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 30,
            marginBottom: 30,
            zIndex: 2147483647
        },
        btnSize: {
            size: 56,
            launcherIconName: "message-circle",
            launcherIconSize: 26
        },
        btnAnim: {
            animationType: "Pulse",
            transitionDuration: 400
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 250
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#1F2937",
            placeholderColor: "#9CA3AF",
            inputFontSize: 14,
            inputPaddingVertical: 12,
            inputPaddingHorizontal: 16,
            borderTopColor: "#E5E7EB",
            borderRadiusBottom: 16,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 32,
            sendButtonBorderRadius: 8,
            sendButtonIconColor: "#2563EB",
            sendButtonHoverOpacity: 0.8,
            sendIconName: "send",
            sendIconSize: 18
        },
        productSlider: {
            enabled: true,
            cardWidth: 160,
            cardHeight: 240,
            cardPadding: 12,
            cardBorderRadius: 12,
            cardGap: 12,
            imageHeight: 120,
            imageBorderRadius: 8,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 28,
            askButtonIconColor: "#2563EB",
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E7EB",
            borderWidth: 1
        }
    };

    // Preset 2: Vibrant Gradient
    const vibrantGradient: MasterState = {
        chatWindow: {
            colorMode: "gradient",
            primaryColor: "#D73535",
            gradientStart: "#FF6B6B",
            gradientEnd: "#4ECDC4",
            secondaryColor: "#FFE66D",
            backgroundColor: "#F7F7F7",
            textColor: "#FFFFFF",
            secondaryTextColor: "#2C3E50",
            fontFamily: "Poppins",
            fontSize: 15,
            fontWeight: "400",
            width: 360,
            height: 480,
            borderRadius: 20
        },
        messageBox: {
            borderRadiusTop: 20,
            borderRadiusRight: 20,
            borderRadiusBottom: 6,
            borderRadiusLeft: 20,
            messageSpacing: 14,
            paddingVertical: 14,
            paddingHorizontal: 18,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "🎨 Welcome! Let's chat!",
            quickQuestions: [
                "Show me products",
                "Track my order",
                "Need help?"
            ],
            inputPlaceholder: "Say something...",
            sendOnEnter: false,
            quickQuestionPadding: 10,
            quickQuestionBorderRadius: 24,
            quickQuestionFontSize: 13,
            quickQuestionGap: 10
        },
        topNav: {
            avatar: "",
            botName: "Chat Bot",
            headerHeight: 70,
            headerContent: "Chat",
            headerFontSize: 18,
            headerFontWeight: "700",
            showOnlineStatus: true,
            onlineStatusType: "Active",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 25,
            marginBottom: 25,
            zIndex: 2147483647
        },
        btnSize: {
            size: 64,
            launcherIconName: "mood-smile",
            launcherIconSize: 30
        },
        btnAnim: {
            animationType: "Bounce",
            transitionDuration: 500
        },
        closeButtonAnim: {
            animationType: "Scale Down",
            transitionDuration: 300
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#2C3E50",
            placeholderColor: "#95A5A6",
            inputFontSize: 15,
            inputPaddingVertical: 14,
            inputPaddingHorizontal: 18,
            borderTopColor: "#ECF0F1",
            borderRadiusBottom: 20,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 36,
            sendButtonBorderRadius: 10,
            sendButtonIconColor: "#FF6B6B",
            sendButtonHoverOpacity: 0.9,
            sendIconName: "arrow-right",
            sendIconSize: 20
        },
        productSlider: {
            enabled: true,
            cardWidth: 170,
            cardHeight: 250,
            cardPadding: 14,
            cardBorderRadius: 16,
            cardGap: 14,
            imageHeight: 130,
            imageBorderRadius: 10,
            titleFontSize: 15,
            priceFontSize: 15,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 30,
            askButtonIconColor: "#FF6B6B",
            backgroundColor: "#FFFFFF",
            borderColor: "#ECF0F1",
            borderWidth: 1
        }
    };

    // Preset 3: Professional Dark
    const professionalDark: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#1A1A1A",
            gradientStart: "#1CB5E0",
            gradientEnd: "#000851",
            secondaryColor: "#2D2D2D",
            backgroundColor: "#0F0F0F",
            textColor: "#FFFFFF",
            secondaryTextColor: "#E0E0E0",
            fontFamily: "Roboto",
            fontSize: 14,
            fontWeight: "400",
            width: 400,
            height: 550,
            borderRadius: 12
        },
        messageBox: {
            borderRadiusTop: 12,
            borderRadiusRight: 12,
            borderRadiusBottom: 12,
            borderRadiusLeft: 12,
            messageSpacing: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: true
        },
        welcome: {
            greeting: "Hello! How may I assist you?",
            quickQuestions: [
                "View products",
                "Order status",
                "Contact support"
            ],
            inputPlaceholder: "Type your message here...",
            sendOnEnter: false,
            quickQuestionPadding: 8,
            quickQuestionBorderRadius: 16,
            quickQuestionFontSize: 12,
            quickQuestionGap: 8
        },
        topNav: {
            avatar: "",
            botName: "Customer Support",
            headerHeight: 60,
            headerContent: "Support",
            headerFontSize: 15,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Available",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 30,
            marginBottom: 30,
            zIndex: 2147483647
        },
        btnSize: {
            size: 60,
            launcherIconName: "headset",
            launcherIconSize: 28
        },
        btnAnim: {
            animationType: "Glow",
            transitionDuration: 600
        },
        closeButtonAnim: {
            animationType: "Slide Down",
            transitionDuration: 350
        },
        footer: {
            backgroundColor: "#1A1A1A",
            inputTextColor: "#FFFFFF",
            placeholderColor: "#666666",
            inputFontSize: 14,
            inputPaddingVertical: 12,
            inputPaddingHorizontal: 16,
            borderTopColor: "#333333",
            borderRadiusBottom: 12,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 32,
            sendButtonBorderRadius: 8,
            sendButtonIconColor: "#FFFFFF",
            sendButtonHoverOpacity: 0.8,
            sendIconName: "send",
            sendIconSize: 16
        },
        productSlider: {
            enabled: true,
            cardWidth: 165,
            cardHeight: 245,
            cardPadding: 12,
            cardBorderRadius: 12,
            cardGap: 12,
            imageHeight: 125,
            imageBorderRadius: 8,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 28,
            askButtonIconColor: "#FFFFFF",
            backgroundColor: "#1A1A1A",
            borderColor: "#333333",
            borderWidth: 1
        }
    };

    // Preset 4: Playful Colorful
    const playfulColorful: MasterState = {
        chatWindow: {
            colorMode: "gradient",
            primaryColor: "#FF6B9D",
            gradientStart: "#C44569",
            gradientEnd: "#F8B500",
            secondaryColor: "#A8E6CF",
            backgroundColor: "#FFF9E6",
            textColor: "#FFFFFF",
            secondaryTextColor: "#2D3436",
            fontFamily: "Nunito",
            fontSize: 16,
            fontWeight: "400",
            width: 370,
            height: 520,
            borderRadius: 24
        },
        messageBox: {
            borderRadiusTop: 24,
            borderRadiusRight: 24,
            borderRadiusBottom: 8,
            borderRadiusLeft: 24,
            messageSpacing: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "🌈 Hey there! Ready to explore?",
            quickQuestions: [
                "What's new?",
                "Best deals",
                "Help me shop"
            ],
            inputPlaceholder: "Ask me anything...",
            sendOnEnter: false,
            quickQuestionPadding: 12,
            quickQuestionBorderRadius: 28,
            quickQuestionFontSize: 14,
            quickQuestionGap: 12
        },
        topNav: {
            avatar: "",
            botName: "Shopping Buddy",
            headerHeight: 72,
            headerContent: "Shop",
            headerFontSize: 20,
            headerFontWeight: "700",
            showOnlineStatus: true,
            onlineStatusType: "Online",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 20,
            marginBottom: 20,
            zIndex: 2147483647
        },
        btnSize: {
            size: 68,
            launcherIconName: "bulb",
            launcherIconSize: 32
        },
        btnAnim: {
            animationType: "Rotate",
            transitionDuration: 800
        },
        closeButtonAnim: {
            animationType: "Rotate Out",
            transitionDuration: 400
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#2D3436",
            placeholderColor: "#B2BEC3",
            inputFontSize: 16,
            inputPaddingVertical: 16,
            inputPaddingHorizontal: 20,
            borderTopColor: "#DFE6E9",
            borderRadiusBottom: 24,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 40,
            sendButtonBorderRadius: 12,
            sendButtonIconColor: "#C44569",
            sendButtonHoverOpacity: 0.9,
            sendIconName: "plane",
            sendIconSize: 22
        },
        productSlider: {
            enabled: true,
            cardWidth: 175,
            cardHeight: 260,
            cardPadding: 16,
            cardBorderRadius: 20,
            cardGap: 16,
            imageHeight: 140,
            imageBorderRadius: 12,
            titleFontSize: 15,
            priceFontSize: 16,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 32,
            askButtonIconColor: "#C44569",
            backgroundColor: "#FFFFFF",
            borderColor: "#DFE6E9",
            borderWidth: 1
        }
    };

    // Preset 5: Elegant Classic
    const elegantClassic: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#2C3E50",
            gradientStart: "#1CB5E0",
            gradientEnd: "#000851",
            secondaryColor: "#ECF0F1",
            backgroundColor: "#FFFFFF",
            textColor: "#FFFFFF",
            secondaryTextColor: "#34495E",
            fontFamily: "Merriweather",
            fontSize: 15,
            fontWeight: "400",
            width: 390,
            height: 530,
            borderRadius: 8
        },
        messageBox: {
            borderRadiusTop: 8,
            borderRadiusRight: 8,
            borderRadiusBottom: 8,
            borderRadiusLeft: 8,
            messageSpacing: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: true
        },
        welcome: {
            greeting: "Good day! How may I be of service?",
            quickQuestions: [
                "Browse catalog",
                "Order inquiry",
                "General question"
            ],
            inputPlaceholder: "Enter your message...",
            sendOnEnter: false,
            quickQuestionPadding: 8,
            quickQuestionBorderRadius: 18,
            quickQuestionFontSize: 12,
            quickQuestionGap: 8
        },
        topNav: {
            avatar: "",
            botName: "Service Desk",
            headerHeight: 58,
            headerContent: "Service",
            headerFontSize: 14,
            headerFontWeight: "600",
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
            size: 52,
            launcherIconName: "help",
            launcherIconSize: 24
        },
        btnAnim: {
            animationType: "Static",
            transitionDuration: 300
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 200
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#34495E",
            placeholderColor: "#95A5A6",
            inputFontSize: 14,
            inputPaddingVertical: 10,
            inputPaddingHorizontal: 14,
            borderTopColor: "#BDC3C7",
            borderRadiusBottom: 8,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 30,
            sendButtonBorderRadius: 6,
            sendButtonIconColor: "#2C3E50",
            sendButtonHoverOpacity: 0.85,
            sendIconName: "send",
            sendIconSize: 16
        },
        productSlider: {
            enabled: true,
            cardWidth: 155,
            cardHeight: 235,
            cardPadding: 10,
            cardBorderRadius: 10,
            cardGap: 10,
            imageHeight: 115,
            imageBorderRadius: 6,
            titleFontSize: 13,
            priceFontSize: 13,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 26,
            askButtonIconColor: "#2C3E50",
            backgroundColor: "#FFFFFF",
            borderColor: "#BDC3C7",
            borderWidth: 1
        }
    };

    const presets = [
        { name: "Modern Minimal", description: "Clean and simple design", data: modernMinimal, color: "#2563EB" },
        { name: "Vibrant Gradient", description: "Colorful and energetic", data: vibrantGradient, color: "#FF6B6B" },
        { name: "Professional Dark", description: "Sleek dark theme", data: professionalDark, color: "#1A1A1A" },
        { name: "Playful Colorful", description: "Fun and vibrant", data: playfulColorful, color: "#C44569" },
        { name: "Elegant Classic", description: "Timeless and refined", data: elegantClassic, color: "#2C3E50" }
    ];

    return (
        <s-section padding="base">
            <s-box border="base base solid" borderRadius="base" padding="base" background="subdued">
                <s-stack direction="block" gap="base">
                    <s-heading><span style={{ fontSize: "1.2em", fontWeight: 600 }}>Design Presets</span></s-heading>
                    <s-paragraph>Choose a preset design to get started, then customize it to your liking.</s-paragraph>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                        {presets.map((preset, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onApplyPreset(preset.data)}
                                style={{
                                    minWidth: "180px",
                                    padding: "16px 20px",
                                    border: "2px solid #dee3ed",
                                    borderRadius: "12px",
                                    background: "white",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    transform: "translateY(0)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = preset.color;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${preset.color}40`;
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#dee3ed";
                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                                    <div
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            background: preset.color,
                                            flexShrink: 0
                                        }}
                                    />
                                    <span style={{ fontWeight: 600, fontSize: "15px", color: "#1F2937" }}>
                                        {preset.name}
                                    </span>
                                </div>
                                <span style={{ fontSize: "13px", color: "#6B7280", textAlign: "left" }}>
                                    {preset.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </s-stack>
            </s-box>
        </s-section>
    );
}
