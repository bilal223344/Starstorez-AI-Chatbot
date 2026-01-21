import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface PositionData {
    chatButtonPosition: string;
    marginRight: number;
    marginBottom: number;
    zIndex: number;
}

interface PositionSettingsProps {
    data: PositionData;
    onUpdate: <K extends keyof PositionData>(key: K, value: PositionData[K]) => void;
}

export default function PositionAndSizeSettings({ data, onUpdate }: PositionSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Position & Size Settings</span></s-heading>

                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Position at */}
                                <s-select
                                    label="Chat Button Position"
                                    details="At which corner of the page the chat button/window/popup is placed."
                                    value={data.chatButtonPosition}
                                    onChange={(e: CallbackEvent<"s-select">) => onUpdate("chatButtonPosition", e.currentTarget.value)}
                                >
                                    <s-option value="Left corner">Left corner</s-option>
                                    <s-option value="Right corner">Right corner</s-option>
                                </s-select>

                                {/* Margin */}
                                <s-stack gap="small-200">
                                    <s-heading>Margin Controls</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                                        <s-number-field
                                            label="Right"
                                            suffix="px"
                                            min={1} max={100}
                                            value={data.marginRight.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("marginRight", Number(e.currentTarget.value))}
                                        />
                                        <s-number-field
                                            label="Bottom"
                                            suffix="px"
                                            min={1} max={100}
                                            value={data.marginBottom.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("marginBottom", Number(e.currentTarget.value))}
                                        />
                                    </s-grid>
                                    <s-paragraph>Overrides the default space between the chat button/window/popup and the edge of the screen.</s-paragraph>
                                </s-stack>

                                {/* Z-Index */}
                                <s-stack gap="small-200">
                                    <s-heading>Z-Index</s-heading>
                                    <s-number-field
                                        min={20}
                                        value={data.zIndex.toString()}
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("zIndex", Number(e.currentTarget.value))}
                                    />
                                    <s-paragraph>Higher value will make the button appear on top of other elements. Adjust according to your theme and other apps. Falls back to z-index in Layout tab if not set.</s-paragraph>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section >
        </>
    )
}