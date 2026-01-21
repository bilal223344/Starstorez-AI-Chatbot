import { useAppBridge } from "@shopify/app-bridge-react";
import React, { useState } from "react";

// 1. Shared Interface
export interface Product {
    id: string;
    title: string;
    images: string;
    handle: string;
    description: string;
    tags: string[];
    vendor: string;
}

interface RecommendedProductsProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function RecommendedProducts({ products, setProducts }: RecommendedProductsProps) {
    const shopify = useAppBridge();

    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => setIsOpen(!isOpen);


    const handleAddProducts = async () => {
        const initialSelectionIds = products.map((product) => ({ id: product.id }));

        const selectedProducts = await shopify.resourcePicker({
            type: 'product',
            selectionIds: initialSelectionIds,
            multiple: 5,
            filter: {
                hidden: true,
                variants: false,
                draft: false,
                archived: false,
            },
        });

        if (selectedProducts) {
            const mappedProducts: Product[] = selectedProducts.map((p) => {
                return {
                    id: p.id,
                    title: p.title,
                    images: p.images?.[0]?.originalSrc || "",
                    handle: p.handle,
                    description: p.descriptionHtml,
                    tags: p.tags,
                    vendor: p.vendor
                };
            });

            console.log("Mapped Data:", mappedProducts);
            setProducts(mappedProducts);
        } else {
            console.log('Picker was cancelled');
        }
    };

    const handleDeleteProduct = (id: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <s-section padding="none">
            <s-stack gap="small-200">
                {/* Header / Instructions */}
                <s-clickable onClick={toggleAccordion} padding="small-200 base">
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Product-specific Recommendation Instructions</span></s-heading>
                            <s-tooltip id="rec-tooltip">
                                Intelligent recommendation system automatically detects customer needs during conversations and suggests relevant products based on your predefined rules. This rules work alongside existing AI functions without interference.
                            </s-tooltip>
                            <s-button variant="tertiary" interestFor="rec-tooltip" icon="info" />
                        </div>
                        <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                    </div>
                </s-clickable>


                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack>
                                <s-text-area rows={4} label="AI Instruction" details="Detailed instructions..." />
                            </s-stack>

                            {/* Product List UI */}
                            <s-stack gap="small-200">
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <s-heading><span style={{ fontWeight: 500 }}>Recommend these products</span> <span>({products.length}/5)</span></s-heading>
                                    {products.length > 0 && (
                                        <s-button variant="primary" icon="plus" onClick={() => handleAddProducts()}>
                                            Add Products
                                        </s-button>
                                    )}
                                </s-stack>

                                {products.length === 0 ? (
                                    <s-box border="base base dashed" borderRadius="base" borderWidth="large">
                                        <s-clickable onClick={() => handleAddProducts()}>
                                            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "0.65em", padding: "1.75em 1em" }}>
                                                <s-icon type="plus" size="base" />
                                                <s-text>Add the Product you want to recommend</s-text>
                                            </div>
                                        </s-clickable>
                                    </s-box>
                                ) : (
                                    <s-table>
                                        <s-table-header-row>
                                            <s-table-header listSlot="primary">Products</s-table-header>
                                            <s-table-header listSlot="secondary">Status</s-table-header>
                                        </s-table-header-row>
                                        <s-table-body>
                                            {products.map((product) => (
                                                <s-table-row key={product.id}>
                                                    <s-table-cell>
                                                        <s-stack direction="inline" gap="small" alignItems="center">
                                                            <s-thumbnail size="small-100" src={product.images} />
                                                            <s-link href="">{product.title}</s-link>
                                                        </s-stack>
                                                    </s-table-cell>
                                                    <s-table-cell>
                                                        <s-button onClick={() => handleDeleteProduct(product.id)} variant="primary" tone="critical">Delete</s-button>
                                                    </s-table-cell>
                                                </s-table-row>
                                            ))}
                                        </s-table-body>
                                    </s-table>
                                )}
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-stack>
        </s-section>
    );
}