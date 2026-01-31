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

    // Preset 6: Soft Pastel
    const softPastel: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#B8A9E3",
            gradientStart: "#E0C3FC",
            gradientEnd: "#8EC5FC",
            secondaryColor: "#F5E6FF",
            backgroundColor: "#FEFEFE",
            textColor: "#FFFFFF",
            secondaryTextColor: "#5A4A7D",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "400",
            width: 365,
            height: 495,
            borderRadius: 18
        },
        messageBox: {
            borderRadiusTop: 18,
            borderRadiusRight: 18,
            borderRadiusBottom: 4,
            borderRadiusLeft: 18,
            messageSpacing: 11,
            paddingVertical: 13,
            paddingHorizontal: 17,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "✨ Welcome! Let's chat",
            quickQuestions: [
                "Explore products",
                "Track order",
                "Get assistance"
            ],
            inputPlaceholder: "Write a message...",
            sendOnEnter: false,
            quickQuestionPadding: 9,
            quickQuestionBorderRadius: 22,
            quickQuestionFontSize: 13,
            quickQuestionGap: 9
        },
        topNav: {
            avatar: "",
            botName: "Care Assistant",
            headerHeight: 62,
            headerContent: "Assistant",
            headerFontSize: 16,
            headerFontWeight: "500",
            showOnlineStatus: true,
            onlineStatusType: "Online",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 28,
            marginBottom: 28,
            zIndex: 2147483647
        },
        btnSize: {
            size: 58,
            launcherIconName: "message-circle",
            launcherIconSize: 27
        },
        btnAnim: {
            animationType: "Pulse",
            transitionDuration: 450
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 280
        },
        footer: {
            backgroundColor: "#FEFEFE",
            inputTextColor: "#5A4A7D",
            placeholderColor: "#B5A8CC",
            inputFontSize: 14,
            inputPaddingVertical: 13,
            inputPaddingHorizontal: 17,
            borderTopColor: "#F0E8FF",
            borderRadiusBottom: 18,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 34,
            sendButtonBorderRadius: 9,
            sendButtonIconColor: "#B8A9E3",
            sendButtonHoverOpacity: 0.85,
            sendIconName: "send",
            sendIconSize: 19
        },
        productSlider: {
            enabled: true,
            cardWidth: 162,
            cardHeight: 242,
            cardPadding: 13,
            cardBorderRadius: 14,
            cardGap: 13,
            imageHeight: 122,
            imageBorderRadius: 9,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 29,
            askButtonIconColor: "#B8A9E3",
            backgroundColor: "#FEFEFE",
            borderColor: "#F0E8FF",
            borderWidth: 1
        }
    };

    // Preset 7: Ocean Breeze
    const oceanBreeze: MasterState = {
        chatWindow: {
            colorMode: "gradient",
            primaryColor: "#0EA5E9",
            gradientStart: "#06B6D4",
            gradientEnd: "#0284C7",
            secondaryColor: "#E0F2FE",
            backgroundColor: "#F8FAFC",
            textColor: "#FFFFFF",
            secondaryTextColor: "#0F172A",
            fontFamily: "Satoshi",
            fontSize: 14,
            fontWeight: "400",
            width: 375,
            height: 505,
            borderRadius: 20
        },
        messageBox: {
            borderRadiusTop: 20,
            borderRadiusRight: 20,
            borderRadiusBottom: 5,
            borderRadiusLeft: 20,
            messageSpacing: 12,
            paddingVertical: 14,
            paddingHorizontal: 18,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "💬 Hi! Ready to help",
            quickQuestions: [
                "Product info",
                "Shipping details",
                "Support team"
            ],
            inputPlaceholder: "Type here...",
            sendOnEnter: false,
            quickQuestionPadding: 10,
            quickQuestionBorderRadius: 24,
            quickQuestionFontSize: 13,
            quickQuestionGap: 10
        },
        topNav: {
            avatar: "",
            botName: "Support Hub",
            headerHeight: 66,
            headerContent: "Support",
            headerFontSize: 17,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Active",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 26,
            marginBottom: 26,
            zIndex: 2147483647
        },
        btnSize: {
            size: 60,
            launcherIconName: "brand-hipchat",
            launcherIconSize: 28
        },
        btnAnim: {
            animationType: "Bounce",
            transitionDuration: 520
        },
        closeButtonAnim: {
            animationType: "Scale Down",
            transitionDuration: 320
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#0F172A",
            placeholderColor: "#94A3B8",
            inputFontSize: 14,
            inputPaddingVertical: 14,
            inputPaddingHorizontal: 18,
            borderTopColor: "#E2E8F0",
            borderRadiusBottom: 20,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 35,
            sendButtonBorderRadius: 10,
            sendButtonIconColor: "#0EA5E9",
            sendButtonHoverOpacity: 0.88,
            sendIconName: "arrow-up",
            sendIconSize: 20
        },
        productSlider: {
            enabled: true,
            cardWidth: 168,
            cardHeight: 248,
            cardPadding: 14,
            cardBorderRadius: 15,
            cardGap: 14,
            imageHeight: 128,
            imageBorderRadius: 10,
            titleFontSize: 14,
            priceFontSize: 15,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 30,
            askButtonIconColor: "#0EA5E9",
            backgroundColor: "#FFFFFF",
            borderColor: "#E2E8F0",
            borderWidth: 1
        }
    };

    // Preset 8: Midnight Blue
    const midnightBlue: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#1E293B",
            gradientStart: "#334155",
            gradientEnd: "#0F172A",
            secondaryColor: "#334155",
            backgroundColor: "#0F172A",
            textColor: "#F8FAFC",
            secondaryTextColor: "#E2E8F0",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "400",
            width: 385,
            height: 515,
            borderRadius: 16
        },
        messageBox: {
            borderRadiusTop: 16,
            borderRadiusRight: 16,
            borderRadiusBottom: 16,
            borderRadiusLeft: 16,
            messageSpacing: 11,
            paddingVertical: 13,
            paddingHorizontal: 17,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: true
        },
        welcome: {
            greeting: "👤 Hello! How can I help?",
            quickQuestions: [
                "Browse items",
                "Order status",
                "Need help"
            ],
            inputPlaceholder: "Your message...",
            sendOnEnter: false,
            quickQuestionPadding: 9,
            quickQuestionBorderRadius: 20,
            quickQuestionFontSize: 13,
            quickQuestionGap: 9
        },
        topNav: {
            avatar: "",
            botName: "Help Center",
            headerHeight: 64,
            headerContent: "Help",
            headerFontSize: 16,
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
            size: 58,
            launcherIconName: "message-dots",
            launcherIconSize: 27
        },
        btnAnim: {
            animationType: "Glow",
            transitionDuration: 550
        },
        closeButtonAnim: {
            animationType: "Slide Down",
            transitionDuration: 300
        },
        footer: {
            backgroundColor: "#1E293B",
            inputTextColor: "#F8FAFC",
            placeholderColor: "#64748B",
            inputFontSize: 14,
            inputPaddingVertical: 13,
            inputPaddingHorizontal: 17,
            borderTopColor: "#334155",
            borderRadiusBottom: 16,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 33,
            sendButtonBorderRadius: 8,
            sendButtonIconColor: "#F8FAFC",
            sendButtonHoverOpacity: 0.85,
            sendIconName: "send",
            sendIconSize: 18
        },
        productSlider: {
            enabled: true,
            cardWidth: 164,
            cardHeight: 244,
            cardPadding: 13,
            cardBorderRadius: 13,
            cardGap: 13,
            imageHeight: 124,
            imageBorderRadius: 9,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 29,
            askButtonIconColor: "#F8FAFC",
            backgroundColor: "#1E293B",
            borderColor: "#334155",
            borderWidth: 1
        }
    };

    // Preset 9: Mint Fresh
    const mintFresh: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#10B981",
            gradientStart: "#34D399",
            gradientEnd: "#059669",
            secondaryColor: "#D1FAE5",
            backgroundColor: "#FFFFFF",
            textColor: "#FFFFFF",
            secondaryTextColor: "#064E3B",
            fontFamily: "Plus Jakarta Sans",
            fontSize: 14,
            fontWeight: "400",
            width: 370,
            height: 500,
            borderRadius: 18
        },
        messageBox: {
            borderRadiusTop: 18,
            borderRadiusRight: 18,
            borderRadiusBottom: 4,
            borderRadiusLeft: 18,
            messageSpacing: 12,
            paddingVertical: 14,
            paddingHorizontal: 18,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "🌿 Hey! Let's connect",
            quickQuestions: [
                "See products",
                "Track package",
                "Contact us"
            ],
            inputPlaceholder: "Start typing...",
            sendOnEnter: false,
            quickQuestionPadding: 10,
            quickQuestionBorderRadius: 23,
            quickQuestionFontSize: 13,
            quickQuestionGap: 10
        },
        topNav: {
            avatar: "",
            botName: "Chat Helper",
            headerHeight: 65,
            headerContent: "Chat",
            headerFontSize: 17,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Online",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 27,
            marginBottom: 27,
            zIndex: 2147483647
        },
        btnSize: {
            size: 59,
            launcherIconName: "message-2",
            launcherIconSize: 28
        },
        btnAnim: {
            animationType: "Pulse",
            transitionDuration: 480
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 270
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#064E3B",
            placeholderColor: "#6EE7B7",
            inputFontSize: 14,
            inputPaddingVertical: 14,
            inputPaddingHorizontal: 18,
            borderTopColor: "#D1FAE5",
            borderRadiusBottom: 18,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 34,
            sendButtonBorderRadius: 9,
            sendButtonIconColor: "#10B981",
            sendButtonHoverOpacity: 0.87,
            sendIconName: "send",
            sendIconSize: 19
        },
        productSlider: {
            enabled: true,
            cardWidth: 165,
            cardHeight: 245,
            cardPadding: 14,
            cardBorderRadius: 14,
            cardGap: 14,
            imageHeight: 125,
            imageBorderRadius: 9,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 29,
            askButtonIconColor: "#10B981",
            backgroundColor: "#FFFFFF",
            borderColor: "#D1FAE5",
            borderWidth: 1
        }
    };

    // Preset 10: Rose Gold
    const roseGold: MasterState = {
        chatWindow: {
            colorMode: "gradient",
            primaryColor: "#F43F5E",
            gradientStart: "#FB7185",
            gradientEnd: "#E11D48",
            secondaryColor: "#FFE4E6",
            backgroundColor: "#FFF1F2",
            textColor: "#FFFFFF",
            secondaryTextColor: "#881337",
            fontFamily: "DM Sans",
            fontSize: 15,
            fontWeight: "400",
            width: 368,
            height: 498,
            borderRadius: 22
        },
        messageBox: {
            borderRadiusTop: 22,
            borderRadiusRight: 22,
            borderRadiusBottom: 6,
            borderRadiusLeft: 22,
            messageSpacing: 13,
            paddingVertical: 15,
            paddingHorizontal: 19,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: false
        },
        welcome: {
            greeting: "💝 Welcome! Let's talk",
            quickQuestions: [
                "Shop now",
                "My orders",
                "Get help"
            ],
            inputPlaceholder: "Message us...",
            sendOnEnter: false,
            quickQuestionPadding: 11,
            quickQuestionBorderRadius: 26,
            quickQuestionFontSize: 13,
            quickQuestionGap: 11
        },
        topNav: {
            avatar: "",
            botName: "Style Assistant",
            headerHeight: 68,
            headerContent: "Style",
            headerFontSize: 18,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Active",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 24,
            marginBottom: 24,
            zIndex: 2147483647
        },
        btnSize: {
            size: 62,
            launcherIconName: "sparkles",
            launcherIconSize: 29
        },
        btnAnim: {
            animationType: "Bounce",
            transitionDuration: 500
        },
        closeButtonAnim: {
            animationType: "Rotate Out",
            transitionDuration: 350
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#881337",
            placeholderColor: "#FDA4AF",
            inputFontSize: 15,
            inputPaddingVertical: 15,
            inputPaddingHorizontal: 19,
            borderTopColor: "#FECDD3",
            borderRadiusBottom: 22,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 36,
            sendButtonBorderRadius: 11,
            sendButtonIconColor: "#F43F5E",
            sendButtonHoverOpacity: 0.89,
            sendIconName: "heart",
            sendIconSize: 20
        },
        productSlider: {
            enabled: true,
            cardWidth: 166,
            cardHeight: 246,
            cardPadding: 15,
            cardBorderRadius: 16,
            cardGap: 15,
            imageHeight: 126,
            imageBorderRadius: 11,
            titleFontSize: 14,
            priceFontSize: 15,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 30,
            askButtonIconColor: "#F43F5E",
            backgroundColor: "#FFFFFF",
            borderColor: "#FECDD3",
            borderWidth: 1
        }
    };

    // Preset 11: Arctic White
    const arcticWhite: MasterState = {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#F1F5F9",
            gradientStart: "#E2E8F0",
            gradientEnd: "#CBD5E1",
            secondaryColor: "#E2E8F0",
            backgroundColor: "#FFFFFF",
            textColor: "#1E293B",
            secondaryTextColor: "#475569",
            fontFamily: "Inter",
            fontSize: 14,
            fontWeight: "400",
            width: 378,
            height: 508,
            borderRadius: 14
        },
        messageBox: {
            borderRadiusTop: 14,
            borderRadiusRight: 14,
            borderRadiusBottom: 3,
            borderRadiusLeft: 14,
            messageSpacing: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
            timestampDisplay: true
        },
        welcome: {
            greeting: "⚡ Hi there! How can I assist?",
            quickQuestions: [
                "Product catalog",
                "Shipping info",
                "Support chat"
            ],
            inputPlaceholder: "Type your question...",
            sendOnEnter: false,
            quickQuestionPadding: 9,
            quickQuestionBorderRadius: 21,
            quickQuestionFontSize: 12,
            quickQuestionGap: 9
        },
        topNav: {
            avatar: "",
            botName: "Info Assistant",
            headerHeight: 63,
            headerContent: "Info",
            headerFontSize: 16,
            headerFontWeight: "600",
            showOnlineStatus: true,
            onlineStatusType: "Available",
            customOnlineText: ""
        },
        position: {
            chatButtonPosition: "Right corner",
            marginRight: 29,
            marginBottom: 29,
            zIndex: 2147483647
        },
        btnSize: {
            size: 57,
            launcherIconName: "message",
            launcherIconSize: 26
        },
        btnAnim: {
            animationType: "Pulse",
            transitionDuration: 420
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 260
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#475569",
            placeholderColor: "#94A3B8",
            inputFontSize: 14,
            inputPaddingVertical: 12,
            inputPaddingHorizontal: 16,
            borderTopColor: "#E2E8F0",
            borderRadiusBottom: 14,
            sendButtonBackgroundColor: "#1E293B",
            sendButtonSize: 32,
            sendButtonBorderRadius: 8,
            sendButtonIconColor: "#FFFFFF",
            sendButtonHoverOpacity: 0.9,
            sendIconName: "send",
            sendIconSize: 17
        },
        productSlider: {
            enabled: true,
            cardWidth: 163,
            cardHeight: 243,
            cardPadding: 12,
            cardBorderRadius: 12,
            cardGap: 12,
            imageHeight: 123,
            imageBorderRadius: 8,
            titleFontSize: 14,
            priceFontSize: 14,
            showPrice: true,
            showAskButton: true,
            askButtonSize: 28,
            askButtonIconColor: "#1E293B",
            backgroundColor: "#FFFFFF",
            borderColor: "#E2E8F0",
            borderWidth: 1
        }
    };

    const presets = [
        { name: "Modern Minimal", description: "Clean and simple design", data: modernMinimal, color: "#2563EB" },
        { name: "Vibrant Gradient", description: "Colorful and energetic", data: vibrantGradient, color: "#FF6B6B" },
        { name: "Professional Dark", description: "Sleek dark theme", data: professionalDark, color: "#1A1A1A" },
        { name: "Playful Colorful", description: "Fun and vibrant", data: playfulColorful, color: "#C44569" },
        { name: "Elegant Classic", description: "Timeless and refined", data: elegantClassic, color: "#2C3E50" },
        { name: "Soft Pastel", description: "Gentle and calming", data: softPastel, color: "#B8A9E3" },
        { name: "Ocean Breeze", description: "Fresh and modern", data: oceanBreeze, color: "#0EA5E9" },
        { name: "Midnight Blue", description: "Deep and sophisticated", data: midnightBlue, color: "#1E293B" },
        { name: "Mint Fresh", description: "Clean and refreshing", data: mintFresh, color: "#10B981" },
        { name: "Rose Gold", description: "Elegant and feminine", data: roseGold, color: "#F43F5E" },
        { name: "Arctic White", description: "Minimal and pristine", data: arcticWhite, color: "#F1F5F9" }

    ];

    return (
        <s-section padding="base">
            <s-box border="base base solid" borderRadius="base" padding="base" background="subdued">
                <s-stack direction="block">
                    <s-heading><span style={{ fontSize: "1.2em", fontWeight: 600 }}>Design Presets</span></s-heading>
                    <s-paragraph>Choose a preset design to get started, then customize it to your liking.</s-paragraph>

                    <s-grid gridTemplateColumns="repeat(4, 1fr)" gap="base" paddingBlockStart="base">
                        {presets.map((preset, index) => (
                            <s-clickable key={index} onClick={() => onApplyPreset(preset.data)} background="base" border="base base solid" borderRadius="base" padding="small">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            borderRadius: "50%",
                                            background: preset.color,
                                            flexShrink: 0
                                        }}
                                    />
                                    <s-heading>{preset.name}</s-heading>
                                </div>
                                <s-paragraph>{preset.description}</s-paragraph>
                            </s-clickable>
                        ))}
                    </s-grid>
                </s-stack>
            </s-box>
        </s-section>
    );
}
