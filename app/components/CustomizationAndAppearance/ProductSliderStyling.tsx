import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

// --- Types ---
export interface ProductSliderData {
    enabled: boolean;
    cardWidth: number;
    cardHeight: number;
    cardPadding: number;
    cardBorderRadius: number;
    cardGap: number;
    imageHeight: number;
    imageBorderRadius: number;
    titleFontSize: number;
    priceFontSize: number;
    showPrice: boolean;
    showAskButton: boolean;
    askButtonSize: number;
    askButtonIconColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
}

interface ProductSliderStylingProps {
    data: ProductSliderData;
    onUpdate: <K extends keyof ProductSliderData>(key: K, value: ProductSliderData[K]) => void;
}

export default function ProductSliderStyling({ data, onUpdate }: ProductSliderStylingProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Default values to prevent undefined errors
    const safeData: ProductSliderData = data || {
        enabled: false,
        cardWidth: 160,
        cardHeight: 240,
        cardPadding: 12,
        cardBorderRadius: 12,
        cardGap: 12,
        imageHeight: 120,
        imageBorderRadius: 8,
        titleFontSize: 14,
        priceFontSize: 14,
        showPrice: true,
        showAskButton: true,
        askButtonSize: 28,
        askButtonIconColor: "#666666",
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderWidth: 1
    };

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Product Slider Styling</span></s-heading>
                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Enable/Disable Toggle */}
                                <s-switch
                                    label="Show Product Slider"
                                    checked={safeData.enabled}
                                    onChange={(e: CallbackEvent<"s-switch">) => onUpdate("enabled", e.currentTarget.checked)}
                                    details="Display product suggestions in a slider format within the chatbot"
                                />

                                {safeData.enabled && (
                                    <>
                                        {/* Card Dimensions */}
                                        <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                            <s-heading>Card Dimensions</s-heading>
                                            <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                                <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                                    <s-number-field
                                                        label="Card Width"
                                                        value={safeData.cardWidth.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("cardWidth", Number(e.currentTarget.value))}
                                                        min={120}
                                                        max={300}
                                                        suffix="px"
                                                    />
                                                    <s-number-field
                                                        label="Card Height"
                                                        value={safeData.cardHeight.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("cardHeight", Number(e.currentTarget.value))}
                                                        min={180}
                                                        max={400}
                                                        suffix="px"
                                                    />
                                                </s-grid>
                                                <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small">
                                                    <s-number-field
                                                        label="Card Padding"
                                                        value={safeData.cardPadding.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("cardPadding", Number(e.currentTarget.value))}
                                                        min={4}
                                                        max={20}
                                                        suffix="px"
                                                    />
                                                    <s-number-field
                                                        label="Card Border Radius"
                                                        value={safeData.cardBorderRadius.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("cardBorderRadius", Number(e.currentTarget.value))}
                                                        min={0}
                                                        max={30}
                                                        suffix="px"
                                                    />
                                                    <s-number-field
                                                        label="Gap Between Cards"
                                                        value={safeData.cardGap.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("cardGap", Number(e.currentTarget.value))}
                                                        min={8}
                                                        max={24}
                                                        suffix="px"
                                                    />
                                                </s-grid>
                                            </s-stack>
                                        </s-box>

                                        {/* Image Settings */}
                                        <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                            <s-heading>Product Image</s-heading>
                                            <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                                <s-number-field
                                                    label="Image Height"
                                                    value={safeData.imageHeight.toString()}
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("imageHeight", Number(e.currentTarget.value))}
                                                    min={80}
                                                    max={200}
                                                    suffix="px"
                                                />
                                                <s-number-field
                                                    label="Image Border Radius"
                                                    value={safeData.imageBorderRadius.toString()}
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("imageBorderRadius", Number(e.currentTarget.value))}
                                                    min={0}
                                                    max={20}
                                                    suffix="px"
                                                />
                                            </s-stack>
                                        </s-box>

                                        {/* Typography */}
                                        <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                            <s-heading>Typography</s-heading>
                                            <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                                <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                                    <s-number-field
                                                        label="Title Font Size"
                                                        value={safeData.titleFontSize.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("titleFontSize", Number(e.currentTarget.value))}
                                                        min={10}
                                                        max={18}
                                                        suffix="px"
                                                    />
                                                    <s-number-field
                                                        label="Price Font Size"
                                                        value={safeData.priceFontSize.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("priceFontSize", Number(e.currentTarget.value))}
                                                        min={10}
                                                        max={18}
                                                        suffix="px"
                                                    />
                                                </s-grid>
                                                <s-switch
                                                    label="Show Price"
                                                    checked={safeData.showPrice}
                                                    onChange={(e: CallbackEvent<"s-switch">) => onUpdate("showPrice", e.currentTarget.checked)}
                                                />
                                            </s-stack>
                                        </s-box>

                                        {/* Ask Button Settings */}
                                        <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                            <s-heading>Ask Me More Details Button</s-heading>
                                            <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                                <s-switch
                                                    label="Show Ask Button"
                                                    checked={safeData.showAskButton}
                                                    onChange={(e: CallbackEvent<"s-switch">) => onUpdate("showAskButton", e.currentTarget.checked)}
                                                />
                                                {safeData.showAskButton && (
                                                    <>
                                                        <s-number-field
                                                            label="Button Size"
                                                            value={safeData.askButtonSize.toString()}
                                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("askButtonSize", Number(e.currentTarget.value))}
                                                            min={20}
                                                            max={40}
                                                            suffix="px"
                                                        />
                                                        <s-color-field
                                                            label="Icon Color"
                                                            value={safeData.askButtonIconColor}
                                                            onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("askButtonIconColor", e.currentTarget.value)}
                                                        />
                                                    </>
                                                )}
                                            </s-stack>
                                        </s-box>

                                        {/* Border & Background */}
                                        <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                            <s-heading>Border & Background</s-heading>
                                            <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                                <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small">
                                                    <s-color-field
                                                        label="Background Color"
                                                        value={safeData.backgroundColor}
                                                        onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("backgroundColor", e.currentTarget.value)}
                                                    />
                                                    <s-color-field
                                                        label="Border Color"
                                                        value={safeData.borderColor}
                                                        onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("borderColor", e.currentTarget.value)}
                                                    />
                                                    <s-number-field
                                                        label="Border Width"
                                                        value={safeData.borderWidth.toString()}
                                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderWidth", Number(e.currentTarget.value))}
                                                        min={0}
                                                        max={3}
                                                        suffix="px"
                                                    />
                                                </s-grid>
                                            </s-stack>
                                        </s-box>
                                    </>
                                )}
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    );
}
