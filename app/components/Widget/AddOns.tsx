import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

interface AddOnsProps {
    settings: WidgetSettings['addOns'];
    onChange: <K extends keyof WidgetSettings['addOns']>(key: K, value: WidgetSettings['addOns'][K]) => void;
}

export default function AddOns({ settings, onChange }: AddOnsProps) {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(true);

    const bgColors = ["#FCF8F8", "#F0F0DB", "#ECECEC", "#EFE1B5", "#F0FFDF", "#F3F4F4", "#2B2A2A", "#3A2525", "#213448", "#1B211A"]

    const handleSliderChange = <K extends keyof WidgetSettings['addOns']['productSlider']>(
        key: K,
        value: WidgetSettings['addOns']['productSlider'][K]
    ) => {
        onChange('productSlider', { ...settings.productSlider, [key]: value });
    };

    return (
        <s-stack gap="base">
            <s-stack gap="base" overflow="hidden" background="base" direction="inline" border="base" borderRadius="base" padding="base" alignItems="center" justifyContent="space-between">
                <s-stack direction="block" gap="small-200" >
                    <s-heading>Product Slider</s-heading>
                    <s-text>Showcase products in chat</s-text>
                </s-stack>
                <s-switch
                    label="Enable Product Slider"
                    checked={settings.productSlider.enabled}
                    onChange={(e: CallbackEvent<"s-switch">) => handleSliderChange('enabled', e.currentTarget.checked)}
                />
            </s-stack>

            {/* Card Style Section */}
            {settings.productSlider.enabled && (
                <s-section padding="none" >
                    <s-clickable onClick={() => setIsOpenDisplayRule(!isOpenDisplayRule)}>
                        <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Card Style</span></s-heading>
                            <s-icon type={isOpenDisplayRule ? "chevron-up" : "chevron-down"} />
                        </s-stack>
                    </s-clickable>

                    {isOpenDisplayRule && (
                        <>
                            <s-divider />
                            <s-stack gap="small" padding="small-200 base base">
                                <s-number-field
                                    label="Card Width"
                                    value={settings.productSlider.cardWidth.toString()}
                                    min={40}
                                    max={300}
                                    onChange={(e: CallbackEvent<"s-number-field">) => handleSliderChange('cardWidth', parseFloat(e.currentTarget.value))}
                                />
                                <s-number-field
                                    label="Card Height"
                                    value={settings.productSlider.cardHeight.toString()}
                                    min={40}
                                    max={300}
                                    onChange={(e: CallbackEvent<"s-number-field">) => handleSliderChange('cardHeight', parseFloat(e.currentTarget.value))}
                                />

                                <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                    <s-color-field
                                        label="Card Background"
                                        placeholder="Select a color"
                                        value={settings.productSlider.cardBackground}
                                        onChange={(e: CallbackEvent<"s-color-field">) => handleSliderChange('cardBackground', e.currentTarget.value)}
                                    />
                                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                                        {bgColors.map((color) => (
                                            <button
                                                key={color}
                                                style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
                                                onClick={() => handleSliderChange('cardBackground', color)}
                                            />
                                        ))}
                                    </div>
                                </s-stack>
                            </s-stack>
                        </>
                    )}
                </s-section>
            )}
        </s-stack>
    )
}