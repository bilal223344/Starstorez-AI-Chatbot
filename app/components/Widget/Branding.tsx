import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

const getContrastColor = (hexColor: string) => {
    // Remove the hash if it's there
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Using relative luminance formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
};

interface BrandingProps {
    settings: WidgetSettings['branding'];
    onChange: <K extends keyof WidgetSettings['branding']>(key: K, value: WidgetSettings['branding'][K]) => void;
    isGenerating?: boolean;
    onGenerate?: (prompt: string) => void;
    onBulkChange?: (changes: Partial<WidgetSettings['branding']>) => void;
}

interface ThemePreset {
    name: string;
    description: string;
    settings: Partial<WidgetSettings['branding']>;
}

export default function Branding({ settings, onChange, isGenerating, onGenerate, onBulkChange }: BrandingProps) {
    const [isOpenGblColor, setIsOpenGblColor] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // AI Theme Generator state
    const [themeDescription, setThemeDescription] = useState("");

    const presets: ThemePreset[] = [
        {
            name: "Modern Aurora",
            description: "Premium gradient & glass",
            settings: {
                primaryColor: "#6366f1",
                secondaryColor: "#f3f4f6", // Verified secondary color
                backgroundColor: "#ffffff",
                colorMode: "gradient",
                gradientStart: "#6366f1",
                gradientEnd: "#a855f7",
                textColor: "#ffffff",
                secondaryTextColor: "#1f2937",
                fontFamily: "Inter",
                fontSize: 16
            }
        },
        {
            name: "Modern Minimal",
            description: "Clean blue & white",
            settings: {
                primaryColor: "#2563EB",
                secondaryColor: "#EFF6FF",
                backgroundColor: "#FFFFFF",
                colorMode: "solid",
                textColor: "#FFFFFF",
                secondaryTextColor: "#1E293B"
            }
        },
        {
            name: "Vibrant Gradient",
            description: "Energetic gradient",
            settings: {
                primaryColor: "#FF6B6B", // Fallback
                secondaryColor: "#FFF0F0",
                backgroundColor: "#FFFFFF",
                colorMode: "gradient",
                gradientStart: "#FF6B6B",
                gradientEnd: "#FF8E53",
                textColor: "#FFFFFF",
                secondaryTextColor: "#4A0E0E"
            }
        },
        {
            name: "Isla",
            description: "Soft & inviting",
            settings: {
                primaryColor: "#F43F5E",
                secondaryColor: "#FFF1F2",
                backgroundColor: "#FFF1F2",
                colorMode: "solid",
                textColor: "#FFFFFF",
                secondaryTextColor: "#881337"
            }
        },
        {
            name: "Midnight Pro",
            description: "Sleek dark mode",
            settings: {
                primaryColor: "#3B82F6",
                secondaryColor: "#1E293B",
                backgroundColor: "#0F172A",
                colorMode: "solid",
                textColor: "#FFFFFF",
                secondaryTextColor: "#F1F5F9"
            }
        },
        {
            name: "Forest",
            description: "Natural greens",
            settings: {
                primaryColor: "#059669",
                secondaryColor: "#ECFDF5",
                backgroundColor: "#FFFFFF",
                colorMode: "solid",
                textColor: "#FFFFFF",
                secondaryTextColor: "#064E3B"
            }
        },
        {
            name: "Royal",
            description: "Elegant purple",
            settings: {
                primaryColor: "#7C3AED",
                secondaryColor: "#F5F3FF",
                backgroundColor: "#FFFFFF",
                colorMode: "solid",
                textColor: "#FFFFFF",
                secondaryTextColor: "#4C1D95"
            }
        }
    ];

    const presetGradients = [
        { start: "#1CB5E0", end: "#000851" },
        { start: "#00C9FF", end: "#92FE9D" },
        { start: "#FC466B", end: "#3F5EFB" },
        { start: "#3f2b96", end: "#a8c0ff" },
        { start: "#d53369", end: "#daae51" },
        { start: "#2193b0", end: "#6dd5ed" },
        { start: "#cc2b5e", end: "#753a88" },
        { start: "#42275a", end: "#734b6d" },
    ];

    const aestheticColors = ["#D73535", "#F4E5C2", "#295F4E", "#B2CD9C", "#FA8112", "#6E5034", "#5C6F2B", "#FFD41D", "#005461", "#061E29"];

    // High contrast text colors
    const textColors = ["#FFFFFF", "#F8FAFC", "#F1F5F9", "#E2E8F0", "#CBD5E1", "#94A3B8"];
    const darkTextColors = ["#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#000000"];

    const bgColors = ["#FFFFFF", "#F8FAFC", "#F1F5F9", "#FEF2F2", "#FFF7ED", "#FEFCE8", "#F0FDF4", "#EFF6FF", "#EEF2FF", "#FAF5FF", "#FFF1F2", "#1E293B", "#0F172A"];

    const applyPreset = (presetSettings: Partial<WidgetSettings['branding']>) => {
        if (onBulkChange) {
            onBulkChange(presetSettings);
        } else {
            Object.entries(presetSettings).forEach(([key, value]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange(key as keyof WidgetSettings['branding'], value as any);
            });
        }
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

            <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="small">
                {presets.map((preset) => {
                    const previewBg = preset.settings.colorMode === 'gradient'
                        ? `linear-gradient(135deg, ${preset.settings.gradientStart}, ${preset.settings.gradientEnd})`
                        : preset.settings.primaryColor;

                    const textColor = getContrastColor(preset.settings.backgroundColor || "#FFFFFF");

                    return (
                        <s-clickable key={preset.name} border="large" borderRadius="base" overflow="hidden" onClick={() => applyPreset(preset.settings)}>
                            <div style={{
                                height: '100px',
                                background: preset.settings.backgroundColor,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.2s ease',
                                borderTop: `6px solid ${preset.settings.primaryColor}` // Accent strip
                            }}>
                                {/* Preview Header */}
                                <div style={{
                                    height: '32px',
                                    background: previewBg,
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ width: '40%', height: '6px', background: 'rgba(255,255,255,0.4)', borderRadius: '4px' }}></div>
                                </div>
                                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <s-text><span style={{ color: textColor, fontWeight: 600 }}>{preset.name}</span></s-text>
                                    <s-text color="subdued"><span style={{ color: textColor, opacity: 0.8 }}>{preset.description}</span></s-text>
                                </div>
                            </div>
                        </s-clickable>
                    );
                })}
            </s-grid>

            {/* Theme Mode & Colors Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenGblColor(!isOpenGblColor)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Theme Colors</span></s-heading>
                        <s-icon type={isOpenGblColor ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenGblColor && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="none small small">
                            <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                <s-select
                                    label="Color Mode"
                                    value={settings.colorMode || "solid"}
                                    onChange={(e: CallbackEvent<'s-select'>) => onChange('colorMode', (e.target as HTMLSelectElement).value as "solid" | "gradient")}
                                >
                                    <s-option value="solid">Solid Color</s-option>
                                    <s-option value="gradient">Gradient</s-option>
                                </s-select>

                                {settings.colorMode === 'gradient' ? (
                                    <>
                                        <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                            <s-color-field
                                                label="Gradient Start"
                                                value={settings.gradientStart || settings.primaryColor}
                                                onChange={(e: CallbackEvent<'s-color-field'>) => onChange('gradientStart', (e.target as HTMLInputElement).value)}
                                            />
                                            <s-color-field
                                                label="Gradient End"
                                                value={settings.gradientEnd || "#333333"}
                                                onChange={(e: CallbackEvent<'s-color-field'>) => onChange('gradientEnd', (e.target as HTMLInputElement).value)}
                                            />
                                        </s-grid>
                                        <s-text color="subdued">Gradient Presets</s-text>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                                            {presetGradients.map((grad, i) => (
                                                <button
                                                    key={i}
                                                    title={`Gradient ${i + 1}`}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${grad.start}, ${grad.end})`,
                                                        width: "40px",
                                                        height: "40px",
                                                        border: "1px solid rgba(0,0,0,0.1)",
                                                        borderRadius: "50%",
                                                        cursor: "pointer",
                                                        position: 'relative'
                                                    }}
                                                    onClick={() => {
                                                        onChange('gradientStart', grad.start);
                                                        onChange('gradientEnd', grad.end);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <s-color-field
                                            label="Primary Brand Color"
                                            value={settings.primaryColor}
                                            onChange={(e: CallbackEvent<'s-color-field'>) => onChange('primaryColor', (e.target as HTMLInputElement).value)}
                                        />
                                        <div style={{ display: "flex", flexWrap: "wrap", marginTop: "8px" }}>
                                            {aestheticColors.map((color) => (
                                                <button
                                                    key={color}
                                                    style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
                                                    onClick={() => onChange('primaryColor', color)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </s-stack>

                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                    <s-color-field
                                        label="Primary Text Color"
                                        value={settings.textColor || "#ffffff"}
                                        onChange={(e: CallbackEvent<'s-color-field'>) => onChange('textColor', (e.target as HTMLInputElement).value)}
                                    />
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {textColors.map((color) => (
                                            <button
                                                key={color}
                                                style={{ backgroundColor: color, width: "24px", height: "24px", border: "1px solid #e2e8f0", borderRadius: "4px", cursor: "pointer" }}
                                                onClick={() => onChange('textColor', color)}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </s-stack>
                                <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                    <s-color-field
                                        label="Secondary Text Color"
                                        value={settings.secondaryTextColor || "#000000"}
                                        onChange={(e: CallbackEvent<'s-color-field'>) => onChange('secondaryTextColor', (e.target as HTMLInputElement).value)}
                                    />
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {darkTextColors.map((color) => (
                                            <button
                                                key={color}
                                                style={{ backgroundColor: color, width: "24px", height: "24px", border: "1px solid #e2e8f0", borderRadius: "4px", cursor: "pointer" }}
                                                onClick={() => onChange('secondaryTextColor', color)}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </s-stack>
                            </s-grid>

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
                                            style={{ backgroundColor: color, width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
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
                                    {bgColors.map((color) => (
                                        <button
                                            key={color}
                                            style={{ backgroundColor: color, width: "32px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }}
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
                        <s-stack gap="small" padding="none small small">
                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
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
                                <s-select
                                    label="Font weight"
                                    value={settings.fontWeight || "400"}
                                    onChange={(e: CallbackEvent<'s-select'>) => onChange('fontWeight', (e.target as HTMLSelectElement).value)}
                                >
                                    <s-option value="300">Light (300)</s-option>
                                    <s-option value="400">Regular (400)</s-option>
                                    <s-option value="500">Medium (500)</s-option>
                                    <s-option value="600">Semi Bold (600)</s-option>
                                    <s-option value="700">Bold (700)</s-option>
                                </s-select>
                            </s-grid>
                            <s-number-field
                                label="Font size (px)"
                                min={10}
                                max={32}
                                step={1}
                                value={settings.fontSize.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('fontSize', parseFloat((e.target as HTMLInputElement).value))}
                            />
                        </s-stack>
                    </>
                )}


            </s-section>

        </s-stack>
    )
}
