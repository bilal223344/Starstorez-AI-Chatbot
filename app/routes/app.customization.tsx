import ChatbotPreview from "app/components/ChatbotPreview";
import {
    ButtonAnimations,
    CloseButtonAnimations,
    ChatWindowDesign,
    ButtonSizeOptions,
    FooterStyling,
    MessageBoxStyling,
    TopNavigationStyling,
    PositionAndSizeSettings,
    WelcomeAndGreetingSettings,
    PresetTemplates,
    ProductSliderStyling
} from "app/components/CustomizationAndAppearance/index"
import { useState, useEffect, useCallback, useRef } from "react";
import { useFetcher, useLoaderData, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Prisma } from "@prisma/client";


export interface MasterState {
    chatWindow: {
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

        // --- 5. Secondary Text Color ---
        secondaryTextColor: string;

        fontFamily: string;
        fontSize: number;
        fontWeight: string;
        width: number;
        height: number;
        borderRadius: number;
    };
    messageBox: {
        borderRadiusTop: number;
        borderRadiusRight: number;
        borderRadiusBottom: number;
        borderRadiusLeft: number;
        messageSpacing: number;
        paddingVertical: number;
        paddingHorizontal: number;

        typingStyle: string;
        typingIndicator: string;

        timestampDisplay: boolean;
    };
    welcome: {
        greeting: string;
        quickQuestions: string[];
        inputPlaceholder: string;
        sendOnEnter: boolean;
        quickQuestionPadding: number;
        quickQuestionBorderRadius: number;
        quickQuestionFontSize: number;
        quickQuestionGap: number;
    };
    topNav: {
        avatar: string;
        botName: string;
        headerHeight: number;
        headerContent: string;
        headerFontSize: number;
        headerFontWeight: string;
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
        launcherIconName: string;
        launcherIconSize: number;
    };
    btnAnim: {
        animationType: string;
        transitionDuration: number;
    };
    closeButtonAnim: {
        animationType: string;
        transitionDuration: number;
    };
    footer: {
        backgroundColor: string;
        inputTextColor: string;
        placeholderColor: string;
        inputFontSize: number;
        inputPaddingVertical: number;
        inputPaddingHorizontal: number;
        borderTopColor: string;
        borderRadiusBottom: number;
        sendButtonBackgroundColor: string;
        sendButtonSize: number;
        sendButtonBorderRadius: number;
        sendButtonIconColor: string;
        sendButtonHoverOpacity: number;
        sendIconName: string;
        sendIconSize: number;
    };
    productSlider: {
        enabled: boolean;
        cardWidth: number;
        cardHeight: number;
        cardPadding: number;
        cardBorderRadius: number;
        cardGap: number;
        imageHeight: number;
        imageBorderRadius: number;
        titleFontSize: number;
        priceFontSize: number;
        showPrice: boolean;
        showAskButton: boolean;
        askButtonSize: number;
        askButtonIconColor: string;
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    };
}


// ============================================================================
// LOADER - Fetch saved customization from database
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    
    if (!session?.shop) {
        return { customization: null };
    }

    try {
        const customization = await prisma.chatbotCustomization.findUnique({
            where: { shop: session.shop },
            select: {
                settings: true,
                updatedAt: true
            }
        });

        return {
            customization: customization?.settings as MasterState | null,
            updatedAt: customization?.updatedAt || null
        };
    } catch (error) {
        console.error("[LOADER] Error fetching customization:", error);
        return { customization: null };
    }
};

