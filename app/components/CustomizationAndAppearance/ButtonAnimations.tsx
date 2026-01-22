import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

// --- Types ---
export interface ButtonAnimationData {
    animationType: string;
    transitionDuration: number;
}

interface ButtonAnimationsProps {
    data: ButtonAnimationData;
    onUpdate: <K extends keyof ButtonAnimationData>(key: K, value: ButtonAnimationData[K]) => void;
    primaryColor?: string; // Color from chatWindow.primaryColor
    colorMode?: 'solid' | 'gradient';
    gradientStart?: string;
    gradientEnd?: string;
}

export default function ButtonAnimations({ data, onUpdate, primaryColor = "#D73535", colorMode = "solid", gradientStart, gradientEnd }: ButtonAnimationsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Get the button color based on color mode
    const getButtonColor = () => {
        if (colorMode === 'gradient' && gradientStart && gradientEnd) {
            return `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
        }
        return primaryColor;
    };

    const buttonColor = getButtonColor();

    // Helper for conditional styling (Visual Feedback)
    const getBorderStyle = (type: string) => {
        return data.animationType === type
            ? "2px solid #2C6ECB" // Selected color (Blue)
            : "2px solid transparent"; // Default (invisible border to prevent layout shift)
    };

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Button Animations</span></s-heading>
                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">

                                <s-stack>
                                    <s-heading>Animation</s-heading>

                                    <s-box padding="small" border="base base dashed" borderRadius="base" background="subdued">
                                        <s-stack direction="inline" gap="small">

                                            {/* 1. Static Animation */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Static")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    outline: getBorderStyle("Static"), // Active selection border
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white", transition: "all 0.2s ease"
                                                }}>
                                                    <button style={{ height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white" }}>

                                                    </button>
                                                </div>
                                                <s-text>Static</s-text>
                                            </button>

                                            {/* 2. Breathing Light */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Breathing")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Breathing"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    {/* Simulated Breathing Effect with CSS Shadow */}
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        boxShadow: colorMode === 'gradient' ? "0 0 0 4px rgba(0, 0, 0, 0.2)" : `0 0 0 4px ${primaryColor}40`
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Breathing Light</s-text>
                                            </button>

                                            {/* 3. Zoom */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Zoom")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Zoom"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "58px", width: "58px", // Slightly larger to simulate zoom state
                                                        background: buttonColor, borderRadius: "999px", border: "none", color: "white"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Zoom</s-text>
                                            </button>

                                            {/* 4. Flash */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Flash")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Flash"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        opacity: 0.7 // Simulate flash state
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Flash</s-text>
                                            </button>

                                            {/* 5. Pulse */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Pulse")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Pulse"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        animation: "pulse 2s infinite"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Pulse</s-text>
                                            </button>

                                            {/* 6. Bounce */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Bounce")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Bounce"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        animation: "bounce 1s infinite"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Bounce</s-text>
                                            </button>

                                            {/* 7. Shake */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Shake")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Shake"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        animation: "shake 0.5s infinite"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Shake</s-text>
                                            </button>

                                            {/* 8. Rotate */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Rotate")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Rotate"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        animation: "rotate 2s linear infinite"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Rotate</s-text>
                                            </button>

                                            {/* 9. Glow */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Glow")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Glow"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <button style={{
                                                        height: "50px", width: "50px", background: buttonColor, borderRadius: "999px", border: "none", color: "white",
                                                        boxShadow: colorMode === 'gradient' ? "0 0 20px rgba(0, 0, 0, 0.5)" : `0 0 20px ${primaryColor}80`,
                                                        animation: "glow 2s ease-in-out infinite"
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Glow</s-text>
                                            </button>

                                        </s-stack>
                                    </s-box>
                                </s-stack>

                                {/* Transition Duration */}
                                <s-box>
                                    <s-number-field
                                        label="Transition Duration"
                                        value={data.transitionDuration.toString()}
                                        min={0}
                                        max={2000}
                                        step={50}
                                        suffix="ms"
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("transitionDuration", Number(e.currentTarget.value))}
                                    />
                                </s-box>

                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes glow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </>
    );
}