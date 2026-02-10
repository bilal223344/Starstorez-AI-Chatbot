import { Crown, Sparkles } from "lucide-react";
import { useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

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

export default function ProductRecommendations({ campaigns: initialCampaigns, products: initialProducts }: { campaigns: Campaign[], products: Product[] }) {
    // const loader = useFetcher... -> Removed
    const fetcher = useFetcher();

    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
    const [currentCampaign, setCurrentCampaign] = useState<Partial<Campaign>>({});
    const [isEditing, setIsEditing] = useState(false);

    // For product selection modal
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // We store selected PROD_IDs (strings), not internal IDs
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [productSearchQuery, setProductSearchQuery] = useState("");

    // Sync props to state
    useEffect(() => {
        const rawCampaigns = initialCampaigns;
        const products = initialProducts || [];

        // Map raw campaigns to include full product details in _products
        const augmentedCampaigns = rawCampaigns.map(c => ({
            ...c,
            _products: c.products.map(cp => products.find(p => p.prodId === cp.productId)).filter(Boolean) as Product[]
        }));

        setCampaigns(augmentedCampaigns);
        setAllProducts(products);
    }, [initialCampaigns, initialProducts]);

    // Handle save/action completion
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.success) {
            // loader.load("/app/trainingdata?tab=recommendations"); // Handled by parent revalidation
            setIsEditing(false);
            setCurrentCampaign({});
        }
    }, [fetcher.state, fetcher.data]);

    const filteredProductsForModal = allProducts.filter(p =>
        !productSearchQuery || p.title.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

    const handleCreateNew = () => {
        setCurrentCampaign({
            name: "",
            description: "",
            isActive: true,
            triggerKeywords: [],
            products: [],
            _products: []
        });
        setIsEditing(true);
    };



    const handleEdit = (campaign: Campaign) => {
        setCurrentCampaign({ ...campaign });
        setIsEditing(true);
    };

    const handleConfigureSystemCampaign = (name: string) => {
        const existing = campaigns.find(c => c.name === name);
        if (existing) {
            handleEdit(existing);
        } else {
            // Create a temporary state for a new system campaign
            setCurrentCampaign({
                name: name,
                description: SYSTEM_CAMPAIGNS.includes(name) ? "System managed campaign" : "",
                isActive: true,
                triggerKeywords: SYSTEM_TRIGGERS[name] || [],
                products: [],
                _products: []
            });
            setIsEditing(true);
        }
    };

    const handleDelete = (id: string) => {
        fetcher.submit({ intent: "deleteCampaign", id }, { method: "post" });
    };

    const handleStatusToggle = (id: string, currentStatus: boolean) => {
        fetcher.submit({ intent: "toggleCampaignStatus", id, isActive: !currentStatus }, { method: "post" });
    };

    const handleAddProducts = () => {
        // Pre-select existing products
        const existingIds = new Set(currentCampaign._products?.map(p => p.prodId) || []);
        setSelectedProductIds(existingIds);
        setProductSearchQuery("");
        setIsProductModalOpen(true);
    };

    const confirmAddProducts = () => {
        const selected = allProducts.filter(p => selectedProductIds.has(p.prodId));
        setCurrentCampaign(prev => ({
            ...prev,
            _products: selected
        }));
        setIsProductModalOpen(false);
    };

    const handleRemoveProduct = (prodId: string) => {
        setCurrentCampaign(prev => ({
            ...prev,
            _products: prev._products?.filter(p => p.prodId !== prodId) || []
        }));
    };

    const handleSave = () => {
        if (!currentCampaign.name) return; // Validation

        const productIds = currentCampaign._products?.map(p => p.prodId) || [];

        const data: Record<string, string> = {
            intent: "saveCampaign",
            name: currentCampaign.name,
            description: currentCampaign.description || "",
            isActive: currentCampaign.isActive ? "true" : "false",
            triggerKeywords: JSON.stringify(currentCampaign.triggerKeywords || []),
            productIds: JSON.stringify(productIds)
        };

        if (currentCampaign.id) {
            data.id = currentCampaign.id;
        }

        fetcher.submit(data, { method: "post" });
    };
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
                                    onInput={(e: CallbackEvent<"s-text-field">) => setCurrentCampaign({ ...currentCampaign, name: e.currentTarget.value })}
                                    placeholder="Campaign Name"
                                    disabled={SYSTEM_CAMPAIGNS.includes(currentCampaign.name || "")}
                                />
                                <s-text-field
                                    value={currentCampaign.description}
                                    onInput={(e: CallbackEvent<"s-text-field">) => setCurrentCampaign({ ...currentCampaign, description: e.currentTarget.value })}
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
                                    onInput={(e: CallbackEvent<"s-switch">) => setCurrentCampaign({ ...currentCampaign, isActive: e.currentTarget.checked })}
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
                                            <s-box padding="small" border="base base dashed" borderRadius="base" background="subdued">
                                                {/* @ts-ignore */}
                                                <s-stack direction="inline" gap="small" wrap="wrap">
                                                    {(SYSTEM_TRIGGERS[currentCampaign.name!] || currentCampaign.triggerKeywords)?.map((kw, i) => (
                                                        <s-badge key={i}>{kw}</s-badge>
                                                    ))}
                                                </s-stack>
                                            </s-box>
                                        </s-stack>
                                    ) : (
                                        <>
                                            <s-text-field
                                                label="Trigger Keywords"
                                                details="When a customer message contains these words, this recommendation will be triggered. Separate by comma."
                                                placeholder="e.g., 'new arrivals', 'best sellers', 'sale items'"
                                                value={currentCampaign.triggerKeywords?.join(", ")}
                                                onInput={(e: CallbackEvent<"s-text-field">) => setCurrentCampaign({
                                                    ...currentCampaign,
                                                    triggerKeywords: e.currentTarget.value.split(",").map((s: string) => s.trim())
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
                                    <s-stack key={product.prodId} overflow="hidden" border="base" borderRadius="base" direction="inline" padding="small-200" justifyContent="space-between" alignItems="center">
                                        <s-stack direction="inline" gap="small" alignItems="center">
                                            {product.image && <s-thumbnail size="small-100" src={product.image} alt={product.title} />}
                                            <strong>{product.title}</strong>
                                        </s-stack>
                                        <s-button icon="x" onClick={() => handleRemoveProduct(product.prodId)} />
                                    </s-stack>
                                ))}
                            </s-stack>
                        </s-stack>
                    </s-grid>
                </s-stack>


                <s-modal
                    {...{ open: isProductModalOpen } as any}
                    onClose={() => setIsProductModalOpen(false)}
                    heading="Select Products"
                >
                    <s-stack gap="base" padding="base">
                        <s-search-field
                            placeholder="Search products..."
                            value={productSearchQuery}
                            onInput={(e: CallbackEvent<"s-search-field">) => setProductSearchQuery(e.currentTarget.value)}
                        />
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <s-grid gridTemplateColumns="1fr" gap="small">
                                {filteredProductsForModal.map(p => (
                                    <s-stack key={p.prodId} direction="inline" gap="base" alignItems="center" padding="small" border="base" borderRadius="base">
                                        <s-checkbox
                                            checked={selectedProductIds.has(p.prodId)}
                                            onChange={() => {
                                                const newSet = new Set(selectedProductIds);
                                                if (newSet.has(p.prodId)) {
                                                    newSet.delete(p.prodId);
                                                } else {
                                                    newSet.add(p.prodId);
                                                }
                                                setSelectedProductIds(newSet);
                                            }}
                                        />
                                        {p.image && <s-thumbnail src={p.image} alt={p.title} size="small" />}
                                        <s-text>{p.title}</s-text>
                                    </s-stack>
                                ))}
                            </s-grid>
                        </div>
                        <s-stack direction="inline" justifyContent="end" gap="base">
                            <s-button onClick={() => setIsProductModalOpen(false)}>Cancel</s-button>
                            <s-button variant="primary" onClick={confirmAddProducts}>Done</s-button>
                        </s-stack>
                    </s-stack>
                </s-modal>
            </>
        );
    }

    return (
        <s-stack gap="base">
            <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                {SYSTEM_CAMPAIGNS.map(name => {
                    const campaign = campaigns.find(c => c.name === name);
                    const isActive = campaign?.isActive ?? true;
                    const count = campaign?._products?.length || 0;

                    return (
                        <s-stack key={name} padding="base" border="base" borderRadius="base" gap="base">
                            <div style={{ background: "white" }}>
                                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                    <s-stack direction="inline" gap="base" alignItems="center">
                                        <div style={{ padding: "8px", background: "#f1f2f3", borderRadius: "8px" }}>
                                            {name === "Best Sellers" ? <Crown size={20} /> : <Sparkles size={20} />}
                                        </div>
                                        <s-stack gap="none">
                                            <strong>{name}</strong>
                                            <s-text color="subdued">System Managed</s-text>
                                        </s-stack>
                                    </s-stack>
                                    <s-badge tone={isActive ? "success" : "info"}>{isActive ? "Active" : "Inactive"}</s-badge>
                                </s-stack>
                            </div>

                            <s-stack direction="inline" justifyContent="end" alignItems="center">
                                <s-text>{count} products selected</s-text>
                                <s-button onClick={() => handleConfigureSystemCampaign(name)}>Configure</s-button>
                            </s-stack>
                        </s-stack>
                    );
                })}
            </s-grid>
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
    );
}
