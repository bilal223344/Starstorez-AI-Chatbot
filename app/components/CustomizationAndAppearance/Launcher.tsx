import { useState } from "react";
import { BotMessageSquare, MessageCircle, MessageCirclePlus, MessageSquare, MessageSquareDot, MessageSquareMore, MessageSquareQuote, MessageSquareText, MessagesSquare } from "lucide-react";

export default function Launcher() {
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
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageCircle />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <BotMessageSquare />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageCirclePlus />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageSquare />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageSquareDot />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageSquareMore />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageSquareQuote />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessageSquareText />
                                        </div>
                                    </s-clickable>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <s-clickable inlineSize="50px" blockSize="50px" border="large strong" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <MessagesSquare />
                                        </div>
                                    </s-clickable>
                                </div>
                            </div>
                            <s-number-field label="Button Size" placeholder="Enter a value" defaultValue="24" min={12} max={48} />
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
                                <s-button variant="secondary" slot="secondary-actions">Right</s-button>
                                <s-button slot="secondary-actions">Left</s-button>
                            </s-button-group>
                            <s-number-field label="Horizontal Margin" placeholder="Enter a value" defaultValue="12" min={0} max={100} suffix="px" />
                            <s-number-field label="Vertical Margin" placeholder="Enter a value" defaultValue="12" min={0} max={100} suffix="px" />
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
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Static</s-text>
                                        </div>
                                    </s-clickable>
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Pulse</s-text>
                                        </div>
                                    </s-clickable>
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Bounce</s-text>
                                        </div>
                                    </s-clickable>
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Shake</s-text>
                                        </div>
                                    </s-clickable>
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Rotate</s-text>
                                        </div>
                                    </s-clickable>
                                    <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                            <s-text>Glow</s-text>
                                        </div>
                                    </s-clickable>
                                </div>
                                <s-number-field label="Duration" placeholder="Enter a value" defaultValue="1" min={0.5} max={3} step={0.1} suffix="s" />
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
                                <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                        <s-text>Fade Out</s-text>
                                    </div>
                                </s-clickable>
                                <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                        <s-text>Slide Down</s-text>
                                    </div>
                                </s-clickable>
                                <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                        <s-text>Scale Down</s-text>
                                    </div>
                                </s-clickable>
                                <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                        <s-text>Rotate Out</s-text>
                                    </div>
                                </s-clickable>
                                <s-clickable inlineSize="100px" blockSize="40px" border="base" borderRadius="base" >
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
                                        <s-text>Instant</s-text>
                                    </div>
                                </s-clickable>
                            </div>
                            <s-number-field label="Duration" placeholder="Enter a value" defaultValue="1" min={0.5} max={3} step={0.1} suffix="s" />
                        </s-stack>
                    </>
                )
                }
            </s-section >
        </s-stack >
    )
}