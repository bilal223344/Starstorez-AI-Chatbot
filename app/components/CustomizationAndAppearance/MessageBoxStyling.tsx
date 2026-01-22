import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface MessageBoxData {
    borderRadiusTop: number;
    borderRadiusRight: number;
    borderRadiusBottom: number;
    borderRadiusLeft: number;
    messageSpacing: number;
    paddingVertical: number;
    paddingHorizontal: number;

    // Behavior
    typingStyle: string;
    typingIndicator: string;

    timestampDisplay: boolean;
}

interface MessageBoxStylingProps {
    data: MessageBoxData;
    onUpdate: <K extends keyof MessageBoxData>(key: K, value: MessageBoxData[K]) => void;
}

export default function MessageBoxStyling({ data, onUpdate }: MessageBoxStylingProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Message Box Styling</span></s-heading>

                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Chat Window Greeting */}
                                <s-grid gap="small" gridTemplateColumns="1fr 1fr">
                                    <s-stack gap="small-200">
                                        <s-number-field
                                            label="Message Spacing"
                                            value={data.messageSpacing.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("messageSpacing", Number(e.currentTarget.value))}
                                            suffix="px"
                                            min={4}
                                            max={16}
                                            details="Gap between messages slider"
                                        />
                                    </s-stack>
                                </s-grid>

                                <s-stack gap="small-200">
                                    <s-heading>Border radius slider</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="small">
                                        <s-number-field
                                            label="Top"
                                            suffix="px"
                                            value={data.borderRadiusTop.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadiusTop", Number(e.currentTarget.value))}
                                        />
                                        <s-number-field
                                            label="Right"
                                            suffix="px"
                                            value={data.borderRadiusRight.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadiusRight", Number(e.currentTarget.value))}
                                        />
                                        <s-number-field
                                            label="Bottom"
                                            suffix="px"
                                            value={data.borderRadiusBottom.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadiusBottom", Number(e.currentTarget.value))}
                                        />
                                        <s-number-field
                                            label="Left"
                                            suffix="px"
                                            value={data.borderRadiusLeft.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadiusLeft", Number(e.currentTarget.value))}
                                        />
                                    </s-grid>
                                </s-stack>

                                {/* Chat Window Greeting */}
                                <s-stack gap="small-200">
                                    <s-heading>Message Padding</s-heading>
                                    <s-grid gap="small" gridTemplateColumns="1fr 1fr">
                                        <s-stack gap="small-200">
                                            <s-number-field label="Vertical padding slider"
                                                value={data.paddingVertical.toString()}
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("paddingVertical", Number(e.currentTarget.value))}
                                                min={8} max={20} suffix="px"
                                            />
                                        </s-stack>
                                        <s-stack gap="small-200">
                                            <s-number-field label="Horizontal padding slider"
                                                value={data.paddingHorizontal.toString()}
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("paddingHorizontal", Number(e.currentTarget.value))}
                                                min={12} max={24} suffix="px"
                                            />
                                        </s-stack>
                                    </s-grid>
                                </s-stack>

                                {/* Typing Style */}
                                <s-box>
                                    <s-heading>Tying Style</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-clickable
                                            onClick={() => onUpdate("typingStyle", "In the Msg Box")}
                                            background={data.typingStyle === "In the Msg Box" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>In the Msg Box</s-heading>
                                        </s-clickable>
                                        <s-clickable
                                            onClick={() => onUpdate("typingStyle", "Top Nav")}
                                            background={data.typingStyle === "Top Nav" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>Top Nav</s-heading>
                                        </s-clickable>
                                    </s-grid>
                                </s-box>

                                {/* Typing Indicators */}
                                <s-box>
                                    <s-heading>Typing Indicators</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-clickable
                                            onClick={() => onUpdate("typingIndicator", "Dots (animated)")}
                                            background={data.typingIndicator === "Dots (animated)" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>Dots (animated)</s-heading>
                                        </s-clickable>
                                        <s-clickable
                                            onClick={() => onUpdate("typingIndicator", "AI is typing...")}
                                            background={data.typingIndicator === "AI is typing..." ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>AI is typing...</s-heading>
                                        </s-clickable>
                                    </s-grid>
                                </s-box>

                                {/* Timestamp display toggle */}
                                <s-stack gap="small-200">
                                    <s-heading>Timestamp display</s-heading>
                                    <s-switch
                                        label="Show message timestamps"
                                        checked={data.timestampDisplay}
                                        details="Toggle visibility of message timestamps in chat."
                                        onChange={(e: CallbackEvent<"s-switch">) => onUpdate("timestampDisplay", e.currentTarget.checked)}
                                    />
                                </s-stack>

                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    )
}