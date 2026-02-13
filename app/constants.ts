import { WidgetSettings } from "./types";

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
    branding: {
        primaryColor: "#6366f1", // Modern Aurora Primary
        secondaryColor: "#f3f4f6", // Modern Aurora Secondary
        backgroundColor: "#ffffff",
        fontFamily: "Inter",
        fontSize: 16,
        colorMode: "gradient",
        gradientStart: "#6366f1",
        gradientEnd: "#a855f7",
        textColor: "#ffffff",
        secondaryTextColor: "#1f2937",
        fontWeight: "400",
    },
    window: {
        title: "StartStorez Assistant",
        subtitle: "Typically replies instantly",
        avatarId: 2,
        width: 350,
        height: 600,
        cornerRadius: 16,
        messageVerticalPadding: 12,
        messageBorderRadius: {
            tl: 12,
            tr: 12,
            br: 12,
            bl: 12
        }
    },
    launcher: {
        iconId: "bot", // Changing to 'bot' as part of 'best' preset
        position: "right",
        marginH: 20,
        marginV: 20,
        iconSize: 56,
        animation: {
            type: "pulse",
            duration: 2
        },
        windowTransition: {
            type: "slide",
            duration: 0.3
        }
    },
    visibility: {
        showOnMobile: true,
        showOnDesktop: true,
        rule: "all",
        paths: []
    },
    content: {
        welcomeMessage: "👋 Hi there! I'm StartStorez. How can I help you find the perfect product today?",
        quickActions: ["Track my order", "Shipping policy", "Best sellers"],
    },
    addOns: {
        productSlider: {
            enabled: true,
            cardWidth: 150,
            cardHeight: 200,
            cardBackground: "#FFFFFF"
        }
    }
};
