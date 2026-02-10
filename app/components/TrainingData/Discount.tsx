import { useState } from "react";
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

interface DiscountProps {
    initialDiscounts: Discount[];
    hasScope: boolean;
}

export default function Discount({ initialDiscounts, hasScope }: DiscountProps) {
    const fetcher = useFetcher();
    // Use local state for optimistic updates
    const [discounts, setDiscounts] = useState(initialDiscounts);

    const handleToggle = (discountId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic UI update
        setDiscounts(prev => prev.map(d =>
            d.id === discountId ? { ...d, isSuggested: newStatus } : d
        ));

        fetcher.submit(
            { actionType: "toggle_discount", id: discountId, isSuggested: String(newStatus) },
            { method: "post" }
        );
    };

    const handleSync = () => {
        fetcher.submit({ actionType: "sync_discounts" }, { method: "post" });
    };

    if (!hasScope) {
        return (
            <s-stack padding="large" gap="large" background="subdued" border="large" borderStyle="dashed" borderRadius="base" justifyContent="center" alignItems="center">
                <s-icon type="lock" />
                <s-heading>Access Required</s-heading>
                <s-text>Grant access to view and manage discounts.</s-text>
                <s-button variant="primary" onClick={() => shopify.scopes.request(['read_discounts'])}>Grant Access</s-button>
            </s-stack>
        );
    }

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
