import { CallbackEvent } from "@shopify/polaris-types";
import { CustomPicks } from "app/components/AIPersonalityAndBehavior/CustomPicks";
import { LanguageSettings, LanguageSettingsData } from "app/components/AIPersonalityAndBehavior/LanguageSettings";
import { Policies, PoliciesData } from "app/components/AIPersonalityAndBehavior/Policies";
import { RecommendedProducts, Product } from "app/components/AIPersonalityAndBehavior/RecommendedProducts";
import { ResponseSettings, ResponseSettingsData } from "app/components/AIPersonalityAndBehavior/ResponseSettings";
import { ResponseTone, ResponseToneData } from "app/components/AIPersonalityAndBehavior/ResponseTone";
import { StoreDetails, StoreDetailsData } from "app/components/AIPersonalityAndBehavior/StoreDetails";
import { useState } from "react";


export default function AIPersonalityAndBehavior() {
    // AI Instructions State
    const [aiInstructions, setAiInstructions] = useState("");

    // Recommended Products State
    const [recommentProducts, setRecommentProducts] = useState<Product[]>([]);

    // Store Details State
    const [storeDetails, setStoreDetails] = useState<StoreDetailsData>({
        about: "",
        location: ""
    });

    // Policies State
    const [policies, setPolicies] = useState<PoliciesData>({
        shipping: "",
        payment: "",
        refund: ""
    });

    // 5. NEW: Custom Picks State 
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);

    const [responseTone, setResponseTone] = useState<ResponseToneData>({
        selectedTone: ['professional'],
        customInstructions: "Speak in a calm and friendly tone."
    });

    const [languageSettings, setLanguageSettings] = useState<LanguageSettingsData>({
        primaryLanguage: "english",
        autoDetect: true
    });

    const [responseSettings, setResponseSettings] = useState<ResponseSettingsData>({
        length: ['balanced'],
        style: ['emojis']
    });

    // const handleChange = (event: CallbackEvent<"s-choice-list">) => {
    //     console.log('Values: ', event.currentTarget.values)
    // }

    return (
        <s-page heading="AI Personality & Behavior" inlineSize="large">
            {/* AI Instructions */}
            <s-section>
                <s-stack gap="small-200">
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>AI Instructions</span></s-heading>
                            <>
                                <s-tooltip id="ai-instruction-tooltip">
                                    Customize your AI&apos;s tone and behavior with specific instructions, while intents such as product recommendations, agent handover, after-sales service, checkout, and order tracking remain unaffected.
                                </s-tooltip>
                                <s-button variant="tertiary" interestFor="ai-instruction-tooltip" accessibilityLabel="AI-Instructions" icon="info" />
                            </>
                        </div>
                        <s-button variant="primary">Save</s-button>
                    </div>
                    <s-text-area
                        required
                        rows={4}
                        details="For writing more detailed instructions tied to specific queries, use the feature below."
                        value={aiInstructions}
                        onInput={(e: CallbackEvent<"s-text-area">) => setAiInstructions(e.currentTarget.value)}
                    />
                </s-stack>
            </s-section>


            {/* Product-specific Recommendation Instructions */}
            <RecommendedProducts
                products={recommentProducts}
                setProducts={setRecommentProducts}
            />

            {/* Store Details Component */}
            <StoreDetails
                data={storeDetails}
                setData={setStoreDetails}
            />

            {/* Policies Component */}
            <Policies
                data={policies}
                setData={setPolicies}
            />


            {/* Custom Picks Component */}
            <CustomPicks
                newArrivals={newArrivals}
                setNewArrivals={setNewArrivals}
                bestSellers={bestSellers}
                setBestSellers={setBestSellers}
            />

            <ResponseTone data={responseTone} setData={setResponseTone} />

            <LanguageSettings data={languageSettings} setData={setLanguageSettings} />

            <ResponseSettings data={responseSettings} setData={setResponseSettings} />

            {/* Response Tone */}
            {/* <s-section padding="none">
                <s-clickable>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Response Tone</span></s-heading>
                            <s-tooltip id="custom-picker-tooltip">
                                You can select products to recommend as best sellers and new arrivals...
                            </s-tooltip>
                            <s-icon interestFor="custom-picker-tooltip" type="info"></s-icon>
                        </div>
                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                <>
                    <s-divider />

                    <s-stack padding="none base base" gap="base">
                        <s-stack gap="small-200">
                            <s-choice-list
                                label="Tone Selection"
                                name="Tone Selection"
                                onChange={handleChange}
                            >
                                <s-choice value="professional">Professional</s-choice>
                                <s-choice value="humorous">Humorous</s-choice>
                                <s-choice value="enthusiastic">Enthusiastic</s-choice>
                                <s-choice value="custom">Custom</s-choice>
                            </s-choice-list>

                            <s-text-field
                                placeholder="Custom tone instructions"
                                value="Speak in a calm and friendly tone."
                            />
                        </s-stack>
                    </s-stack>
                </>

            </s-section> */}


            {/* Language Settings */}
            {/* <s-section padding="none">
                <s-clickable>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Language Settings</span></s-heading>
                            <s-tooltip id="custom-picker-tooltip">
                                Control the language in which your AI chatbot generates responses. This ensures customers receive replies in a language that aligns with your store’s audience and branding.
                            </s-tooltip>
                            <s-icon interestFor="custom-picker-tooltip" type="info"></s-icon>
                        </div>
                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                <>
                    <s-divider />

                    <s-stack padding="none base base" gap="base">
                        <s-stack gap="small-200">
                            <s-select
                                label="Primary Language"
                                details="When selected, the chatbot will automatically generate responses in the merchant-selected language."
                                disabled
                            >
                                <s-option value="1">English</s-option>
                                <s-option value="2">French</s-option>
                                <s-option value="3">Germany</s-option>
                            </s-select>

                            <s-switch
                                label="Default Behavior"
                                details="Auto-detect customer language"
                            />
                        </s-stack>
                    </s-stack>
                </>

            </s-section> */}


            {/* Response Settings */}
            {/* <s-section padding="none">
                <s-clickable>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Response Settings</span></s-heading>
                            <s-tooltip id="custom-picker-tooltip">
                                You can select products to recommend as best sellers and new arrivals...
                            </s-tooltip>
                            <s-icon interestFor="custom-picker-tooltip" type="info"></s-icon>
                        </div>
                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                <>
                    <s-divider />

                    <s-stack padding="none base base" gap="base">
                        <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
                            <s-box border="base base dashed" borderRadius="base" background="subdued" padding="base">
                                <s-choice-list
                                    label="Response Length"
                                    name="Response Length"
                                    onChange={handleChange}
                                >
                                    <s-choice value="professional">Concise</s-choice>
                                    <s-choice value="humorous">Balanced (2-4 sentences)</s-choice>
                                    <s-choice value="enthusiastic">Detailed</s-choice>
                                </s-choice-list>
                            </s-box>

                            <s-box border="base base dashed" borderRadius="base" background="subdued" padding="base">
                                <s-choice-list
                                    label="Response Style"
                                    name="Response Style"
                                    onChange={handleChange}
                                >
                                    <s-choice value="professional">Use Emojis 😊</s-choice>
                                    <s-choice value="humorous">Use Bullet Points</s-choice>
                                </s-choice-list>
                            </s-box>
                        </s-grid>
                    </s-stack>
                </>

            </s-section> */}

        </s-page>
    )
}

// Personality Settings

// Tone Selection (radio buttons)

// Professional
// Humorous
// Friendly
// Enthusiastic
// Custom (text field for custom instructions)



// Response Controls

// Response Length

// Concise (1-2 sentences)
// Balanced (2-4 sentences)
// Detailed (4+ sentences)


// Response Style

// Use emojis toggle
// Use bullet points toggle
// Include product images toggle



// Language Settings

// Primary Language Dropdown

// English
// Spanish
// French
// German
// Italian
// Portuguese
// Japanese
// Chinese (Simplified)
// Chinese (Traditional)
// Other languages...


// Multi-language Support

// Auto-detect customer language toggle
// Fallback language selection



// Conversation Flow

// Proactive Engagement

// Ask clarifying questions toggle
// Suggest related products toggle
// Offer help if customer seems stuck toggle


// Escalation Settings

// Hand off to human support option
// Email notification for complex queries
// Show "Contact Support" button after X messages