import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

interface Discount {
    id: string;
    shopifyId: string;
    title: string;
    code: string;
    status: string;
    isSuggested: boolean;
    startsAt: string;
    endsAt?: string | null;
}

export default function Discount() {
    const loader = useFetcher<{ tab: string; discounts: Discount[]; hasDiscountScope: boolean }>();
    const fetcher = useFetcher();

    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [hasScope, setHasScope] = useState(false);

    // Self-load on mount
    useEffect(() => {
        if (loader.state === "idle" && !loader.data) {
            loader.load("/app/trainingdata?tab=discounts");
        }
    }, []);

    // Sync fetched data
    useEffect(() => {
        if (loader.data) {
            setDiscounts(loader.data.discounts || []);
            setHasScope(loader.data.hasDiscountScope ?? false);
        }
    }, [loader.data]);

    // Reload after sync action
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            loader.load("/app/trainingdata?tab=discounts");
        }
    }, [fetcher.state, fetcher.data]);

    // Loading state
    if (loader.state === "loading" || !loader.data) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
                <s-spinner size="large"></s-spinner>
            </div>
        );
    }

    const handleSync = () => {
        fetcher.submit({ intent: "syncDiscounts" }, { method: "post" });
    };

    const handleToggle = (discountId: string, currentVal: boolean) => {
        fetcher.submit(
            { intent: "toggleDiscountSuggested", discountId, isSuggested: (!currentVal).toString() },
            { method: "post" }
        );
        // Optimistic update
        setDiscounts(prev => prev.map(d =>
            d.id === discountId ? { ...d, isSuggested: !currentVal } : d
        ));
    };

    return (
        <s-stack gap="base">
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                <s-text>Manage which discounts the AI can suggest to customers.</s-text>
                <s-button icon="reset" onClick={handleSync} loading={fetcher.state === "submitting"}>Sync from Shopify</s-button>
            </s-stack>
            <s-card>
                <s-table>
                    <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
                        <s-text-field
                            label="Search discounts"
                            labelAccessibilityVisibility="exclusive"
                            icon="search"
                            placeholder="Searching all discounts"
                        />
                        <s-button
                            icon="sort"
                            variant="secondary"
                            accessibilityLabel="Sort"
                            interestFor="sort-tooltip"
                            commandFor="sort-actions"
                        />
                        <s-tooltip id="sort-tooltip">
                            <s-text>Sort</s-text>
                        </s-tooltip>
                        <s-popover id="sort-actions">
                            <s-stack gap="none">
                                <s-box padding="small">
                                    <s-choice-list label="Sort by" name="Sort by">
                                        <s-choice value="title" selected>Title</s-choice>
                                        <s-choice value="status">Status</s-choice>
                                        <s-choice value="created">Created</s-choice>
                                    </s-choice-list>
                                </s-box>
                            </s-stack>
                        </s-popover>
                    </s-grid>

                    <s-table-header-row>
                        <s-table-header listSlot="primary">Discount</s-table-header>
                        <s-table-header>Code</s-table-header>
                        <s-table-header>Status</s-table-header>
                        <s-table-header listSlot="secondary">Suggest</s-table-header>
                    </s-table-header-row>

                    <s-table-body>
                        {discounts.map((discount: Discount) => (
                            <s-table-row key={discount.id} clickDelegate={`discount-${discount.id}-checkbox`}>
                                <s-table-cell>
                                    <s-stack direction="inline" gap="small" alignItems="center">
                                        <s-checkbox id={`discount-${discount.id}-checkbox`} />
                                        <s-stack>
                                            <s-text fontWeight="bold">{discount.title}</s-text>
                                            <s-text color="subdued">{discount.code || "Automatic"}</s-text>
                                        </s-stack>
                                    </s-stack>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-tag>{discount.code || "AUTOMATIC"}</s-tag>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-badge state={discount.status === 'ACTIVE' ? 'success' : 'info'}>{discount.status}</s-badge>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-switch
                                        checked={discount.isSuggested}
                                        onChange={() => handleToggle(discount.id, discount.isSuggested)}
                                    />
                                </s-table-cell>
                            </s-table-row>
                        ))}
                    </s-table-body>
                </s-table>
                {discounts.length === 0 && (
                    <s-stack padding="large" alignItems="center" justifyContent="center">
                        <s-text color="subdued">No discounts found.</s-text>
                    </s-stack>
                )}
            </s-card>
        </s-stack>
    );
}
