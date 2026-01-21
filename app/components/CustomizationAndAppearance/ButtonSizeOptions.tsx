import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface ButtonSizeData {
    size: number;
}

interface ButtonSizeOptionsProps {
    data: ButtonSizeData;
    onUpdate: <K extends keyof ButtonSizeData>(key: K, value: ButtonSizeData[K]) => void;
}

export default function ButtonSizeOptions({ data, onUpdate }: ButtonSizeOptionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Preset options
    const presets = [48, 60, 72];

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Button Size Options</span></s-heading>

                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Button Size */}
                                <s-stack gap="small-200">
                                    <s-heading>Button Size</s-heading>

                                    {/* Presets Container */}
                                    <s-box padding="small" border="base base dashed" borderRadius="base" background="subdued">
                                        <s-stack direction="inline" gap="large">
                                            {/* "Custom" Badge (Visual indicator only) */}
                                            <div style={{
                                                height: "48px", background: "white", color: "black", padding: "0px 2em",
                                                borderRadius: "1em", display: "flex", justifyContent: "center", alignItems: "center",
                                                boxShadow: !presets.includes(data.size) ? "transparent 0 0 0 3px,rgba(18, 18, 18, .1) 0 6px 20px" : "none",
                                                opacity: !presets.includes(data.size) ? 1 : 0.6
                                            }}>
                                                Custom
                                            </div>

                                            {/* Preset Buttons */}
                                            {presets.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => onUpdate("size", size)}
                                                    style={{
                                                        height: `${size}px`, width: `${size}px`,
                                                        background: "#D73535",
                                                        borderRadius: "999px",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        color: "white", cursor: "pointer", outline: "none",
                                                        border: data.size === size ? "2px solid black" : "none",
                                                        boxShadow: data.size === size ? "0px 4px 10px rgba(0,0,0,0.2)" : "none",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                >
                                                    <p style={{ fontSize: "0.72em", margin: 0 }}>{size}*{size}px</p>
                                                </button>
                                            ))}

                                        </s-stack>
                                    </s-box>
                                    <s-stack gap="small-200">
                                        <s-heading>Custom Size</s-heading>
                                        <s-grid gridTemplateColumns="auto auto 1fr" gap="base">
                                            {/* Read-only preview showing W x H */}
                                            <s-text-field
                                                value={`${data.size}x${data.size}`}
                                                suffix="px"
                                                readOnly
                                            />

                                            {/* Number input to change size */}
                                            <s-number-field
                                                min={20}
                                                max={100}
                                                value={data.size.toString()}
                                                suffix="px"
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("size", Number(e.currentTarget.value))}
                                            />
                                        </s-grid>
                                        <s-paragraph>Width may be adjusted automatically to fit the label.</s-paragraph>
                                    </s-stack>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    )
}