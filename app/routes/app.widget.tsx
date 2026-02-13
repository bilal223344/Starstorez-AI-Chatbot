import { useState, useCallback, type ElementType } from "react";
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { getWidgetSettings, updateWidgetSettings } from "../services/widgetService";
import { WidgetSettings, ShopifyPagesResponse, ShopifyPageNode } from "../types";

import WidgetPreview from "../components/Widget/WidgetPreview";
import AddOns from "../components/Widget/AddOns";
import Branding from "../components/Widget/Branding";
import Content from "../components/Widget/Content";
import Launcher from "../components/Widget/Launcher";
import Visibility from "../components/Widget/Visibility";
import Window from "../components/Widget/Window";
import {
    Palette,
    AppWindow,
    MessageCircle,
    Eye,
    Type,
    Layers
} from "lucide-react";

// Action to handle saving settings
export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    const formData = await request.formData();
    const settingsJson = formData.get("settings");

    if (!settingsJson) {
        return Response.json({ error: "No settings provided" }, { status: 400 });
    }

    try {
        const settings = JSON.parse(settingsJson as string);
        const updated = await updateWidgetSettings(shop, settings);
        return { settings: updated, status: "success" };
    } catch (error) {
        console.error("Failed to save settings:", error);
        return Response.json({ error: "Failed to save settings" }, { status: 500 });
    }
};

// Loader to fetch initial settings
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const { shop } = session;

    const [settings, response] = await Promise.all([
        getWidgetSettings(shop),
        admin.graphql(
            `#graphql
            query PageList {
              pages(first: 50) {
                edges {
                  node {
                    id
                    handle      
                    isPublished
                    title
                  }
                }
              }
            }`
        )
    ]);

    const pagesData = (await response.json()) as { data: ShopifyPagesResponse };
    const pagesList: ShopifyPageNode[] = pagesData.data.pages.edges.map(edge => edge.node);

    return { settings, pages: pagesList };
};

export default function Widget() {
    const loaderData = useLoaderData<typeof loader>();
    const initialSettings = loaderData.settings;

    // Fallback if settings are undefined (redundancy)
    const [settings, setSettings] = useState<WidgetSettings>(initialSettings || {}); // Ensure defined
    const [activeTab, setActiveTab] = useState<keyof WidgetSettings>('branding');
    const submit = useSubmit();
    const navigation = useNavigation();
    const isSaving = navigation.state === "submitting";
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

    // Handle updates from child components
    const handleSettingChange = useCallback(<T extends keyof WidgetSettings, K extends keyof WidgetSettings[T]>(section: T, key: K, value: WidgetSettings[T][K]) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    }, []);

    // Handle bulk updates from child components
    const handleBulkChange = useCallback(<T extends keyof WidgetSettings>(section: T, changes: Partial<WidgetSettings[T]>) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                ...changes
            }
        }));
    }, []);

    // Save handler
    const handleSave = () => {
        submit({ settings: JSON.stringify(settings) }, { method: "post" });
    };

    const handleGenerateTheme = async (prompt: string) => {
        setIsGeneratingTheme(true);
        try {
            const response = await fetch("/api/generate-theme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await response.json();
            console.log("[data]", data);
            if (data.settings) {
                setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, ...data.settings.branding },
                    window: { ...prev.window, ...data.settings.window }
                }));
            }
        } catch (error) {
            console.error("Failed to generate theme:", error);
        } finally {
            setIsGeneratingTheme(false);
        }
    };

    const tabs = [
        { id: 'branding' as const, label: 'Branding', icon: Palette, component: Branding },
        { id: 'window' as const, label: 'Window', icon: AppWindow, component: Window },
        { id: 'launcher' as const, label: 'Launcher', icon: MessageCircle, component: Launcher },
        { id: 'visibility' as const, label: 'Visibility', icon: Eye, component: Visibility },
        { id: 'content' as const, label: 'Content', icon: Type, component: Content },
        { id: 'addOns' as const, label: 'Add-ons', icon: Layers, component: AddOns },
    ];



    // Helper to render icon
    const renderIcon = (Icon: ElementType) => <Icon size={20} />;

    /* Check if settings is loaded before rendering to prevent crashes */
    if (!settings || !settings.branding) {
        return <div>Loading settings...</div>;
    }

    return (
        <s-page heading="Customization & Appearance" inlineSize="large">
            <s-grid gridTemplateColumns="auto 5fr 8fr" gap="small-200">
                {/* Navigation Sidebar */}
                <s-grid-item>
                    <div style={{ position: "sticky", top: "20px" }}>
                        <s-stack gap="base" background="subdued" borderRadius="base">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <div
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            backgroundColor: isActive ? "#f1f2f3" : "transparent",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "8px",
                                            cursor: "pointer",
                                            width: "80px",
                                            border: isActive ? "1px solid #000" : "1px solid #e1e3e5",
                                            transition: "all 0.2s"
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setActiveTab(tab.id);
                                            }
                                        }}
                                    >
                                        <div style={{ color: isActive ? "#000" : "#666" }}>
                                            {renderIcon(tab.icon)}
                                        </div>
                                        <div style={{
                                            fontSize: "12px",
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? "#000" : "#666",
                                            textAlign: "center"
                                        }}>
                                            {tab.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </s-stack>
                    </div>
                </s-grid-item>

                {/* Main Configuration Area */}
                <s-grid-item>
                    <s-card>
                        <div style={{ padding: "20px" }}>
                            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                                    {tabs.find(t => t.id === activeTab)?.label} Settings
                                </h2>
                                <s-button
                                    variant="primary"
                                    onClick={handleSave}
                                    loading={isSaving}
                                    icon="save"
                                >
                                    Save Changes
                                </s-button>
                            </div>

                            {activeTab === 'branding' && (
                                <Branding
                                    settings={settings.branding}
                                    onChange={(key, value) => handleSettingChange('branding', key, value)}
                                    onBulkChange={(changes) => handleBulkChange('branding', changes)}
                                    onGenerate={handleGenerateTheme}
                                    isGenerating={isGeneratingTheme}
                                />
                            )}
                            {activeTab === 'window' && (
                                <Window
                                    settings={settings.window}
                                    onChange={(key, value) => handleSettingChange('window', key, value)}
                                />
                            )}
                            {activeTab === 'launcher' && (
                                <Launcher
                                    settings={settings.launcher}
                                    onChange={(key, value) => handleSettingChange('launcher', key, value)}
                                />
                            )}
                            {activeTab === 'visibility' && (
                                <Visibility
                                    settings={settings.visibility}
                                    onChange={(key, value) => handleSettingChange('visibility', key, value)}
                                    pages={loaderData.pages}
                                />
                            )}
                            {activeTab === 'content' && (
                                <Content
                                    settings={settings.content}
                                    onChange={(key, value) => handleSettingChange('content', key, value)}
                                />
                            )}
                            {activeTab === 'addOns' && (
                                <AddOns
                                    settings={settings.addOns}
                                    onChange={(key, value) => handleSettingChange('addOns', key, value)}
                                />
                            )}
                        </div>
                    </s-card>
                </s-grid-item>

                {/* Preview Area */}
                <s-grid-item>
                    <div style={{ position: "sticky", top: "20px", height: "calc(100vh - 60px)" }}>
                        <div style={{ marginBottom: "12px", fontWeight: 600, color: "#666" }}>
                            Live Preview
                        </div>
                        <WidgetPreview settings={settings} />
                    </div>
                </s-grid-item>
            </s-grid>
        </s-page>
    );
}