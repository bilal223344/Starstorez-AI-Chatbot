import { useState } from "react";
import { Laptop, Monitor, Smartphone } from "lucide-react";
import { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings, ShopifyPageNode } from "../../types";

interface VisibilityProps {
    settings: WidgetSettings['visibility'];
    onChange: <K extends keyof WidgetSettings['visibility']>(key: K, value: WidgetSettings['visibility'][K]) => void;
    pages: ShopifyPageNode[];
}

export default function Visibility({ settings, onChange, pages }: VisibilityProps) {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(false);

    const handleDeviceChange = (device: 'all' | 'desktop' | 'mobile') => {
        if (device === 'all') {
            onChange('showOnDesktop', true);
            onChange('showOnMobile', true);
        } else if (device === 'desktop') {
            onChange('showOnDesktop', true);
            onChange('showOnMobile', false);
        } else {
            onChange('showOnDesktop', false);
            onChange('showOnMobile', true);
        }
    };

    const handlePageSelection = (event: { currentTarget: { values: string[] } }) => {
        const selectedPaths = event.currentTarget.values;
        onChange('paths', selectedPaths);
    };

    const currentDevice = settings.showOnDesktop && settings.showOnMobile ? 'all' : settings.showOnDesktop ? 'desktop' : 'mobile';

    return (
        <s-stack>
            <s-stack>
                <s-heading>Display Settings Device</s-heading>
                <s-stack direction="inline" gap="base" paddingBlock="base">
                    <s-clickable
                        background={currentDevice === 'all' ? "base" : "subdued"}
                        inlineSize="90px" blockSize="70px" border="base" borderRadius="base"
                        onClick={() => handleDeviceChange('all')}
                    >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Monitor />
                            <s-text><span style={{ fontSize: "12px" }}>All Device</span></s-text>
                        </div>
                    </s-clickable>
                    <s-clickable
                        background={currentDevice === 'desktop' ? "base" : "subdued"}
                        inlineSize="90px" blockSize="70px" border="base" borderRadius="base"
                        onClick={() => handleDeviceChange('desktop')}
                    >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Laptop />
                            <s-text><span style={{ fontSize: "12px" }}>Desktop Only</span></s-text>
                        </div>
                    </s-clickable>
                    <s-clickable
                        background={currentDevice === 'mobile' ? "base" : "subdued"}
                        inlineSize="90px" blockSize="70px" border="base" borderRadius="base"
                        onClick={() => handleDeviceChange('mobile')}
                    >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px" }}>
                            <Smartphone />
                            <s-text><span style={{ fontSize: "12px" }}>Mobile Only</span></s-text>
                        </div>
                    </s-clickable>
                </s-stack>
            </s-stack>

            {/* Display Rules Section */}
            <s-section padding="none">
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
                            <s-select
                                value={settings.rule}
                                onChange={(e: CallbackEvent<"s-select">) => onChange('rule', e.currentTarget.value as WidgetSettings['visibility']['rule'])}
                            >
                                <s-option value="all">Display on all pages</s-option>
                                <s-option value="specific">Display on specific pages</s-option>
                                <s-option value="hide">Hide on specific pages</s-option>
                            </s-select>

                            {settings.rule !== 'all' && (
                                <s-choice-list
                                    multiple
                                    // @ts-expect-error - selected is not in the type definition but is used by the component
                                    selected={settings.paths || []}
                                    onChange={handlePageSelection}
                                >
                                    <s-choice value="index">Home Page</s-choice>
                                    <s-choice value="cart">Cart Page</s-choice>
                                    <s-choice value="products">All Products</s-choice>
                                    <s-choice value="collections">All Collections</s-choice>

                                    {pages.map(page => (
                                        <s-choice
                                            key={page.id}
                                            value={`pages/${page.handle}`}
                                        >
                                            {page.title}
                                        </s-choice>
                                    ))}
                                </s-choice-list>
                            )}
                        </s-stack>
                    </>
                )}
            </s-section>
        </s-stack>
    );
}