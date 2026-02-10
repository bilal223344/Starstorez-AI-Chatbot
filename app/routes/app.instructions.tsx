import { useState, useRef, useEffect } from "react";
import { LoaderFunctionArgs, ActionFunctionArgs, useLoaderData, useSubmit, useNavigation, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { LanguageSettings, LanguageSettingsData } from "../components/AIPersonalityAndBehavior/LanguageSettings";
import { MessageSquare, Sparkles, Lock, User, Bot, MessageCircle, Signal, Wifi, Battery, MoreHorizontal, Plus, Send } from "lucide-react";

export interface AISettingsType {
    assistantName: string;
    basePersona: string;
    customInstructions: string;
    toneOfVoice: string;
    responseLength: string;
    allowEmojis: boolean;
    primaryLanguage: string;
    autoDetect: boolean;
    behaviors: string[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const aiSettings = await prisma.aISettings.findUnique({
        where: { shop: session.shop },
    });

    return {
        aiSettings: aiSettings?.settings || {},
        shop: session.shop
    };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "optimize") {
        const { optimizeAISettings } = await import("../services/ai/optimizer.server.ts");
        const optimizedSettings = await optimizeAISettings(session.shop);
        return { status: "success", settings: optimizedSettings };
    }

    const settings = JSON.parse(formData.get("settings") as string);

    await prisma.aISettings.upsert({
        where: { shop: session.shop },
        update: { settings },
        create: {
            shop: session.shop,
            settings
        }
    });

    return { status: "success" };
};

export default function Instructions() {
    const { aiSettings: rawSettings } = useLoaderData<typeof loader>();
    const aiSettings = (rawSettings as unknown as AISettingsType) || ({} as AISettingsType);
    const submit = useSubmit();
    const navigation = useNavigation();
    const fetcher = useFetcher();
    const isSaving = navigation.state === "submitting";
    const isOptimizing = fetcher.state === "submitting" || fetcher.state === "loading";

    // Handle Optimization Results
    useEffect(() => {
        if (fetcher.data && fetcher.data.status === "success" && fetcher.data.settings) {
            const s = fetcher.data.settings;
            if (s.assistantName) setAssistantName(s.assistantName);
            if (s.basePersona) setBasePersona(s.basePersona);
            if (s.customInstructions) setCustomInstructions(s.customInstructions);
            if (s.toneOfVoice) setToneOfVoice(s.toneOfVoice);
            if (s.responseLength) setResponseLength(s.responseLength);
            if (s.allowEmojis !== undefined) setAllowEmojis(s.allowEmojis);
            if (s.behaviors) setBehaviors(s.behaviors);
        }
    }, [fetcher.data]);

    // State for all settings
    const [assistantName, setAssistantName] = useState(aiSettings.assistantName || "");
    const [basePersona, setBasePersona] = useState(aiSettings.basePersona || "support_agent");
    const [customInstructions, setCustomInstructions] = useState(aiSettings.customInstructions || "");

    // Communication Style
    const [toneOfVoice, setToneOfVoice] = useState(aiSettings.toneOfVoice || "professional");
    const [responseLength, setResponseLength] = useState(aiSettings.responseLength || "balanced");
    const [allowEmojis, setAllowEmojis] = useState(aiSettings.allowEmojis || false);

    // Language Settings
    const [languageData, setLanguageData] = useState<LanguageSettingsData>({
        primaryLanguage: aiSettings.primaryLanguage || "english",
        autoDetect: aiSettings.autoDetect ?? true
    });

    // Behaviors
    const [behaviors, setBehaviors] = useState<string[]>(aiSettings.behaviors || []);

    // Chat Simulation State
    const [input, setInput] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { sender: 'ai', text: `Hi! I'm ${assistantName || 'your assistant'}. How can I help you today?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isTyping]);

    const handleSimulateSend = () => {
        if (!input.trim()) return;

        const newUserMsg = { sender: 'user', text: input };
        setChatHistory(prev => [...prev, newUserMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            setIsTyping(false);
            const aiResponse = {
                sender: 'ai',
                text: "That's a great question! I'm currently in preview mode, but I'll be able to help you with your store once you save these settings."
            };
            setChatHistory(prev => [...prev, aiResponse]);
        }, 1500);
    };

    const handleResetSimulation = () => {
        setChatHistory([
            { sender: 'ai', text: `Hi! I'm ${assistantName || 'your assistant'}. How can I help you today?` }
        ]);
        setInput("");
        setIsTyping(false);
    };

    const handleBehaviorToggle = (behaviorId: string) => {
        setBehaviors(prev =>
            prev.includes(behaviorId)
                ? prev.filter(id => id !== behaviorId)
                : [...prev, behaviorId]
        );
    };

    const handleSave = () => {
        const settings = {
            assistantName,
            basePersona,
            customInstructions,
            toneOfVoice,
            responseLength,
            allowEmojis,
            primaryLanguage: languageData.primaryLanguage,
            autoDetect: languageData.autoDetect,
            behaviors
        };

        submit({ settings: JSON.stringify(settings) }, { method: "post" });
    };

    const handleMagicOptimize = () => {
        fetcher.submit({ intent: "optimize" }, { method: "post" });
    };

    return (
        <s-grid gridTemplateColumns="8fr 4fr" gap="base">
            <s-grid-item>
                <s-page heading="Instructions">
                    <s-button
                        slot="secondary-actions"
                        icon="wand"
                        onClick={handleMagicOptimize}
                        loading={isOptimizing}
                    >
                        Magic Optimize
                    </s-button>
                    <s-button
                        slot="primary-action"
                        icon="save"
                        onClick={handleSave}
                        loading={isSaving}
                    >
                        Save Changes
                    </s-button>

                    <s-section heading="Role & Identity">
                        <s-grid gridTemplateColumns="1fr 1fr">
                            <s-text-field
                                label="Assistant Name"
                                placeholder="Startstorez"
                                maxLength={20}
                                value={assistantName}
                                onInput={(e: any) => setAssistantName(e.target.value)}
                            />
                        </s-grid>

                        <s-stack paddingBlock="base" gap="small-200">
                            <s-text>Base Persona</s-text>
                            <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
                                <s-clickable
                                    border={basePersona === "support_agent" ? "base-dark" : "base"}
                                    borderRadius="base"
                                    padding="base"
                                    background={basePersona === "support_agent" ? "subdued" : "surface"}
                                    inlineSize="100%"
                                    onClick={() => setBasePersona("support_agent")}
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Support Agent</s-heading>
                                            <s-paragraph>
                                                Patient, Problem Solver
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-icon type={basePersona === "support_agent" ? "check-circle" : "circle"} />
                                        </s-stack>
                                    </s-grid>
                                </s-clickable>

                                <s-clickable
                                    border={basePersona === "sales_associate" ? "base-dark" : "base"}
                                    borderRadius="base"
                                    padding="base"
                                    background={basePersona === "sales_associate" ? "subdued" : "surface"}
                                    inlineSize="100%"
                                    onClick={() => setBasePersona("sales_associate")}
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Sales Associate</s-heading>
                                            <s-paragraph>
                                                Persuasive, Proactive
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-icon type={basePersona === "sales_associate" ? "check-circle" : "circle"} />
                                        </s-stack>
                                    </s-grid>
                                </s-clickable>

                                <s-clickable
                                    border={basePersona === "brand_ambassador" ? "base-dark" : "base"}
                                    borderRadius="base"
                                    padding="base"
                                    background={basePersona === "brand_ambassador" ? "subdued" : "surface"}
                                    inlineSize="100%"
                                    onClick={() => setBasePersona("brand_ambassador")}
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Brand Ambassador</s-heading>
                                            <s-paragraph>
                                                On-brand, Storytelling
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-icon type={basePersona === "brand_ambassador" ? "check-circle" : "circle"} />
                                        </s-stack>
                                    </s-grid>
                                </s-clickable>
                            </s-grid>
                        </s-stack>

                        <s-stack>
                            <s-text-area
                                label="Custom Instructions"
                                details="Refine the persona with specific details about your brand voice."
                                placeholder="You are an enthusiastic sales associate. Focus on recommending products, upselling, and closing sales."
                                maxLength={200}
                                rows={5}
                                value={customInstructions}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onInput={(e: any) => setCustomInstructions(e.target.value)}
                            />
                        </s-stack>
                    </s-section>

                    <LanguageSettings data={languageData} setData={setLanguageData} />

                    <s-section heading="Communication Style">
                        <s-stack gap="base">
                            <s-stack gap="small-200">
                                <s-text>Tone of Voice</s-text>
                                <s-button-group gap="none">
                                    <s-button
                                        icon={toneOfVoice === "friendly" ? "check" : undefined}
                                        variant={toneOfVoice === "friendly" ? "primary" : undefined}
                                        onClick={() => setToneOfVoice("friendly")}
                                    >
                                        Friendly
                                    </s-button>
                                    <s-button
                                        icon={toneOfVoice === "professional" ? "check" : undefined}
                                        variant={toneOfVoice === "professional" ? "primary" : undefined}
                                        onClick={() => setToneOfVoice("professional")}
                                    >
                                        Professional
                                    </s-button>
                                    <s-button
                                        icon={toneOfVoice === "enthusiastic" ? "check" : undefined}
                                        variant={toneOfVoice === "enthusiastic" ? "primary" : undefined}
                                        onClick={() => setToneOfVoice("enthusiastic")}
                                    >
                                        Enthusiastic
                                    </s-button>
                                </s-button-group>
                            </s-stack>

                            <s-stack gap="small-200">
                                <s-text>Response Length</s-text>
                                <s-button-group gap="none">
                                    <s-button
                                        icon={responseLength === "concise" ? "check" : undefined}
                                        variant={responseLength === "concise" ? "primary" : undefined}
                                        onClick={() => setResponseLength("concise")}
                                    >
                                        Concise
                                    </s-button>
                                    <s-button
                                        icon={responseLength === "balanced" ? "check" : undefined}
                                        variant={responseLength === "balanced" ? "primary" : undefined}
                                        onClick={() => setResponseLength("balanced")}
                                    >
                                        Balanced
                                    </s-button>
                                    <s-button
                                        icon={responseLength === "detailed" ? "check" : undefined}
                                        variant={responseLength === "detailed" ? "primary" : undefined}
                                        onClick={() => setResponseLength("detailed")}
                                    >
                                        Detailed
                                    </s-button>
                                </s-button-group>
                            </s-stack>

                            <s-switch
                                label="Emoji Usage"
                                details="Allow emojis in responses"
                                checked={allowEmojis}
                                onChange={() => setAllowEmojis(!allowEmojis)}
                            />
                        </s-stack>
                    </s-section>

                    <s-section heading="Behaviors">
                        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                            <s-clickable
                                padding="base"
                                borderRadius="base"
                                border={behaviors.includes("proactive_selling") ? "base-dark" : "base"}
                                background={behaviors.includes("proactive_selling") ? "subdued" : "surface"}
                                onClick={() => handleBehaviorToggle("proactive_selling")}
                            >
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <Sparkles size={20} />
                                    <s-icon type={behaviors.includes("proactive_selling") ? "check-circle" : "circle"} />
                                </s-stack>
                                <s-heading>Proactive Selling</s-heading>
                                <s-paragraph>Actively suggest related products during conversations.</s-paragraph>
                            </s-clickable>

                            <s-clickable
                                padding="base"
                                borderRadius="base"
                                border={behaviors.includes("inventory_check") ? "base-dark" : "base"}
                                background={behaviors.includes("inventory_check") ? "subdued" : "surface"}
                                onClick={() => handleBehaviorToggle("inventory_check")}
                            >
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <MessageSquare size={20} />
                                    <s-icon type={behaviors.includes("inventory_check") ? "check-circle" : "circle"} />
                                </s-stack>
                                <s-heading>Inventory Check</s-heading>
                                <s-paragraph>Verify stock levels before recommending items.</s-paragraph>
                            </s-clickable>

                            <s-clickable
                                padding="base"
                                borderRadius="base"
                                border={behaviors.includes("lead_capture") ? "base-dark" : "base"}
                                background={behaviors.includes("lead_capture") ? "subdued" : "surface"}
                                onClick={() => handleBehaviorToggle("lead_capture")}
                            >
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <span style={{ display: 'flex' }}>
                                        <Lock size={20} />
                                    </span>
                                    <s-icon type={behaviors.includes("lead_capture") ? "check-circle" : "circle"} />
                                </s-stack>
                                <s-heading>Lead Capture</s-heading>
                                <s-paragraph>Ask for email addresses for follow-ups.</s-paragraph>
                            </s-clickable>

                            <s-clickable
                                background={behaviors.includes("smart_handoff") ? "subdued" : "surface"}
                                padding="base"
                                borderRadius="base"
                                border={behaviors.includes("smart_handoff") ? "base-dark" : "base"}
                                onClick={() => handleBehaviorToggle("smart_handoff")}
                            >
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <span style={{ display: 'flex' }}>
                                        <User size={20} />
                                    </span>
                                    <s-icon type={behaviors.includes("smart_handoff") ? "check-circle" : "circle"} />
                                </s-stack>
                                <s-heading>Smart Handoff</s-heading>
                                <s-paragraph>Detect frustration and offer human support.</s-paragraph>
                            </s-clickable>

                        </s-grid>
                    </s-section>
                </s-page>
            </s-grid-item>
            <s-grid-item>
                <div style={{ width: '100%', flexShrink: 0 }}>
                    <div style={{ position: 'sticky', top: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <MessageCircle size={16} /> Live Preview
                            </h3>
                            <s-button variant="plain" icon="refresh" onClick={handleResetSimulation}>
                                Reset
                            </s-button>
                        </div>

                        <div style={{
                            backgroundColor: '#0f172a',
                            borderRadius: '3rem',
                            border: '8px solid #0f172a',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden',
                            height: '750px',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            outline: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {/* Simulated Phone Header */}
                            <div style={{
                                backgroundColor: '#0f172a',
                                height: '40px',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0 24px',
                                flexShrink: 0,
                                color: 'white',
                                zIndex: 20
                            }}>
                                <span style={{ fontSize: '12px', fontWeight: 500 }}>9:41</span>
                                <div style={{
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    top: '8px',
                                    width: '96px',
                                    height: '24px',
                                    backgroundColor: 'black',
                                    borderRadius: '0 0 1.5rem 1.5rem'
                                }}></div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <Signal size={12} />
                                    <Wifi size={12} />
                                    <Battery size={14} />
                                </div>
                            </div>

                            {/* App Screen Container */}
                            <div style={{
                                flex: 1,
                                backgroundColor: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '0 0 2.5rem 2.5rem'
                            }}>

                                {/* Chat Header */}
                                <div style={{
                                    padding: '12px 20px',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(12px)',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10,
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(to top right, #14b8a6, #10b981)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.2)'
                                            }}>
                                                <Bot size={22} strokeWidth={2.5} />
                                            </div>
                                            <span style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: '#22c55e',
                                                border: '2px solid white',
                                                borderRadius: '50%'
                                            }}></span>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <h2 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px', lineHeight: 1.25, margin: 0 }}>{assistantName || 'Assistant'}</h2>
                                                <span style={{
                                                    backgroundColor: '#f0fdfa',
                                                    color: '#0f766e',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccfbf1'
                                                }}>AI</span>
                                            </div>
                                            <p style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Online • Replies instantly</p>
                                        </div>
                                    </div>
                                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div style={{
                                    flex: 1,
                                    backgroundColor: '#F2F4F7',
                                    padding: '16px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px', paddingBottom: '16px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            color: '#94a3b8',
                                            backgroundColor: 'rgba(226, 232, 240, 0.5)',
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            backdropFilter: 'blur(4px)'
                                        }}>Today, 9:41 AM</span>
                                    </div>

                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            gap: '12px',
                                            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                                            animation: 'slide-up-fade 0.3s ease-out'
                                        }}>
                                            {msg.sender === 'ai' && (
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                    border: '1px solid #f1f5f9',
                                                    alignSelf: 'flex-end',
                                                    marginBottom: '4px'
                                                }}>
                                                    <Bot size={16} style={{ color: '#0d9488' }} />
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '10px 16px',
                                                fontSize: '14px',
                                                lineHeight: 1.625,
                                                maxWidth: '80%',
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                ...(msg.sender === 'ai'
                                                    ? { backgroundColor: 'white', color: '#1e293b', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(226, 232, 240, 0.5)' }
                                                    : { background: 'linear-gradient(to bottom right, #0d9488, #0f766e)', color: 'white', borderRadius: '16px 16px 0 16px' }
                                                )
                                            }}>
                                                {msg.text}
                                                <div style={{
                                                    fontSize: '9px',
                                                    marginTop: '4px',
                                                    textAlign: 'right',
                                                    opacity: 0.6,
                                                    fontWeight: 500,
                                                    color: msg.sender === 'ai' ? '#94a3b8' : '#ccfbf1'
                                                }}>
                                                    9:42 AM
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                border: '1px solid #f1f5f9',
                                                alignSelf: 'flex-end',
                                                marginBottom: '4px'
                                            }}>
                                                <Bot size={16} style={{ color: '#0d9488' }} />
                                            </div>
                                            <div style={{
                                                backgroundColor: 'white',
                                                borderRadius: '16px 16px 16px 4px',
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                border: '1px solid rgba(226, 232, 240, 0.5)'
                                            }}>
                                                <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                                                <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                                                <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div style={{ padding: '12px', backgroundColor: 'white', borderTop: '1px solid #f1f5f9', paddingBottom: '24px' }}>
                                    <div style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: '8px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '24px',
                                        padding: '6px',
                                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                                    }}>
                                        <div style={{ padding: '8px', color: '#94a3b8', cursor: 'pointer' }}>
                                            <Plus size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSimulateSend()}
                                            placeholder={`Message ${assistantName || 'Assistant'}...`}
                                            style={{
                                                flex: 1,
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                fontSize: '14px',
                                                padding: '10px 0',
                                                outline: 'none',
                                                color: '#1e293b',
                                                fontWeight: 500
                                            }}
                                        />
                                        <button
                                            onClick={handleSimulateSend}
                                            disabled={!input.trim()}
                                            style={{
                                                padding: '10px',
                                                backgroundColor: '#0d9488',
                                                color: 'white',
                                                borderRadius: '50%',
                                                border: 'none',
                                                cursor: input.trim() ? 'pointer' : 'default',
                                                opacity: input.trim() ? 1 : 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            <Send size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.6 }}>
                                        <div style={{ width: '12px', height: '12px', backgroundColor: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Bot size={8} style={{ color: 'white' }} />
                                        </div>
                                        <p style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>Powered by Starstorez</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </s-grid-item>
        </s-grid>
    )
}