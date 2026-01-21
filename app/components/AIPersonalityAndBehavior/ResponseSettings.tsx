import { CallbackEvent } from "@shopify/polaris-types";
import React, { useState } from "react";

export interface ResponseSettingsData {
    length: string[]; // s-choice-list returns array
    style: string[];  // s-choice-list returns array
}

interface ResponseSettingsProps {
    data: ResponseSettingsData;
    setData: React.Dispatch<React.SetStateAction<ResponseSettingsData>>;
}

export function ResponseSettings({ data, setData }: ResponseSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleLengthChange = (event: CallbackEvent<"s-choice-list">) => {
        setData(prev => ({ ...prev, length: event.currentTarget.values }));
    };

    const handleStyleChange = (event: CallbackEvent<"s-choice-list">) => {
        setData(prev => ({ ...prev, style: event.currentTarget.values }));
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Response Settings</span></s-heading>
                        <s-tooltip id="resp-tooltip">
                           Configure length and styling of AI responses.
                        </s-tooltip>
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                            <s-icon interestFor="resp-tooltip" type="info"></s-icon>
                        {/* </div> */}
                    </div>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="base">
                        <s-grid gridTemplateColumns="1fr 1fr" gap="small-200">
                            
                            {/* Response Length */}
                            <s-box border="base base dashed" borderRadius="base" background="subdued" padding="base">
                                <s-choice-list
                                    label="Response Length"
                                    name="response-length"
                                    value={data.length}
                                    onChange={handleLengthChange}
                                >
                                    <s-choice value="concise">Concise</s-choice>
                                    <s-choice value="balanced">Balanced (2-4 sentences)</s-choice>
                                    <s-choice value="detailed">Detailed</s-choice>
                                </s-choice-list>
                            </s-box>

                            {/* Response Style */}
                            <s-box border="base base dashed" borderRadius="base" background="subdued" padding="base">
                                <s-choice-list
                                    label="Response Style"
                                    name="response-style"
                                    value={data.style}
                                    onChange={handleStyleChange}
                                >
                                    <s-choice value="emojis">Use Emojis 😊</s-choice>
                                    <s-choice value="bullets">Use Bullet Points</s-choice>
                                </s-choice-list>
                            </s-box>

                        </s-grid>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}