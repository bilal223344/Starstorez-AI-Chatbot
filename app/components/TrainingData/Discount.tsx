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

export default function Discount({ discounts: initialDiscounts }: { discounts: Discount[] }) {
    const fetcher = useFetcher();

    const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);

    // Sync prop data
    useEffect(() => {
        setDiscounts(initialDiscounts);
    }, [initialDiscounts]);

    // Reload after sync action
    // Note: The parent loader revalidation should handle updating the data prop, 
    // but explicit revalidation might be needed if using defer?
    // Actually, useFetcher for action usually triggers revalidation of all loaders.
    // So updated data should come down via props.


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
                                            <s-text><strong>{discount.title}</strong></s-text>
                                            <s-text color="subdued">{discount.code || "Automatic"}</s-text>
                                        </s-stack>
                                    </s-stack>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-tag>{discount.code || "AUTOMATIC"}</s-tag>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-badge tone={discount.status === 'ACTIVE' ? 'success' : 'info'}>{discount.status}</s-badge>
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
