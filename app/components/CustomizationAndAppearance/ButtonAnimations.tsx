import { useState } from "react";

// --- Types ---
export interface ButtonAnimationData {
    animationType: string;
}

interface ButtonAnimationsProps {
    data: ButtonAnimationData;
    onUpdate: <K extends keyof ButtonAnimationData>(key: K, value: ButtonAnimationData[K]) => void;
}

export default function ButtonAnimations({ data, onUpdate }: ButtonAnimationsProps) {
    const [isOpen, setIsOpen] = useState(false);

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
                                                    <button style={{ height: "50px", width: "50px", background: "#D73535", borderRadius: "999px", border: "none", color: "white" }}>

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
                                                        height: "50px", width: "50px", background: "#D73535", borderRadius: "999px", border: "none", color: "white",
                                                        boxShadow: "0 0 0 4px rgba(215, 53, 53, 0.3)"
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
                                                        background: "#D73535", borderRadius: "999px", border: "none", color: "white"
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
                                                        height: "50px", width: "50px", background: "#D73535", borderRadius: "999px", border: "none", color: "white",
                                                        opacity: 0.7 // Simulate flash state
                                                    }}>
                                                    </button>
                                                </div>
                                                <s-text>Flash</s-text>
                                            </button>

                                        </s-stack>
                                    </s-box>
                                </s-stack>

                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    );
}