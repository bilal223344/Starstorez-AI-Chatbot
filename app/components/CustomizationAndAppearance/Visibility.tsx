import { useState } from "react";
import { Laptop, Monitor, Smartphone } from "lucide-react";

export default function Visibility() {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(false);

    return (
        <s-stack>
            <s-stack>
                <s-heading>Display Settings Device</s-heading>
                <s-stack direction="inline" gap="base" paddingBlock="base">
                    <s-clickable background="base" inlineSize="90px" blockSize="70px" border="base" borderRadius="base">
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Monitor />
                            <s-text><span style={{ fontSize: "12px" }}>All Device</span></s-text>
                        </div>
                    </s-clickable>
                    <s-clickable background="subdued" inlineSize="90px" blockSize="70px" border="base" borderRadius="base">
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Laptop />
                            <s-text><span style={{ fontSize: "12px" }}>Desktop Only</span></s-text>
                        </div>
                    </s-clickable>
                    <s-clickable background="subdued" inlineSize="90px" blockSize="70px" border="base" borderRadius="base">
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Smartphone />
                            <s-text><span style={{ fontSize: "12px" }}>Mobile Only</span></s-text>
                        </div>
                    </s-clickable>
                </s-stack>
            </s-stack>

            {/* Display Rules Section */}
            < s-section padding="none" >
                <s-clickable onClick={() => setIsOpenDisplayRule(!isOpenDisplayRule)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Display Rules</span></s-heading>
                        <s-icon type={isOpenDisplayRule ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenDisplayRule && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <s-select>
                                <s-option defaultSelected value="all-pages">Display on all pages</s-option>
                                <s-option value="specific-page">Display on specific pages</s-option>
                                <s-option value="hide-specific">Hide on specific pages</s-option>
                            </s-select>
                            <s-choice-list multiple>
                                <s-choice value="home">Home Page</s-choice>
                                <s-choice value="about">About Us</s-choice>
                                <s-choice value="services">Services</s-choice>
                                <s-choice value="contact">Contact</s-choice>
                                <s-choice value="blog">Blog</s-choice>
                            </s-choice-list>
                        </s-stack>
                    </>
                )}
            </s-section>
        </s-stack>
    )
}