import { useAppBridge } from "@shopify/app-bridge-react";
import React, { useState } from "react";
import { Product } from "./RecommendedProducts";

interface ShopifyResourceProduct {
    id: string;
    title: string;
    handle: string;
    descriptionHtml: string;
    vendor: string;
    tags: string[];
    images: { originalSrc: string }[];
}

interface CustomPicksProps {
    newArrivals: Product[];
    setNewArrivals: React.Dispatch<React.SetStateAction<Product[]>>;
    bestSellers: Product[];
    setBestSellers: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function CustomPicks({
    newArrivals,
    setNewArrivals,
    bestSellers,
    setBestSellers
}: CustomPicksProps) {

    const shopify = useAppBridge();
    const [isOpen, setIsOpen] = useState(false);

    // Generic function to handle adding products for either list
    const handleAddProducts = async (
        currentList: Product[],
        setList: React.Dispatch<React.SetStateAction<Product[]>>,
        limit: number
    ) => {
        const initialSelectionIds = currentList.map((p) => ({ id: p.id }));

        const selected = await shopify.resourcePicker({
            type: 'product',
            selectionIds: initialSelectionIds,
            multiple: limit, // Enforce the limit here
            filter: { hidden: true, variants: false, draft: false, archived: false },
        });

        if (selected) {
            const mapped: Product[] = selected.map((p) => {
                const raw = p as ShopifyResourceProduct;
                return {
                    id: raw.id,
                    title: raw.title,
                    images: raw.images?.[0]?.originalSrc || "",
                    handle: raw.handle,
                    description: raw.descriptionHtml,
                    tags: raw.tags,
                    vendor: raw.vendor
                };
            });
            setList(mapped);
        }
    };

    // Generic delete function
    const handleDelete = (
        id: string,
        setList: React.Dispatch<React.SetStateAction<Product[]>>
    ) => {
        setList((prev) => prev.filter((p) => p.id !== id));
    };

    // Reusable Table Render function to keep JSX clean
    const renderProductTable = (
        list: Product[],
        setList: React.Dispatch<React.SetStateAction<Product[]>>
    ) => {
        if (list.length === 0) {
            return (
                <s-stack gap="small-200" padding="base" alignItems="center">
                    <s-text>No specific items are designated; recommendations will be provided by [OUR APP].</s-text>
                </s-stack>
            );
        }

        return (
            <s-table>
                <s-table-header-row>
                    <s-table-header listSlot="primary">Products</s-table-header>
                    <s-table-header listSlot="secondary">Status</s-table-header>
                </s-table-header-row>
                <s-table-body>
                    {list.map((product) => (
                        <s-table-row key={product.id}>
                            <s-table-cell>
                                <s-stack direction="inline" gap="small" alignItems="center">
                                    <s-thumbnail size="small-100" src={product.images} />
                                    <s-link href="">{product.title}</s-link>
                                </s-stack>
                            </s-table-cell>
                            <s-table-cell>
                                <s-button
                                    onClick={() => handleDelete(product.id, setList)}
                                    variant="primary"
                                    tone="critical"
                                >
                                    Delete
                                </s-button>
                            </s-table-cell>
                        </s-table-row>
                    ))}
                </s-table-body>
            </s-table>
        );
    };

    return (
        <s-section padding="none">
            {/* Header / Accordion Toggle */}
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Custom Picks</span></s-heading>
                        <s-tooltip id="custom-picker-tooltip">
                            You can select products to recommend as best sellers and new arrivals...
                        </s-tooltip>
                        {/* <div onClick={(e) => e.stopPropagation()}> */}
                        <s-icon interestFor="custom-picker-tooltip" type="info"></s-icon>
                        {/* </div> */}
                    </div>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack gap="small" padding="small-200 base base">

                        {/* --- NEW ARRIVALS BOX --- */}
                        <s-box border="base base dashed" borderRadius="base">
                            <s-stack direction="inline" justifyContent="space-between" alignItems="center" padding="small-200">
                                <s-heading>New Arrival ({newArrivals.length}/10)</s-heading>
                                <s-tooltip id="new-arrival-tooltip">Maximum 10 Allowed</s-tooltip>
                                <s-button
                                    interestFor="new-arrival-tooltip"
                                    variant="primary"
                                    icon="plus"
                                    onClick={() => handleAddProducts(newArrivals, setNewArrivals, 10)}
                                >
                                    Add Product
                                </s-button>
                            </s-stack>
                            <s-divider />
                            <s-stack>
                                {renderProductTable(newArrivals, setNewArrivals)}
                            </s-stack>
                        </s-box>

                        {/* --- BEST SELLERS BOX --- */}
                        <s-box border="base base dashed" borderRadius="base">
                            <s-stack direction="inline" justifyContent="space-between" alignItems="center" padding="small-200">
                                <s-heading>Best Seller ({bestSellers.length}/5)</s-heading>
                                <s-tooltip id="best-seller-tooltip">Maximum 5 Allowed</s-tooltip>
                                <s-button
                                    interestFor="best-seller-tooltip"
                                    variant="primary"
                                    icon="plus"
                                    onClick={() => handleAddProducts(bestSellers, setBestSellers, 5)}
                                >
                                    Add Product
                                </s-button>
                            </s-stack>
                            <s-divider />
                            <s-stack>
                                {renderProductTable(bestSellers, setBestSellers)}
                            </s-stack>
                        </s-box>

                    </s-stack>
                </>
            )}
        </s-section>
    );
}