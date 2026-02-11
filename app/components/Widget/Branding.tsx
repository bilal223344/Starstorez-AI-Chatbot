import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface BrandingProps {
    settings: WidgetSettings['branding'];
    onChange: <K extends keyof WidgetSettings['branding']>(key: K, value: WidgetSettings['branding'][K]) => void;
    isGenerating?: boolean;
    onGenerate?: (prompt: string) => void;
}

export default function Branding({ settings, onChange, isGenerating, onGenerate }: BrandingProps) {
    const [isOpenGblColor, setIsOpenGblColor] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // AI Theme Generator state
    const [themeDescription, setThemeDescription] = useState("");

    const presets = [
        { name: "Modern Minimal", description: "Clean and simple design", color: "#2563EB" },
        { name: "Vibrant Gradient", description: "Colorful and energetic", color: "#FF6B6B" },
        { name: "Professional Dark", description: "Sleek dark theme", color: "#1A1A1A" },
        { name: "Playful Colorful", description: "Fun and vibrant", color: "#C44569" },
        { name: "Elegant Classic", description: "Timeless and refined", color: "#2C3E50" },
        { name: "Soft Pastel", description: "Gentle and calming", color: "#B8A9E3" },
        { name: "Ocean Breeze", description: "Fresh and modern", color: "#0EA5E9" },
        { name: "Midnight Blue", description: "Deep and sophisticated", color: "#1E293B" },
        { name: "Mint Fresh", description: "Clean and refreshing", color: "#10B981" },
        { name: "Rose Gold", description: "Elegant and feminine", color: "#F43F5E" },
        { name: "Arctic White", description: "Minimal and pristine", color: "#F1F5F9" }
    ];

    const aestheticColors = ["#D73535", "#F4E5C2", "#295F4E", "#B2CD9C", "#FA8112", "#6E5034", "#5C6F2B", "#FFD41D", "#005461", "#061E29"];
    const fontColors = ["#111F35", "#ECECEC", "#362F4F", "#FCF8F8", "#222222", "#EDFFF0", "#000000", "#FFF8DE", "#2D3C59", "#EFE9E3", "#1A2A4F"];
    const bgColors = ["#FCF8F8", "#F0F0DB", "#ECECEC", "#EFE1B5", "#F0FFDF", "#F3F4F4", "#2B2A2A", "#3A2525", "#213448", "#1B211A"]

    const applyPreset = (color: string) => {
        onChange('primaryColor', color);
        // We could also set secondary/bg based on preset if we had that data
    };

    return (
        <s-stack gap="base">
            {/* AI Theme Generator */}
            <s-section padding="none">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "linear-gradient(to bottom right, #4f46e5, #7e22ce)" }}>
                    <s-stack padding="base" gap="small-200">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Sparkles size={18} color="whitesmoke" />
                            <s-text color="subdued"><span style={{ color: "whitesmoke" }}>AI Theme Generator</span></s-text>
                        </div>
                        <s-paragraph>
                            <span style={{ color: "whitesmoke" }}>
                                Describe your brand (e.g. &quot;Luxury gold watch store&quot;, &quot;Minimalist eco-friendly shop&quot;).
                            </span>
                        </s-paragraph>
                        <s-grid gridTemplateColumns="1fr auto" gap="small">
                            <s-text-field
                                value={themeDescription}
                                onInput={(e: CallbackEvent<'s-text-field'>) => setThemeDescription((e.target as HTMLInputElement).value)}
                                placeholder="e.g. Luxury gold and black theme"
                                disabled={isGenerating}
                            />
                            <s-button
                                type="button"
                                icon="wand"
                                variant="secondary"
                                loading={isGenerating}
                                onClick={() => onGenerate?.(themeDescription)}
                                disabled={!themeDescription.trim() || isGenerating}
                            />
                        </s-grid>
                    </s-stack>
                </div>
            </s-section>

            {/* Preset */}
            <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="small">
                {presets.map((preset) => (
                    <s-clickable key={preset.name} border="base" borderRadius="base" overflow="hidden" onClick={() => applyPreset(preset.color)}>
                        <div style={{ background: hexToRgba(preset.color, 0.6) }}>
                            <s-stack gap="small-200" padding="small">
                                <s-text>{preset.name}</s-text>
                                <s-text>{preset.description}</s-text>
                            </s-stack>
                        </div>
                    </s-clickable>
                ))}
            </s-grid>

            {/* Global Color Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenGblColor(!isOpenGblColor)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Global Color</span></s-heading>
                        <s-icon type={isOpenGblColor ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenGblColor && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="none small small">
                            <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                <s-color-field
                                    label="Primary Brand"
                                    placeholder="Select a color"
                                    value={settings.primaryColor}
                                    onChange={(e: CallbackEvent<'s-color-field'>) => onChange('primaryColor', (e.target as HTMLInputElement).value)}
                                />
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    {aestheticColors.map((color) => (
                                        <button
                                            key={color}
                                            style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
                                            onClick={() => onChange('primaryColor', color)}
                                        />
                                    ))}
                                </div>
                            </s-stack>

                            <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                <s-color-field
                                    label="Secondary Accent"
                                    placeholder="Select a color"
                                    value={settings.secondaryColor}
                                    onChange={(e: CallbackEvent<'s-color-field'>) => onChange('secondaryColor', (e.target as HTMLInputElement).value)}
                                />
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    {bgColors.map((color) => (
                                        <button
                                            key={color}
                                            style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
                                            onClick={() => onChange('secondaryColor', color)}
                                        />
                                    ))}
                                </div>
                            </s-stack>

                            <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                <s-color-field
                                    label="Background"
                                    placeholder="Select a color"
                                    value={settings.backgroundColor}
                                    onChange={(e: CallbackEvent<'s-color-field'>) => onChange('backgroundColor', (e.target as HTMLInputElement).value)}
                                />
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    {fontColors.map((color) => (
                                        <button
                                            key={color}
                                            style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
                                            onClick={() => onChange('backgroundColor', color)}
                                        />
                                    ))}
                                </div>
                            </s-stack>
                        </s-stack>
                    </>
                )}

            </s-section>

            {/* Typography Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Typography</span></s-heading>
                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-grid gridTemplateColumns="1fr auto" gap="small" padding="none small small">
                            <s-select
                                label="Font family"
                                value={settings.fontFamily}
                                onChange={(e: CallbackEvent<'s-select'>) => onChange('fontFamily', (e.target as HTMLSelectElement).value)}
                            >
                                <s-option value="Inter">Inter</s-option>
                                <s-option value="Poppins">Poppins</s-option>
                                <s-option value="Roboto">Roboto</s-option>
                                <s-option value="Open Sans">Open Sans</s-option>
                                <s-option value="Lato">Lato</s-option>
                                <s-option value="Montserrat">Montserrat</s-option>
                                <s-option value="Raleway">Raleway</s-option>
                                <s-option value="Nunito">Nunito</s-option>
                                <s-option value="Playfair Display">Playfair Display</s-option>
                                <s-option value="Merriweather">Merriweather</s-option>
                                <s-option value="Source Sans Pro">Source Sans Pro</s-option>
                                <s-option value="Ubuntu">Ubuntu</s-option>
                                <s-option value="Oswald">Oswald</s-option>
                                <s-option value="PT Sans">PT Sans</s-option>
                                <s-option value="Noto Sans">Noto Sans</s-option>
                            </s-select>
                            <s-number-field
                                label="Font size (px)"
                                min={10}
                                max={32}
                                step={1}
                                value={settings.fontSize.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('fontSize', parseFloat((e.target as HTMLInputElement).value))}
                            />
                        </s-grid>
                    </>
                )}

            </s-section>

        </s-stack>
    )
}