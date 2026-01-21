import { CallbackEvent } from "@shopify/polaris-types";
import React, { useState } from "react";

export interface ResponseToneData {
    selectedTone: string[]; // s-choice-list returns an array
    customInstructions: string;
}

interface ResponseToneProps {
    data: ResponseToneData;
    setData: React.Dispatch<React.SetStateAction<ResponseToneData>>;
}

export function ResponseTone({ data, setData }: ResponseToneProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToneChange = (event: CallbackEvent<"s-choice-list">) => {
        setData(prev => ({ ...prev, selectedTone: event.currentTarget.values }));
    };

    const handleCustomChange = (event: CallbackEvent<"s-text-field">) => {
        setData(prev => ({ ...prev, customInstructions: event.currentTarget.value }));
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Response Tone</span></s-heading>
                        <s-tooltip id="tone-tooltip">
                            Select the personality style your AI uses when communicating with customers.
                        </s-tooltip>
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                            <s-icon interestFor="tone-tooltip" type="info"></s-icon>
                        {/* </div> */}
                    </div>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="base">
                        <s-stack gap="small-200">
                            <s-choice-list
                                label="Tone Selection"
                                name="tone-selection"
                                value={data.selectedTone}
                                onChange={handleToneChange}
                            >
                                <s-choice value="professional">Professional</s-choice>
                                <s-choice value="humorous">Humorous</s-choice>
                                <s-choice value="enthusiastic">Enthusiastic</s-choice>
                                <s-choice value="custom">Custom</s-choice>
                            </s-choice-list>

                            {data.selectedTone.includes("custom") && (
                                <s-text-field
                                    placeholder="Custom tone instructions"
                                    value={data.customInstructions}
                                    onInput={handleCustomChange}
                                />
                            )}
                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}