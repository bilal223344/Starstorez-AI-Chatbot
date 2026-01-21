import { CallbackEvent } from "@shopify/polaris-types";
import React, { useState } from "react";

// Define the shape of the data for this section
export interface StoreDetailsData {
    about: string;
    location: string;
}

interface StoreDetailsProps {
    data: StoreDetailsData;
    setData: React.Dispatch<React.SetStateAction<StoreDetailsData>>;
}

export function StoreDetails({ data, setData }: StoreDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to update specific fields in the state object
    const handleChange = (field: keyof StoreDetailsData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Store Details</span></s-heading>
                        <s-tooltip id="store-detail-tooltip">
                            Craft compelling content for your &apos;About Us&apos;, &apos;Our Story&apos;, or other pages...
                        </s-tooltip>
                        {/* Stop propagation ensures clicking info doesn't toggle accordion */}
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                            <s-icon id="store-detail-tooltip-icon" interestFor="store-detail-tooltip" type="info"></s-icon>
                        {/* </div> */}
                    </div>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="small-200">
                        {/* About Your Store */}
                        <s-stack gap="small-200">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                                <s-heading>About Your Store</s-heading>
                                <s-tooltip id="store-about-tooltip">Craft compelling content...</s-tooltip>
                                <s-icon interestFor="store-about-tooltip" type="info"></s-icon>
                            </div>
                            <s-text-area
                                rows={3}
                                placeholder="Share information about your store..."
                                value={data.about}
                                onInput={(e: CallbackEvent<"s-text-area">) => handleChange('about', e.currentTarget.value)}
                            />
                        </s-stack>

                        {/* Store Location */}
                        <s-stack gap="small-200">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3em" }}>
                                <s-heading>Store Location</s-heading>
                                <s-tooltip id="store-location-tooltip">Include information about your shop&apos;s location.</s-tooltip>
                                <s-icon interestFor="store-location-tooltip" type="info"></s-icon>
                            </div>
                            <s-text-area
                                placeholder="About your shop's location"
                                value={data.location}
                                onInput={(e: CallbackEvent<"s-text-area">) => handleChange('location', e.currentTarget.value)}
                            />
                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}