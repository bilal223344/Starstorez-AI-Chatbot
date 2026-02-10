import { Lock, MessageSquare, Sparkles, User } from "lucide-react";

export default function Instructions() {
    return (
        <s-grid gridTemplateColumns="8fr 4fr" gap="base">
            <s-grid-item>
                <s-page heading="Instructions">
                    <s-button slot="secondary-actions" icon="wand">Magic Optimize</s-button>
                    <s-button slot="primary-action" icon="save">Save Changes</s-button>

                    <s-section heading="Role & Identity">
                        <s-grid gridTemplateColumns="1fr 1fr">
                            <s-text-field
                                label="Assistant Name"
                                placeholder="Startstorez"
                                maxLength={20}
                            />
                        </s-grid>

                        <s-stack paddingBlock="base" gap="small-200">
                            <s-text>Base Persona</s-text>
                            <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
                                <s-clickable
                                    border="base"
                                    borderRadius="base"
                                    padding="base"
                                    background="subdued"
                                    inlineSize="100%"
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Support Agent</s-heading>
                                            <s-paragraph>
                                                patient, Problem Solver
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-button
                                                icon="check"
                                                accessibilityLabel="Download Shopify Planet"
                                            />
                                        </s-stack>
                                    </s-grid>
                                </s-clickable>

                                <s-clickable
                                    border="base"
                                    borderRadius="base"
                                    padding="base"
                                    inlineSize="100%"
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Sale Associate</s-heading>
                                            <s-paragraph>
                                                Persuasive, Proactive
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-button icon="circle" />
                                        </s-stack>
                                    </s-grid>
                                </s-clickable>

                                <s-clickable
                                    border="base"
                                    borderRadius="base"
                                    padding="base"
                                    inlineSize="100%"
                                >
                                    <s-grid gridTemplateColumns="1fr auto" alignItems="stretch" gap="base">
                                        <s-box>
                                            <s-heading>Brand Ambassador</s-heading>
                                            <s-paragraph>
                                                On-branding, storytelling
                                            </s-paragraph>
                                        </s-box>
                                        <s-stack justifyContent="start">
                                            <s-button icon="circle" />
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
                            />
                        </s-stack>
                    </s-section>

                    <s-section heading="Communication Style">
                        <s-stack gap="base">
                            <s-stack gap="small-200">
                                <s-text>Tone of Voice</s-text>
                                <s-button-group gap="none">
                                    <s-button icon="check" variant="primary" slot="secondary-actions">Friendly</s-button>
                                    <s-button slot="secondary-actions">Professional</s-button>
                                    <s-button slot="secondary-actions">Enthusiastic</s-button>
                                </s-button-group>
                            </s-stack>

                            <s-stack gap="small-200">
                                <s-text>Response Length</s-text>
                                <s-button-group gap="none">
                                    <s-button slot="secondary-actions">Concise</s-button>
                                    <s-button icon="check" variant="primary" slot="secondary-actions">Balanced</s-button>
                                    <s-button slot="secondary-actions">Detailed</s-button>
                                </s-button-group>
                            </s-stack>

                            <s-switch
                                label="Emoji Usage"
                                details="Allow emojis in responses"
                            />
                        </s-stack>
                    </s-section>

                    <s-section heading="Behaviors">
                        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                            <s-clickable padding="base" borderRadius="base" border="base">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <Sparkles size={20} />
                                    <s-button icon="circle" />
                                </s-stack>
                                <s-heading>Proactive Selling</s-heading>
                                <s-paragraph>Actively suggest related products during conversations.</s-paragraph>
                            </s-clickable>

                            <s-clickable padding="base" borderRadius="base" border="base">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <MessageSquare size={20} />
                                    <s-button icon="circle" />
                                </s-stack>
                                <s-heading>Inventory Check</s-heading>
                                <s-paragraph>Verify stock levels before recommending items.</s-paragraph>
                            </s-clickable>

                            <s-clickable padding="base" borderRadius="base" border="base">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <Lock size={20} />
                                    <s-button icon="circle" />
                                </s-stack>
                                <s-heading>Lead Capture</s-heading>
                                <s-paragraph>Ask for email addresses for follow-ups.</s-paragraph>
                            </s-clickable>

                            <s-clickable background="subdued" padding="base" borderRadius="base" border="base">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <User size={20} />
                                    <s-button icon="check" />
                                </s-stack>
                                <s-heading>Smart Handoff</s-heading>
                                <s-paragraph>Detect frustration and offer human support.</s-paragraph>
                            </s-clickable>

                        </s-grid>
                    </s-section>
                </s-page>
            </s-grid-item>
            <s-grid-item>
                <s-section heading="Chatbot testing">

                </s-section>
            </s-grid-item>
        </s-grid>
    )
}