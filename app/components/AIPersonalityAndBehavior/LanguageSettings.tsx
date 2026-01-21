import React, { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export interface LanguageSettingsData {
    primaryLanguage: string;
    autoDetect: boolean;
}

interface LanguageSettingsProps {
    data: LanguageSettingsData;
    setData: React.Dispatch<React.SetStateAction<LanguageSettingsData>>;
}

export function LanguageSettings({ data, setData }: LanguageSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (event: CallbackEvent<"s-select">) => {
        setData(prev => ({ ...prev, primaryLanguage: event.currentTarget.value }));
    };

    const handleAutoDetectChange = () => {
        // Assuming s-switch passes checked state via value or a separate property, 
        // usually strictly typed events need careful handling. 
        // Adjust based on your specific s-switch definition.
        setData(prev => ({ ...prev, autoDetect: !prev.autoDetect }));
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Language Settings</span></s-heading>
                        <s-tooltip id="lang-tooltip">
                            Control the language in which your AI chatbot generates responses.
                        </s-tooltip>
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                            <s-icon interestFor="lang-tooltip" type="info"></s-icon>
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
                            <s-select
                                label="Primary Language"
                                details="When selected, the chatbot will automatically generate responses in the merchant-selected language."
                                value={data.primaryLanguage}
                                onChange={handleLanguageChange}
                            >
                                <s-option value="english">English</s-option>
                                <s-option value="french">French</s-option>
                                <s-option value="german">German</s-option>
                            </s-select>

                            <s-switch
                                label="Default Behavior"
                                details="Auto-detect customer language"
                                checked={data.autoDetect}
                                onChange={handleAutoDetectChange}
                            />
                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}