// ============================================================================
// ACTION - Save customization settings to database
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    
    if (!session?.shop) {
        return { error: "Unauthorized" };
    }

    try {
        const body = await request.json();
        // Handle both stringified JSON and direct object
        const settings: MasterState = typeof body.settings === 'string' 
            ? JSON.parse(body.settings) 
            : body.settings;

        if (!settings) {
            return { error: "Settings data is required" };
        }

        // Validate that settings is an object
        if (typeof settings !== "object" || Array.isArray(settings)) {
            return { error: "Invalid settings format" };
        }

        // Convert MasterState to Prisma JSON format
        const settingsJson = JSON.parse(JSON.stringify(settings)) as unknown as Prisma.InputJsonValue;
        
        await prisma.chatbotCustomization.upsert({
            where: { shop: session.shop },
            create: {
                shop: session.shop,
                settings: settingsJson
            },
            update: {
                settings: settingsJson,
                updatedAt: new Date()
            }
        });

        return { success: true, message: "Customization settings saved successfully" };
    } catch (error) {
        console.error("[ACTION] Error saving customization:", error);
        return { error: "Failed to save customization settings" };
    }
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function Customization() {
    const loaderData = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const shopify = useAppBridge();
    const [presetKey, setPresetKey] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize formData from loader or use defaults
    const [formData, setFormData] = useState<MasterState>(() => {
        return loaderData.customization || {
        chatWindow: {
            colorMode: "solid",
            primaryColor: "#D73535",
            gradientStart: "#1CB5E0",
            gradientEnd: "#000851",

            secondaryColor: "#FF937E",
            backgroundColor: "#FCF8F8",
            textColor: "#111F35",
            secondaryTextColor: "#000000",
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: "Regular (400)",
            width: 350,
            height: 450,
            borderRadius: 12
        },
        messageBox: {
            borderRadiusTop: 12,
            borderRadiusRight: 12,
            borderRadiusBottom: 12,
            borderRadiusLeft: 12,
            messageSpacing: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            typingStyle: "In the Msg Box",
            typingIndicator: "Dots (animated)",
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
            sendOnEnter: false,
            quickQuestionPadding: 8,
            quickQuestionBorderRadius: 20,
            quickQuestionFontSize: 12,
            quickQuestionGap: 8
        },
        topNav: {
            avatar: "",
            botName: "Start Store Assistant",
            headerHeight: 60,
            headerContent: "StartStorez",
            headerFontSize: 15,
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
            size: 60,
            launcherIconName: "message-circle",
            launcherIconSize: 28
        },
        btnAnim: {
            animationType: "Static",
            transitionDuration: 300
        },
        closeButtonAnim: {
            animationType: "Fade Out",
            transitionDuration: 300
        },
        footer: {
            backgroundColor: "#FFFFFF",
            inputTextColor: "#333333",
            placeholderColor: "#999999",
            inputFontSize: 14,
            inputPaddingVertical: 10,
            inputPaddingHorizontal: 12,
            borderTopColor: "#EEEEEE",
            borderRadiusBottom: 12,
            sendButtonBackgroundColor: "transparent",
            sendButtonSize: 32,
            sendButtonBorderRadius: 8,
            sendButtonIconColor: "#D73535",
            sendButtonHoverOpacity: 0.9,
            sendIconName: "send",
            sendIconSize: 16
        },
        productSlider: {
            enabled: false,
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
            askButtonIconColor: "#666666",
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E7EB",
            borderWidth: 1
        },
    }});

    const handleUpdate = (section: keyof MasterState, key: string, value: string | number | boolean | string[]) => {
        setFormData((prev) => {
            const updated = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value,
                },
            };
            
            // Auto-save to database (debounced)
            debouncedSave(updated);
            
            return updated;
        });

        // Console log to verify data flow
        console.log(`Updated ${section}.${key} to:`, value);
    };

    // Save customization to database
    const saveCustomization = useCallback(async (data: MasterState) => {
        setIsSaving(true);
        try {
            fetcher.submit(
                { settings: JSON.stringify(data) },
                {
                    method: "POST",
                    encType: "application/json"
                }
            );
        } catch (error) {
            console.error("[SAVE] Error saving customization:", error);
            shopify.toast.show("Failed to save customization", { isError: true });
            setIsSaving(false);
        }
    }, [fetcher, shopify]);

    // Debounced save function to avoid too many API calls
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedSave = useCallback((data: MasterState) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            saveCustomization(data);
        }, 1000); // Save 1 second after last change
    }, [saveCustomization]);

    // Show toast on save success/error
    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.error) {
                shopify.toast.show(fetcher.data.error, { isError: true });
                setIsSaving(false);
            } else if (fetcher.data.success) {
                shopify.toast.show("Customization saved successfully");
                setIsSaving(false);
            }
        }
    }, [fetcher.data, shopify]);

    const handleApplyPreset = (preset: MasterState) => {
        setFormData(preset);
        setPresetKey(prev => prev + 1); // Force re-render of ChatbotPreview
        console.log("Applied preset:", preset.chatWindow.primaryColor);
    };

    return (
        <s-page heading="Customization & Appearance" inlineSize="large">
            {isSaving && (
                <s-banner tone="info">
                    Saving customization...
                </s-banner>
            )}
            <s-grid gridTemplateColumns="8fr 5fr" gap="large">
                <s-stack gap="base">

                    {/* Design Presets - Top of page */}
                    <PresetTemplates onApplyPreset={handleApplyPreset} />

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

                    {/* Footer Styling */}
                    <FooterStyling
                        data={formData.footer}
                        onUpdate={(key, val) => handleUpdate("footer", key, val)}
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
                        primaryColor={formData.chatWindow.primaryColor}
                        colorMode={formData.chatWindow.colorMode}
                        gradientStart={formData.chatWindow.gradientStart}
                        gradientEnd={formData.chatWindow.gradientEnd}
                    />

                    {/* Close Button Animations */}
                    <CloseButtonAnimations
                        data={formData.closeButtonAnim}
                        onUpdate={(key, val) => handleUpdate("closeButtonAnim", key, val)}
                    />

                    {/* Product Slider Styling */}
                    <ProductSliderStyling
                        data={formData.productSlider}
                        onUpdate={(key, val) => handleUpdate("productSlider", key, val)}
                    />

                </s-stack>

                {/* Widget Customize Preview */}
                <div style={{ height: "fit-content", width: "100%", flex: "1", }}>
                    <s-stack>
                        <div style={{ position: 'fixed', width: "35%", top: '1px', zIndex: 10 }}>
                            <s-stack padding="small-200">
                                <s-heading>Live Preview</s-heading>
                            </s-stack>

                            <ChatbotPreview key={presetKey} data={formData} />
                        </div>
                    </s-stack>
                </div>
            </s-grid>
        </s-page>
    )
}