import { useState } from "react";

export default function AddOns() {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(true);

    const bgColors = ["#FCF8F8", "#F0F0DB", "#ECECEC", "#EFE1B5", "#F0FFDF", "#F3F4F4", "#2B2A2A", "#3A2525", "#213448", "#1B211A"]


    return (
        <s-stack gap="base">
            <s-stack gap="base" overflow="hidden" direction="inline" border="base" borderRadius="base">
                <div style={{ background: "#0f172a", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", gap: "5px" }}>
                    <s-stack direction="block" gap="small-200">
                        <s-heading><span style={{ color: "whitesmoke" }}>Product Slider</span></s-heading>
                        <s-text><span style={{ color: "whitesmoke" }}>Showcase products in chat</span></s-text>
                    </s-stack>
                    <s-switch />
                </div>
            </s-stack>

            {/* Card Style Section */}
            < s-section padding="none" >
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
                                value="12"
                                min={40}
                                max={300}
                            />
                            <s-number-field
                                label="Card Height"
                                value="12"
                                min={40}
                                max={300}
                            />

                            <s-stack gap="small-100" background="base" border="base" borderRadius="base" padding="small">
                                <s-color-field label="Card Background" placeholder="Select a color" value="#FFFFFF" />
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    {bgColors.map((color) => (
                                        <button key={color} style={{ backgroundColor: color, width: "32px", height: "32px", border: "none", borderRadius: "4px", marginRight: "8px", cursor: "pointer" }} />
                                    ))}
                                </div>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </s-stack>
    )
}