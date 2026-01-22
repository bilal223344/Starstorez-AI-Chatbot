import { useState } from "react";

// --- Types ---
export interface CloseButtonAnimationData {
    animationType: string;
    transitionDuration: number; // in milliseconds
}

interface CloseButtonAnimationsProps {
    data: CloseButtonAnimationData;
    onUpdate: <K extends keyof CloseButtonAnimationData>(key: K, value: CloseButtonAnimationData[K]) => void;
}

export default function CloseButtonAnimations({ data, onUpdate }: CloseButtonAnimationsProps) {
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
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Close Button Animations</span></s-heading>
                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">

                                <s-stack>
                                    <s-heading>Close Animation</s-heading>

                                    <s-box padding="small" border="base base dashed" borderRadius="base" background="subdued">
                                        <s-stack direction="inline" gap="small" flexWrap="wrap">

                                            {/* 1. Fade Out */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Fade Out")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    outline: getBorderStyle("Fade Out"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white", transition: "all 0.2s ease"
                                                }}>
                                                    <div style={{ 
                                                        height: "60px", width: "200px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center",
                                                        opacity: 0.5
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "12px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Fade Out</s-text>
                                            </button>

                                            {/* 2. Slide Down */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Slide Down")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Slide Down"),
                                                    display: "flex", justifyContent: "center", alignItems: "flex-end",
                                                    background: "white",
                                                    overflow: "hidden"
                                                }}>
                                                    <div style={{ 
                                                        height: "60px", width: "200px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center",
                                                        marginBottom: "-20px"
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "12px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Slide Down</s-text>
                                            </button>

                                            {/* 3. Slide Up */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Slide Up")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Slide Up"),
                                                    display: "flex", justifyContent: "center", alignItems: "flex-start",
                                                    background: "white",
                                                    overflow: "hidden"
                                                }}>
                                                    <div style={{ 
                                                        height: "60px", width: "200px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center",
                                                        marginTop: "-20px"
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "12px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Slide Up</s-text>
                                            </button>

                                            {/* 4. Scale Down */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Scale Down")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Scale Down"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <div style={{ 
                                                        height: "40px", width: "150px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center",
                                                        transform: "scale(0.7)"
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "10px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Scale Down</s-text>
                                            </button>

                                            {/* 5. Rotate Out */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Rotate Out")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Rotate Out"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <div style={{ 
                                                        height: "60px", width: "200px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center",
                                                        transform: "rotate(15deg)",
                                                        opacity: 0.7
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "12px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Rotate Out</s-text>
                                            </button>

                                            {/* 6. Instant */}
                                            <button
                                                onClick={() => onUpdate("animationType", "Instant")}
                                                style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", background: "transparent", flexDirection: "column", cursor: "pointer" }}
                                            >
                                                <div style={{
                                                    width: "150px", height: "110px", borderRadius: "1em",
                                                    border: "1px solid #dcdcdc",
                                                    outline: getBorderStyle("Instant"),
                                                    display: "flex", justifyContent: "center", alignItems: "center",
                                                    background: "white"
                                                }}>
                                                    <div style={{ 
                                                        height: "60px", width: "200px", 
                                                        background: "linear-gradient(135deg, #D73535, #000851)", 
                                                        borderRadius: "12px", 
                                                        display: "flex", 
                                                        justifyContent: "center", 
                                                        alignItems: "center"
                                                    }}>
                                                        <span style={{ color: "white", fontSize: "12px" }}>Chat Window</span>
                                                    </div>
                                                </div>
                                                <s-text>Instant</s-text>
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
                                        max={1000}
                                        step={50}
                                        suffix="ms"
                                        onInput={(e: any) => onUpdate("transitionDuration", Number(e.currentTarget.value))}
                                    />
                                </s-box>

                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    );
}
