import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface TopNavData {
    headerHeight: number;
    headerContent: string;
    showOnlineStatus: boolean;
    onlineStatusType: string;
    customOnlineText: string;
}

interface TopNavigationStylingProps {
    data: TopNavData;
    onUpdate: <K extends keyof TopNavData>(key: K, value: TopNavData[K]) => void;
}

export default function TopNavigationStyling({ data, onUpdate }: TopNavigationStylingProps) {

    const [isOpen, setIsOpen] = useState(false);

    // Helper: Determine what text to show in the "Read Only" preview box
    // If 'Custom' is selected, show the custom text input, otherwise show the selected option.
    const statusPreviewText = data.onlineStatusType === "Custom"
        ? (data.customOnlineText || "Custom Status")
        : data.onlineStatusType;

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Top Navigation Styling</span></s-heading>

                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Header Height */}
                                <s-number-field label="Header Height"
                                    value={data.headerHeight.toString()}
                                    min={40} max={90} suffix="px"
                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("headerHeight", Number(e.currentTarget.value))}
                                />

                                {/* Header Content */}
                                <s-text-field
                                    label="Header Content"
                                    value={data.headerContent}
                                    onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("headerContent", e.currentTarget.value)}
                                />

                                {/* Online Status Section */}
                                <s-stack gap="small-200">
                                    <s-heading>Online Status Indicator</s-heading>
                                    {/* Toggle Visibility */}
                                    <s-switch
                                        label="Show/hide toggle"
                                        checked={data.showOnlineStatus}
                                        onChange={(e: CallbackEvent<"s-switch">) => onUpdate("showOnlineStatus", e.currentTarget.checked)}
                                    />
                                    <s-grid gridTemplateColumns="auto auto 1fr" gap="small" alignItems="center" justifyContent="center">
                                        {/* 1. Preview (Read Only) */}
                                        <s-text-field
                                            value={statusPreviewText}
                                            readOnly
                                            disabled={!data.showOnlineStatus}
                                        />
                                        {/* 2. Type Selector */}
                                        <s-select
                                            value={data.onlineStatusType}
                                            disabled={!data.showOnlineStatus}
                                            onChange={(e: CallbackEvent<"s-select">) => onUpdate("onlineStatusType", e.currentTarget.value)}
                                        >
                                            <s-option value="Online">Online</s-option>
                                            <s-option value="Active">Active</s-option>
                                            <s-option value="Available">Available</s-option>
                                            <s-option value="Custom">Custom</s-option>
                                        </s-select>
                                        {/* 3. Custom Text Input (Only visible/enabled if 'Custom' is selected) */}
                                        <s-text-field
                                            placeholder="Type status..."
                                            value={data.customOnlineText}
                                            disabled={!data.showOnlineStatus}
                                            onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("customOnlineText", e.currentTarget.value)}
                                        />
                                    </s-grid>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    )
}