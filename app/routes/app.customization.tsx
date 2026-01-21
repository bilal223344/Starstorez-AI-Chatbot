import ChatbotPreview from "app/components/ChatbotPreview";
import {
    ButtonAnimations,
    ChatWindowDesign,
    ButtonSizeOptions,
    MessageBoxStyling,
    TopNavigationStyling,
    PositionAndSizeSettings,
    WelcomeAndGreetingSettings
} from "app/components/CustomizationAndAppearance/index"
import { useState } from "react";


export interface MasterState {
    chatWindow: {
        avatar: string;
        botName: string;

        // --- 1. Primary (Header + Bot Bubble) ---
        colorMode: 'solid' | 'gradient';
        primaryColor: string;
        gradientStart: string;
        gradientEnd: string;

        // --- 2. Secondary (User Bubble / Accents) ---
        secondaryColor: string;

        // --- 3. Background (Window Canvas) ---
        backgroundColor: string;

        // --- 4. Text Color ---
        textColor: string;

        fontFamily: string;
        fontSize: number;
        fontWeight: string;
    };
    messageBox: {
        borderRadius: number;
        messageSpacing: number;
        paddingVertical: number;
        paddingHorizontal: number;

        typingStyle: string;
        typingIndicator: string;

        sendIcon: string;
        sendIconSize: number;

        timestampDisplay: boolean;
    };
    welcome: {
        greeting: string;
        quickQuestions: string[]; // Array of strings
        inputPlaceholder: string;
        sendOnEnter: boolean;
    };
    topNav: {
        headerHeight: number;
        headerContent: string;
        showOnlineStatus: boolean;
        onlineStatusType: string; // 'Online' | 'Active' | 'Available' | 'Custom'
        customOnlineText: string;
    };
    position: {
        chatButtonPosition: string; // 'Left corner' | 'Right corner'
        marginRight: number;
        marginBottom: number;
        zIndex: number;
    };
    btnSize: {
        size: number;
    };
    btnAnim: {
        animationType: string; 
    };
    // ... add other sections
}


export default function Customization() {

    const [formData, setFormData] = useState<MasterState>({
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
            quickQuestions: [
                "What are your best sellers?",
                "Where is my order?",
                "Can you help me find something?"
            ],
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
    });

    const handleUpdate = (section: keyof MasterState, key: string, value: string | number | boolean | string[]) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));

        // Console log to verify data flow
        console.log(`Updated ${section}.${key} to:`, value);
    };

    return (
        <s-page heading="Customization & Appearance" inlineSize="large">
            <s-grid gridTemplateColumns="8fr 5fr" gap="large">
                <s-stack gap="base">

                    {/* Chat Window Design */}
                    <ChatWindowDesign
                        data={formData.chatWindow}
                        onUpdate={(key, val) => handleUpdate("chatWindow", key, val)}
                    />


                    {/* Message Box Styling */}
                    <MessageBoxStyling
                        data={formData.messageBox}
                        onUpdate={(key, val) => handleUpdate("messageBox", key, val)}
                    />


                    {/* Welcome & Greeting Settings */}
                    <WelcomeAndGreetingSettings
                        data={formData.welcome}
                        onUpdate={(key, val) => handleUpdate("welcome", key, val)}
                    />


                    {/* Top Navigation Styling */}
                    <TopNavigationStyling
                        data={formData.topNav}
                        onUpdate={(key, val) => handleUpdate("topNav", key, val)}
                    />


                    {/* Position & Size Settings */}
                    <PositionAndSizeSettings
                        data={formData.position}
                        onUpdate={(key, val) => handleUpdate("position", key, val)}
                    />


                    {/* Button Size Options */}
                    <ButtonSizeOptions
                        data={formData.btnSize}
                        onUpdate={(key, val) => handleUpdate("btnSize", key, val)}
                    />

                    {/* Button Animations */}
                    <ButtonAnimations
                        data={formData.btnAnim}
                        onUpdate={(key, val) => handleUpdate("btnAnim", key, val)}
                    />

                </s-stack>

                {/* Widget Customize Preview */}
                <s-stack>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: "100%", flex: "1", position: 'fixed', top: '1px', zIndex: 10 }}>
                            <s-box padding="none">
                                <s-stack padding="small-200">
                                    <s-heading>Live Preview</s-heading>
                                </s-stack>


                                <ChatbotPreview data={formData} />

                            </s-box>
                        </div>
                    </div>
                </s-stack>
            </s-grid>
        </s-page>
    )
}