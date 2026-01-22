import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";
import {
    IconSend,
    IconArrowRight,
    IconArrowForward,
    IconChevronRight,
    IconArrowUpRight,
    IconArrowRightCircle,
    IconSend2,
    IconPlane
} from "@tabler/icons-react";

export interface FooterData {
    backgroundColor: string;
    inputTextColor: string;
    placeholderColor: string;
    inputFontSize: number;
    inputPaddingVertical: number;
    inputPaddingHorizontal: number;
    borderTopColor: string;
    borderRadiusBottom: number;
    sendButtonBackgroundColor: string;
    sendButtonSize: number;
    sendButtonBorderRadius: number;
    sendButtonIconColor: string;
    sendButtonHoverOpacity: number;
    sendIconName: string;
    sendIconSize: number;
}

interface FooterStylingProps {
    data: FooterData;
    onUpdate: <K extends keyof FooterData>(key: K, value: FooterData[K]) => void;
}

export default function FooterStyling({ data, onUpdate }: FooterStylingProps) {
    const [isOpen, setIsOpen] = useState(false);

    const bgColors = ["#FFFFFF", "#FCF8F8", "#F5F5F5", "#F0F0F0", "#FAFAFA", "#FFF8F0", "#F8F8FF", "#F0FFF0", "#FFF5F5", "#F5F5FF"];
    const fontColors = ["#111F35", "#333333", "#222222", "#000000", "#362F4F", "#2D3C59", "#1A2A4F", "#444444", "#555555", "#666666"];

    const sendIconOptions = [
        { name: "send", label: "Send", icon: IconSend },
        { name: "arrow-right", label: "Arrow Right", icon: IconArrowRight },
        { name: "plane", label: "Plane", icon: IconPlane },
        { name: "arrow-forward", label: "Arrow Forward", icon: IconArrowForward },
        { name: "chevron-right", label: "Chevron Right", icon: IconChevronRight },
        { name: "arrow-up-right", label: "Arrow Up Right", icon: IconArrowUpRight },
        { name: "arrow-right-circle", label: "Arrow Right Circle", icon: IconArrowRightCircle },
        { name: "send2", label: "Send 2", icon: IconSend2 }
    ];

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Footer Styling</span></s-heading>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="base">
                        <s-stack gap="small-200">
                            {/* Footer Background Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Footer Background Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.backgroundColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("backgroundColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {bgColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("backgroundColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.backgroundColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* Input Text Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Input Text Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.inputTextColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("inputTextColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {fontColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("inputTextColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.inputTextColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* Placeholder Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Placeholder Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.placeholderColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("placeholderColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {fontColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("placeholderColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.placeholderColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* Border Top Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Border Top Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.borderTopColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("borderTopColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {["#EEEEEE", "#E0E0E0", "#DDDDDD", "#CCCCCC", "#999999", "#666666", "#333333"].map((color) => (
                                                <button key={color} onClick={() => onUpdate("borderTopColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.borderTopColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* Input Font Size */}
                            <s-number-field
                                label="Input Font Size"
                                value={data.inputFontSize.toString()}
                                min={12}
                                max={20}
                                suffix="px"
                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("inputFontSize", Number(e.currentTarget.value))}
                            />

                            {/* Input Padding */}
                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                <s-number-field
                                    label="Input Padding Vertical"
                                    value={data.inputPaddingVertical.toString()}
                                    min={4}
                                    max={24}
                                    suffix="px"
                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("inputPaddingVertical", Number(e.currentTarget.value))}
                                />
                                <s-number-field
                                    label="Input Padding Horizontal"
                                    value={data.inputPaddingHorizontal.toString()}
                                    min={8}
                                    max={32}
                                    suffix="px"
                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("inputPaddingHorizontal", Number(e.currentTarget.value))}
                                />
                            </s-grid>

                            {/* Footer Border Radius (Bottom) */}
                            <s-number-field
                                label="Footer Corner Radius (Bottom)"
                                value={data.borderRadiusBottom.toString()}
                                min={0}
                                max={24}
                                suffix="px"
                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadiusBottom", Number(e.currentTarget.value))}
                            />

                            {/* Send Button Styling Section */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Send Button Styling</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    {/* Send Button Background Color */}
                                    <s-box>
                                        <s-heading>Button Background Color</s-heading>
                                        <s-color-field placeholder="Select a color" value={data.sendButtonBackgroundColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("sendButtonBackgroundColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {["transparent", "#FFFFFF", "#F5F5F5", "#E0E0E0", "#D73535", "#1CB5E0", "#000851"].map((color) => (
                                                <button key={color} onClick={() => onUpdate("sendButtonBackgroundColor", color)} style={{ width: "40px", height: "40px", background: color === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : color, backgroundSize: color === "transparent" ? "10px 10px, 10px 10px" : "auto", backgroundPosition: color === "transparent" ? "0 0, 5px 5px" : "auto", boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.sendButtonBackgroundColor === color ? "2px solid black" : "1px solid #dee3ed" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>

                                    {/* Send Button Icon Color */}
                                    <s-box>
                                        <s-heading>Button Icon Color</s-heading>
                                        <s-color-field placeholder="Select a color" value={data.sendButtonIconColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("sendButtonIconColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {["#D73535", "#1CB5E0", "#000851", "#333333", "#000000", "#FFFFFF", "#666666"].map((color) => (
                                                <button key={color} onClick={() => onUpdate("sendButtonIconColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.sendButtonIconColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>

                                    {/* Send Button Size */}
                                    <s-number-field
                                        label="Button Size"
                                        value={data.sendButtonSize.toString()}
                                        min={24}
                                        max={48}
                                        suffix="px"
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("sendButtonSize", Number(e.currentTarget.value))}
                                    />

                                    {/* Send Button Border Radius */}
                                    <s-number-field
                                        label="Button Border Radius"
                                        value={data.sendButtonBorderRadius.toString()}
                                        min={0}
                                        max={24}
                                        suffix="px"
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("sendButtonBorderRadius", Number(e.currentTarget.value))}
                                    />

                                    {/* Send Button Hover Opacity */}
                                    <s-number-field
                                        label="Button Hover Opacity"
                                        value={data.sendButtonHoverOpacity.toString()}
                                        min={0.5}
                                        max={1}
                                        step={0.1}
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("sendButtonHoverOpacity", Number(e.currentTarget.value))}
                                    />

                                    {/* Send Button Icon */}
                                    <s-box>
                                        <s-heading>Send Button Icon</s-heading>
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small-200">
                                            {sendIconOptions.map((option) => {
                                                const IconComponent = option.icon;
                                                return (
                                                    <button
                                                        key={option.name}
                                                        onClick={() => onUpdate("sendIconName", option.name)}
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                            border: data.sendIconName === option.name ? "2px solid blue" : "1px solid #dee3ed",
                                                            borderRadius: "8px",
                                                            padding: 0,
                                                            background: data.sendIconName === option.name ? "#f0f0f0" : "transparent",
                                                            transition: "all 0.2s"
                                                        }}
                                                        title={option.label}
                                                    >
                                                        <IconComponent size={24} color={data.sendButtonIconColor} />
                                                    </button>
                                                );
                                            })}
                                        </s-stack>
                                        <s-box paddingBlockStart="small">
                                            <s-number-field
                                                label="Icon Size"
                                                value={data.sendIconSize.toString()}
                                                min={8}
                                                max={24}
                                                suffix="px"
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("sendIconSize", Number(e.currentTarget.value))}
                                            />
                                        </s-box>
                                    </s-box>
                                </s-stack>
                            </s-box>
                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}
