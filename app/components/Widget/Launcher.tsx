import { useState } from "react";
import { BotMessageSquare, MessageCircle, MessageCirclePlus, MessageSquare, MessageSquareDot, MessageSquareMore, MessageSquareQuote, MessageSquareText, MessagesSquare } from "lucide-react";
import { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

interface LauncherProps {
    settings: WidgetSettings['launcher'];
    onChange: <K extends keyof WidgetSettings['launcher']>(key: K, value: WidgetSettings['launcher'][K]) => void;
}

const ICONS: Record<string, React.ReactNode> = {
    'message-circle': <MessageCircle />,
    'bot-message-square': <BotMessageSquare />,
    'message-circle-plus': <MessageCirclePlus />,
    'message-square': <MessageSquare />,
    'message-square-dot': <MessageSquareDot />,
    'message-square-more': <MessageSquareMore />,
    'message-square-quote': <MessageSquareQuote />,
    'message-square-text': <MessageSquareText />,
    'messages-square': <MessagesSquare />
};

export default function Launcher({ settings, onChange }: LauncherProps) {
    const [isOpenAppearance, setIsOpenAppearance] = useState(false);
    const [isOpenPositionning, setIsOpenPositionning] = useState(false);
    const [isOpenAnimation, setIsOpenAnimation] = useState(false);
    const [isOpenTransition, setIsOpenTransition] = useState(false);

    return (
        <s-stack gap="base">
            {/* Apperence Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenAppearance(!isOpenAppearance)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Appearance</span></s-heading>
                        <s-icon type={isOpenAppearance ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenAppearance && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small base base">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {Object.entries(ICONS).map(([id, icon]) => (
                                    <div key={id} style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        <s-clickable
                                            inlineSize="50px"
                                            blockSize="50px"
                                            border={settings.iconId === id ? "large strong" : "base"}
                                            borderRadius="base"
                                            onClick={() => onChange('iconId', id)}
                                        >
                                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                                {icon}
                                            </div>
                                        </s-clickable>
                                    </div>
                                ))}
                            </div>
                            <s-number-field
                                label="Button Size"
                                placeholder="Enter a value"
                                value={settings.iconSize.toString()}
                                min={12} max={48}
                                onChange={(e: CallbackEvent<"s-number-field">) => onChange('iconSize', parseFloat(e.currentTarget.value))}
                            />
                        </s-stack>
                    </>
                )}
            </s-section>

            {/* Positionning Section */}
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpenPositionning(!isOpenPositionning)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Positioning</span></s-heading>
                        <s-icon type={isOpenPositionning ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenPositionning && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <s-button-group gap="none">
                                <s-button
                                    variant={settings.position === 'right' ? "primary" : "secondary"}
                                    slot="secondary-actions"
                                    onClick={() => onChange('position', 'right')}
                                >
                                    Right
                                </s-button>
                                <s-button
                                    variant={settings.position === 'left' ? "primary" : "secondary"}
                                    slot="secondary-actions"
                                    onClick={() => onChange('position', 'left')}
                                >
                                    Left
                                </s-button>
                            </s-button-group>
                            <s-number-field
                                label="Horizontal Margin"
                                placeholder="Enter a value"
                                value={settings.marginH.toString()}
                                min={0} max={100} suffix="px"
                                onChange={(e: CallbackEvent<"s-number-field">) => onChange('marginH', parseFloat(e.currentTarget.value))}
                            />
                            <s-number-field
                                label="Vertical Margin"
                                placeholder="Enter a value"
                                value={settings.marginV.toString()}
                                min={0} max={100} suffix="px"
                                onChange={(e: CallbackEvent<"s-number-field">) => onChange('marginV', parseFloat(e.currentTarget.value))}
                            />
                        </s-stack>
                    </>
                )}

            </s-section>

            {/* Button Animation Section */}
            < s-section padding="none" >
                <s-clickable onClick={() => setIsOpenAnimation(!isOpenAnimation)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Button Animation</span></s-heading>
                        <s-icon type={isOpenAnimation ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenAnimation && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {(['static', 'pulse', 'bounce', 'shake', 'rotate', 'glow'] as const).map((anim) => (
                                    <s-clickable
                                        key={anim}
                                        inlineSize="100px" blockSize="40px"
                                        border={settings.animation.type === anim ? "large strong" : "base"}
                                        borderRadius="base"
                                        onClick={() => onChange('animation', { ...settings.animation, type: anim })}
                                    >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>{anim.charAt(0).toUpperCase() + anim.slice(1)}</s-text>
                                        </div>
                                    </s-clickable>
                                ))}
                            </div>
                            <s-number-field
                                label="Duration"
                                placeholder="Enter a value"
                                value={settings.animation.duration.toString()}
                                min={0.5} max={3} step={0.1} suffix="s"
                                onChange={(e: CallbackEvent<"s-number-field">) => onChange('animation', { ...settings.animation, duration: parseFloat(e.currentTarget.value) })}
                            />
                        </s-stack>
                    </>
                )}
            </s-section >

            {/* Window Transition Section */}
            < s-section padding="none" >
                <s-clickable onClick={() => setIsOpenTransition(!isOpenTransition)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Window Transition</span></s-heading>
                        <s-icon type={isOpenTransition ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenTransition && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {(['fade', 'slide', 'scale', 'rotate', 'instant'] as const).map((anim) => (
                                    <s-clickable
                                        key={anim}
                                        inlineSize="100px" blockSize="40px"
                                        border={settings.windowTransition.type === anim ? "large strong" : "base"}
                                        borderRadius="base"
                                        onClick={() => onChange('windowTransition', { ...settings.windowTransition, type: anim })}
                                    >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>
                                                {anim === 'instant' ? 'Instant' : anim.charAt(0).toUpperCase() + anim.slice(1) + ' Out'}
                                                {/* UI text was 'Fade Out', 'Slide Down' etc. Keeping generic internal names */}
                                            </s-text>
                                        </div>
                                    </s-clickable>
                                ))}
                            </div>
                            <s-number-field
                                label="Duration"
                                placeholder="Enter a value"
                                value={settings.windowTransition.duration.toString()}
                                min={0.5} max={3} step={0.1} suffix="s"
                                onChange={(e: CallbackEvent<"s-number-field">) => onChange('windowTransition', { ...settings.windowTransition, duration: parseFloat(e.currentTarget.value) })}
                            />
                        </s-stack>
                    </>
                )
                }
            </s-section >
        </s-stack >
    )
}