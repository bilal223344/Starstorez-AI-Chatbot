import { Bot, User } from "lucide-react";
import { useState } from "react";
import type { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

const AVATARS = [
    { id: 1, gradient: 'from-blue-400 to-indigo-500', icon: <User size={20} className="text-white" /> },
    { id: 2, gradient: 'from-purple-400 to-pink-500', icon: <Bot size={20} className="text-white" /> },
    { id: 3, gradient: 'from-amber-300 to-orange-500', icon: <User size={20} className="text-white" /> },
    { id: 4, gradient: 'from-red-400 to-rose-500', icon: <User size={20} className="text-white" /> },
    { id: 5, gradient: 'from-teal-400 to-emerald-500', icon: <Bot size={20} className="text-white" /> },
];

interface WindowProps {
    settings: WidgetSettings['window'];
    onChange: <K extends keyof WidgetSettings['window']>(key: K, value: WidgetSettings['window'][K]) => void;
}

export default function Window({ settings, onChange }: WindowProps) {
    const [isOpenHD, setIsOpenHD] = useState(false);
    const [isOpenD, setIsOpenD] = useState(false);
    const [isOpenMB, setIsOpenMB] = useState(false);

    const updateBorderRadius = (corner: 'tl' | 'tr' | 'br' | 'bl', value: number) => {
        onChange('messageBorderRadius', {
            ...settings.messageBorderRadius,
            [corner]: value
        });
    };

    return (
        <s-stack gap="base">
            {/* Header Design Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenHD(!isOpenHD)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Header Design</span></s-heading>
                        <s-icon type={isOpenHD ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenHD && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small base base">
                            <div style={{ display: "flex", gap: "8px" }}>
                                {AVATARS.map((avatar) => {
                                    const isActive = avatar.id === settings.avatarId;

                                    return (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => onChange('avatarId', avatar.id)}
                                            style={{
                                                /* 🔥 reset default button styles */
                                                appearance: "none",
                                                border: "none",
                                                padding: 0,
                                                backgroundColor: "transparent",
                                                font: "inherit",
                                                color: "white",
                                                /* 🎨 size & layout */
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "9999px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",

                                                /* 🌈 gradient (INLINE LOGIC ONLY) */
                                                background:
                                                    avatar.gradient === "from-blue-400 to-indigo-500"
                                                        ? "linear-gradient(to bottom right, #60a5fa, #6366f1)"
                                                        : avatar.gradient === "from-purple-400 to-pink-500"
                                                            ? "linear-gradient(to bottom right, #c084fc, #ec4899)"
                                                            : avatar.gradient === "from-amber-300 to-orange-500"
                                                                ? "linear-gradient(to bottom right, #fcd34d, #f97316)"
                                                                : avatar.gradient === "from-red-400 to-rose-500"
                                                                    ? "linear-gradient(to bottom right, #f87171, #f43f5e)"
                                                                    : avatar.gradient === "from-teal-400 to-emerald-500"
                                                                        ? "linear-gradient(to bottom right, #2dd4bf, #10b981)"
                                                                        : "transparent",

                                                /* ✨ effects */
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                transition: "transform 0.2s ease, opacity 0.2s ease",
                                                transform: isActive ? "scale(1.1)" : "scale(1)",
                                                opacity: isActive ? 1 : 0.7,

                                                /* 🟢 active ring */
                                                outline: isActive ? "2px solid #14b8a6" : "none",
                                                outlineOffset: isActive ? "2px" : "0",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.opacity = "1";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.opacity = "0.7";
                                            }}
                                        >
                                            {avatar.icon}
                                        </button>
                                    );
                                })}
                            </div>
                            <s-text-field
                                label="Header Title"
                                value={settings.title}
                                placeholder="Enter header title"
                                onChange={(e: CallbackEvent<'s-text-field'>) => onChange('title', (e.target as HTMLInputElement).value)}
                            />
                            <s-text-field
                                label="Header SubTitle"
                                value={settings.subtitle}
                                placeholder="Enter header subtitle"
                                onChange={(e: CallbackEvent<'s-text-field'>) => onChange('subtitle', (e.target as HTMLInputElement).value)}
                            />
                        </s-stack>
                    </>
                )}

            </s-section>

            {/* Dimensions Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenD(!isOpenD)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Dimensions</span></s-heading>
                        <s-icon type={isOpenD ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenD && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <s-number-field
                                label="Window Width"
                                min={250} max={600} step={10}
                                value={settings.width.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('width', parseFloat((e.target as HTMLInputElement).value))}
                            />
                            <s-number-field
                                label="Window Height"
                                min={300} max={900} step={10}
                                value={settings.height.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('height', parseFloat((e.target as HTMLInputElement).value))}
                            />
                            <s-number-field
                                label="Corner Radius"
                                min={0} max={50} step={1}
                                value={settings.cornerRadius.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('cornerRadius', parseFloat((e.target as HTMLInputElement).value))}
                            />
                        </s-stack>
                    </>
                )}

            </s-section>

            {/* Message Bubbles Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenMB(!isOpenMB)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Message Bubbles</span></s-heading>
                        <s-icon type={isOpenMB ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenMB && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="none small small">
                            <s-number-field
                                label="Vertical Padding"
                                min={0} max={50} step={1}
                                value={settings.messageVerticalPadding.toString()}
                                suffix="px"
                                onChange={(e: CallbackEvent<'s-number-field'>) => onChange('messageVerticalPadding', parseFloat((e.target as HTMLInputElement).value))}
                            />
                            <s-grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap="small">
                                <s-number-field
                                    label="Radius TL"
                                    min={0} max={50} step={1}
                                    value={settings.messageBorderRadius.tl.toString()}
                                    suffix="px"
                                    onChange={(e: CallbackEvent<'s-number-field'>) => updateBorderRadius('tl', parseFloat((e.target as HTMLInputElement).value))}
                                />
                                <s-number-field
                                    label="Radius TR"
                                    min={0} max={50} step={1}
                                    value={settings.messageBorderRadius.tr.toString()}
                                    suffix="px"
                                    onChange={(e: CallbackEvent<'s-number-field'>) => updateBorderRadius('tr', parseFloat((e.target as HTMLInputElement).value))}
                                />
                                <s-number-field
                                    label="Radius BR"
                                    min={0} max={50} step={1}
                                    value={settings.messageBorderRadius.br.toString()}
                                    suffix="px"
                                    onChange={(e: CallbackEvent<'s-number-field'>) => updateBorderRadius('br', parseFloat((e.target as HTMLInputElement).value))}
                                />
                                <s-number-field
                                    label="Radius BL"
                                    min={0} max={50} step={1}
                                    value={settings.messageBorderRadius.bl.toString()}
                                    suffix="px"
                                    onChange={(e: CallbackEvent<'s-number-field'>) => updateBorderRadius('bl', parseFloat((e.target as HTMLInputElement).value))}
                                />
                            </s-grid>
                        </s-stack>
                    </>
                )}

            </s-section>

        </s-stack>
    )
}