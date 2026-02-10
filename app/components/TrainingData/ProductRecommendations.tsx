import { Crown, Sparkles } from "lucide-react";
import { useFetcher } from "react-router";
import { useState, useEffect, useMemo } from "react";

// --- Types ---
interface Product {
    id: number;
    prodId: string;
    title: string;
    image?: string;
    // other fields...
}

interface CampaignProduct {
    productId: string; // matches product.prodId
    // other fields if it's a join table
}

interface Campaign {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    triggerKeywords: string[];
    products: CampaignProduct[]; // The raw relation from Prisma
    _products?: Product[]; // Augmented with full product details for UI
}

const SYSTEM_CAMPAIGNS = ["Best Sellers", "New Arrivals"];
const SYSTEM_TRIGGERS: Record<string, string[]> = {
    "Best Sellers": ["best seller", "popular", "trending", "top rated"],
    "New Arrivals": ["new", "fresh", "just in", "latest"],
};

export default function ProductRecommendations() {
    const loader = useFetcher<{ tab: string; campaigns: Campaign[]; products: Product[] }>();
    const fetcher = useFetcher();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampaign, setCurrentCampaign] = useState<Partial<Campaign>>({});

    // For product selection modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // We store selected PROD_IDs (strings), not internal IDs
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [productSearchQuery, setProductSearchQuery] = useState("");

    // Self-load on mount
    useEffect(() => {
        if (loader.state === "idle" && !loader.data) {
            loader.load("/app/trainingdata?tab=recommendations");
        }
    }, []);

    // Sync fetched data
    useEffect(() => {
        if (loader.data?.campaigns) {
            const rawCampaigns = loader.data.campaigns;
            const products = loader.data.products || [];

            // Map raw campaigns to include full product details in _products
            const augmentedCampaigns = rawCampaigns.map(c => ({
                ...c,
                _products: c.products.map(cp => products.find(p => p.prodId === cp.productId)).filter(Boolean) as Product[]
            }));

            setCampaigns(augmentedCampaigns);
            setAllProducts(products);
        }
    }, [loader.data]);

    // Handle save/action completion
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.success) {
            loader.load("/app/trainingdata?tab=recommendations");
            setIsEditing(false);
            setCurrentCampaign({});
        }
    }, [fetcher.state, fetcher.data]);

    const handleCreateNew = () => {
        setCurrentCampaign({
            name: "",
            description: "",
            isActive: true,
            triggerKeywords: [],
            _products: [],
            products: []
        });
        setIsEditing(true);
    };

    const handleEdit = (campaign: Campaign) => {
        setCurrentCampaign(campaign);
        setIsEditing(true);
    };

    const handleConfigureSystemCampaign = (name: string) => {
        // Find existing or create dummy for system campaign
        const existing = campaigns.find(c => c.name === name);
        if (existing) {
            handleEdit(existing);
        } else {
            // If it doesn't exist in DB yet, create a placeholder
            setCurrentCampaign({
                name,
                description: name === "Best Sellers" ? "Automatically suggests top-selling products." : "Highlights items added in the last 30 days.",
                isActive: true,
                triggerKeywords: SYSTEM_TRIGGERS[name],
                _products: [],
                products: []
            });
            setIsEditing(true);
        }
    };

    const handleAddProducts = () => {
        // Initialize selection with current campaign products (using prodId)
        const currentIds = new Set(currentCampaign._products?.map(p => p.prodId) || []);
        setSelectedProductIds(currentIds);
        setProductSearchQuery("");
        setIsProductModalOpen(true);
    };

    const confirmAddProducts = () => {
        const newProducts = allProducts.filter(p => selectedProductIds.has(p.prodId));
        setCurrentCampaign(prev => ({
            ...prev,
            _products: newProducts,
            // We also update the 'products' array to match the shape expected by save
            products: newProducts.map(p => ({ productId: p.prodId }))
        }));
        setIsProductModalOpen(false);
    };

    const handleRemoveProduct = (prodId: string) => {
        setCurrentCampaign(prev => ({
            ...prev,
            _products: prev._products?.filter(p => p.prodId !== prodId) || [],
            products: prev.products?.filter(p => p.productId !== prodId) || []
        }));
    };

    const handleDelete = (campaignId: string) => {
        if (confirm("Are you sure you want to delete this campaign?")) {
            fetcher.submit({ actionType: "delete_campaign", campaignId }, { method: "post" });
        }
    };

    const handleStatusToggle = (campaignId: string, currentStatus: boolean) => {
        fetcher.submit({
            actionType: "update_campaign",
            campaignId,
            isActive: (!currentStatus).toString()
        }, { method: "post" });
    };

    const handleSave = () => {
        const productIds = currentCampaign._products?.map(p => p.prodId) || [];

        const data: any = {
            name: currentCampaign.name,
            description: currentCampaign.description,
            isActive: currentCampaign.isActive?.toString(),
            triggerKeywords: JSON.stringify(currentCampaign.triggerKeywords || []),
            productIds: JSON.stringify(productIds)
        };

        if (currentCampaign.id) {
            data.actionType = "update_campaign";
            data.campaignId = currentCampaign.id;
        } else {
            data.actionType = "create_campaign";
        }

        fetcher.submit(data, { method: "post" });
    };

    // Filter products for modal
    const filteredProductsForModal = allProducts.filter(p =>
        !productSearchQuery || p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

    if (loader.state === "loading" || !loader.data) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
                <s-spinner size="large"></s-spinner>
            </div>
        );
    }

    if (isEditing) {
        return (
            <>
                <s-stack gap="base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
                        <s-stack direction="inline" alignItems="center" gap="base">
                            <s-button variant="tertiary" icon="arrow-left" onClick={() => setIsEditing(false)} />
                            <s-grid gridTemplateColumns="1fr" gap="small-200">
                                <s-text-field
                                    value={currentCampaign.name}
                                    onInput={(e: any) => setCurrentCampaign({ ...currentCampaign, name: e.target.value })}
                                    placeholder="Campaign Name"
                                    disabled={SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "")}
                                />
                                <s-text-field
                                    value={currentCampaign.description}
                                    onInput={(e: any) => setCurrentCampaign({ ...currentCampaign, description: e.target.value })}
                                    placeholder="Describe the purpose of this campaign"
                                    label=""
                                    disabled={SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "")}
                                />
                            </s-grid>
                        </s-stack>
                        <s-stack direction="inline" gap="base" alignItems="center">
                            {!SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "") && (
                                <s-switch
                                    label="Active"
                                    checked={currentCampaign.isActive}
                                    onChange={(e: any) => setCurrentCampaign({ ...currentCampaign, isActive: e.target.checked })}
                                />
                            )}
                            {!SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "") && currentCampaign.id && (
                                <s-button icon="delete" onClick={() => handleDelete(currentCampaign.id!)}>Delete</s-button>
                            )}
                            <s-button variant="primary" icon="save" onClick={handleSave} loading={fetcher.state !== "idle"}>Save Changes</s-button>
                        </s-stack>
                    </s-stack>

                    <s-grid gridTemplateColumns="3fr 2fr" gap="base">
                        <s-stack blockSize="200px" border="base" borderRadius="base" overflow="hidden">
                            <div style={{ background: "white" }}>
                                <s-stack gap="base" padding="base" >
                                    <s-stack direction="inline" alignItems="center" gap="small-200">
                                        <div style={{ width: "40px", height: "40px", backgroundColor: "#FFE52A22", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", boxShadow: "rgb(255, 255, 255, 0.25) 1px 1px 3px 0px inset, rgba(255, 255, 255, 0.2) -1px -1px 3px 1px inset" }}>
                                            <Crown size={20} color="#eed309ff" />
                                        </div>
                                        <s-heading>Triggers</s-heading>
                                    </s-stack>
                                    {SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "") ? (
                                        <s-stack gap="base">
                                            <s-text>These built-in triggers are automatically managed.</s-text>
                                            <s-stack direction="inline" gap="base">
                                                {(SYSTEM_TRIGGERS[currentCampaign.name!] || currentCampaign.triggerKeywords)?.map((kw, i) => (
                                                    <s-badge key={i}>{kw}</s-badge>
                                                ))}
                                            </s-stack>
                                        </s-stack>
                                    ) : (
                                        <>
                                            <s-text-field
                                                label="Trigger Keywords"
                                                details="When a customer message contains these words, this recommendation will be triggered. Separate by comma."
                                                placeholder="e.g., 'new arrivals', 'best sellers', 'sale items'"
                                                value={currentCampaign.triggerKeywords?.join(", ")}
                                                onInput={(e: any) => setCurrentCampaign({
                                                    ...currentCampaign,
                                                    triggerKeywords: e.target.value.split(",").map((s: string) => s.trim())
                                                })}
                                            />

                                            <s-stack direction="inline" gap="base">
                                                {currentCampaign.triggerKeywords?.map((kw, i) => kw && <s-badge key={i}>{kw}</s-badge>)}
                                            </s-stack>
                                        </>
                                    )}
                                </s-stack>
                            </div>
                        </s-stack>

                        <s-stack border="base" borderRadius="base" overflow="hidden">
                            <div style={{ background: "white" }}>
                                <s-stack direction="inline" padding="base" justifyContent="space-between" alignItems="center" gap="base">
                                    <s-heading>Selected Products ({currentCampaign._products?.length || 0})</s-heading>
                                    <s-button icon="plus" onClick={handleAddProducts}>Add Products</s-button>
                                </s-stack>
                            </div>
                            <s-stack padding="base" gap="base">
                                {currentCampaign._products?.map(product => (
                                    <s-stack key={product.prodId} overflow="hidden" border="base" borderRadius="base">
                                        <div style={{ background: "white", width: "100%" }}>
                                            <s-grid gridTemplateColumns="auto 1fr auto" gap="base" padding="base">
                                                {product.image && <s-thumbnail src={product.image} />}
                                                <s-stack>
                                                    <s-heading>{product.title}</s-heading>
                                                    <s-text>ID: {product.prodId.split("/").pop()}</s-text>
                                                </s-stack>
                                                <s-button tone="critical" variant="primary" icon="delete" onClick={() => handleRemoveProduct(product.prodId)} />
                                            </s-grid>
                                        </div>
                                    </s-stack>
                                ))}
                                {(currentCampaign._products?.length || 0) === 0 && (
                                    <s-stack alignItems="center" padding="base">
                                        <s-text>No products selected</s-text>
                                    </s-stack>
                                )}
                            </s-stack>
                        </s-stack>
                    </s-grid>
                </s-stack>

                {/* Product Selection Modal */}
                <s-modal id="product-select-modal" open={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}>
                    <s-stack gap="base" padding="base">
                        <s-heading>Select Products</s-heading>
                        <s-search-field
                            placeholder="Search products..."
                            value={productSearchQuery}
                            onInput={(e: any) => setProductSearchQuery(e.target.value)}
                            onClear={() => setProductSearchQuery("")}
                        />
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <s-stack gap="small">
                                {filteredProductsForModal.map(p => (
                                    <s-stack
                                        key={p.prodId}
                                        direction="inline"
                                        alignItems="center"
                                        gap="base"
                                        padding="small"
                                        border="base"
                                        borderRadius="base"
                                        onClick={() => {
                                            const next = new Set(selectedProductIds);
                                            if (next.has(p.prodId)) next.delete(p.prodId);
                                            else next.add(p.prodId);
                                            setSelectedProductIds(next);
                                        }}
                                        style={{ cursor: "pointer", background: selectedProductIds.has(p.prodId) ? "#f1f8f5" : "transparent" }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedProductIds.has(p.prodId)}
                                            readOnly
                                            style={{ pointerEvents: "none" }}
                                        />
                                        {p.image && <s-thumbnail src={p.image} size="small" />}
                                        <s-text fontWeight={selectedProductIds.has(p.prodId) ? "bold" : "regular"}>{p.title}</s-text>
                                    </s-stack>
                                ))}
                            </s-stack>
                        </div>
                    </s-stack>
                    <s-button slot="primary-action" onClick={confirmAddProducts}>Done</s-button>
                    <s-button slot="secondary-actions" onClick={() => setIsProductModalOpen(false)}>Cancel</s-button>
                </s-modal>
            </>
        );
    }

    return (
        <s-stack gap="base">
            {/* Title(header) */}
            <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="base">
                <s-stack>
                    <s-heading><span style={{ fontSize: "1.5em", fontWeight: "bold" }}>Product Recommendations</span></s-heading>
                    <s-paragraph>Train the AI to suggest the right products for every customer intent.</s-paragraph>
                </s-stack>
                <s-button icon="chat">Test AI</s-button>
            </s-stack>

            <s-stack gap="base">
                <s-stack direction="inline" alignItems="center" gap="small-200">
                    <Sparkles size={16} />
                    <s-text><span style={{ fontWeight: "bold" }}>Core Capabilities</span></s-text>
                </s-stack>
                <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                    {/* Preserved Best Sellers Card */}
                    <s-stack border="base" borderRadius="base" overflow="hidden">
                        <div style={{ background: "white", width: "100%", height: "100%" }}>
                            <s-stack padding="base" direction="inline" justifyContent="space-between" gap="base">
                                <s-stack direction="inline" alignItems="center" gap="small">
                                    <div style={{ width: "50px", height: "50px", backgroundColor: "#FFE52A22", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", boxShadow: "rgb(255, 255, 255, 0.25) 1px 1px 3px 0px inset, rgba(255, 255, 255, 0.2) -1px -1px 3px 1px inset" }}>
                                        <Crown color="#eed309ff" />
                                    </div>
                                    <s-stack gap="small-200">
                                        <s-heading>Best Sellers</s-heading>
                                        <s-text>Automatically suggests top-selling products.</s-text>
                                        <s-stack direction="inline" gap="small">
                                            <s-badge>24 Products</s-badge>
                                            <s-badge tone="success">Active</s-badge>
                                        </s-stack>
                                    </s-stack>
                                </s-stack>
                                <s-stack>
                                    <s-button onClick={() => handleConfigureSystemCampaign('Best Sellers')}>Configure</s-button>
                                </s-stack>
                            </s-stack>
                        </div>
                    </s-stack>

                    {/* Preserved New Arrivals Card */}
                    <s-stack border="base" borderRadius="base" overflow="hidden">
                        <div style={{ background: "white", width: "100%", height: "100%" }}>
                            <s-stack padding="base" direction="inline" justifyContent="space-between" gap="base">
                                <s-stack direction="inline" alignItems="center" gap="small">
                                    <div style={{ width: "50px", height: "50px", backgroundColor: "#B500B222", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", boxShadow: "rgb(255, 255, 255, 0.25) 1px 1px 3px 0px inset, rgba(255, 255, 255, 0.2) -1px -1px 3px 1px inset" }}>
                                        <Sparkles color="#B500B2" />
                                    </div>
                                    <s-stack gap="small-200">
                                        <s-heading>New Arrivals</s-heading>
                                        <s-text>Highlights items added in the last 30 days.</s-text>
                                        <s-stack direction="inline" gap="small">
                                            <s-badge>12 Products</s-badge>
                                            <s-badge tone="success">Active</s-badge>
                                        </s-stack>
                                    </s-stack>
                                </s-stack>
                                <s-stack>
                                    <s-button onClick={() => handleConfigureSystemCampaign('New Arrivals')}>Configure</s-button>
                                </s-stack>
                            </s-stack>
                        </div>
                    </s-stack>
                </s-grid>
            </s-stack>

            <s-stack gap="base">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                    <s-stack direction="inline" alignItems="center" gap="small-200">
                        <Sparkles size={16} />
                        <s-text><span style={{ fontWeight: "bold" }}>Custom Campaigns</span></s-text>
                    </s-stack>
                    <s-stack>
                        <s-button icon="plus" onClick={handleCreateNew}>Create Campaign</s-button>
                    </s-stack>
                </s-stack>

                <s-table>
                    <s-table-header-row>
                        <s-table-header>Campaign Name</s-table-header>
                        <s-table-header>Triggers</s-table-header>
                        <s-table-header>Products</s-table-header>
                        <s-table-header>Status</s-table-header>
                        <s-table-header></s-table-header>
                    </s-table-header-row>

                    <s-table-body>
                        {campaigns.length === 0 ? (
                            <s-table-row>
                                <s-table-cell {...{ colSpan: 5 }}>No campaigns found. Create one to get started.</s-table-cell>
                            </s-table-row>
                        ) : (
                            campaigns.filter(c => !SYSTEM_CAMPAIGNS.includes(c.name)).map(campaign => (
                                <s-table-row key={campaign.id}>
                                    <s-table-cell>{campaign.name}</s-table-cell>
                                    <s-table-cell>
                                        <s-stack direction="inline" gap="small">
                                            {campaign.triggerKeywords.slice(0, 3).map(k => <s-badge key={k}>{k}</s-badge>)}
                                            {campaign.triggerKeywords.length > 3 && <s-badge>+{campaign.triggerKeywords.length - 3}</s-badge>}
                                        </s-stack>
                                    </s-table-cell>
                                    <s-table-cell>{campaign._products?.length || 0} items</s-table-cell>
                                    <s-table-cell>
                                        <s-switch
                                            checked={campaign.isActive}
                                            onChange={() => handleStatusToggle(campaign.id, campaign.isActive)}
                                        />
                                    </s-table-cell>
                                    <s-table-cell>
                                        <s-stack direction="inline" gap="small">
                                            <s-button icon="edit" onClick={() => handleEdit(campaign)} />
                                            <s-button icon="delete" onClick={() => handleDelete(campaign.id)} />
                                        </s-stack>
                                    </s-table-cell>
                                </s-table-row>
                            ))
                        )}
                    </s-table-body>
                </s-table>
            </s-stack>
        </s-stack>
    );
}
