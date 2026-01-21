import { CallbackEvent } from "@shopify/polaris-types";
import React, { useState } from "react";

// Define the shape of the data for this section
export interface PoliciesData {
    shipping: string;
    payment: string;
    refund: string;
}

interface PoliciesProps {
    data: PoliciesData;
    setData: React.Dispatch<React.SetStateAction<PoliciesData>>;
}

export function Policies({ data, setData }: PoliciesProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (field: keyof PoliciesData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Policies</span></s-heading>
                        <s-tooltip id="store-policy-tooltip">
                            Provide comprehensive information about your store policies...
                        </s-tooltip>
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                            <s-icon interestFor="store-policy-tooltip" type="info"></s-icon>
                        {/* </div> */}
                    </div>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="small-200">
                        {/* Shipping Policy */}
                        <s-stack gap="small-200">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                                <s-heading>Shipping Policy</s-heading>
                                <s-tooltip id="shipping-policy-tooltip">Provide crucial shipping info...</s-tooltip>
                                <s-icon interestFor="shipping-policy-tooltip" type="info"></s-icon>
                            </div>
                            <s-text-area
                                placeholder="Shipping details..."
                                value={data.shipping}
                                onInput={(e: CallbackEvent<"s-text-area">) => handleChange('shipping', e.currentTarget.value)}
                            />
                        </s-stack>

                        {/* Payment Policy */}
                        <s-stack gap="small-200">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                                <s-heading>Payment Policy</s-heading>
                                <s-tooltip id="payment-policy-tooltip">List all supported payment methods...</s-tooltip>
                                <s-icon interestFor="payment-policy-tooltip" type="info"></s-icon>
                            </div>
                            <s-text-area
                                placeholder="Payment details..."
                                value={data.payment}
                                onInput={(e: CallbackEvent<"s-text-area">) => handleChange('payment', e.currentTarget.value)}
                            />
                        </s-stack>

                        {/* Return Policy */}
                        <s-stack gap="small-200">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                                <s-heading>Returns & Refund Policy</s-heading>
                                <s-tooltip id="return-policy-tooltip">Clearly define return criteria...</s-tooltip>
                                <s-icon interestFor="return-policy-tooltip" type="info"></s-icon>
                            </div>
                            <s-text-area
                                placeholder="Return details..."
                                value={data.refund}
                                onInput={(e: CallbackEvent<"s-text-area">) => handleChange('refund', e.currentTarget.value)}
                            />
                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}