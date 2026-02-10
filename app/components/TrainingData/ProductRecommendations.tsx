import { Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useSubmit } from "react-router";

// Determine if we are in a Shopify App Bridge context for types
declare const shopify: any;

interface Product {
    id: number; // Internal ID
    prodId: string; // Shopify GID
    title: string;
    image?: string;
    // ... other fields from Prisma model if needed
}

interface Campaign {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    triggerKeywords: string[];
    products: { productId: string }[];
    _products?: { id: string; title: string; image?: string }[];
}

interface ProductRecommendationsProps {
    campaigns: Campaign[];
    allProducts: Product[];
}

export default function ProductRecommendations({ campaigns, allProducts }: ProductRecommendationsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampaign, setCurrentCampaign] = useState<Partial<Campaign>>({});
    const submit = useSubmit();

    // SYSTEM CAMPAIGNS CONSTANTS
    const SYSTEM_CAMPAIGNS = ["Best Sellers", "New Arrivals"];
    const SYSTEM_DESCRIPTIONS = {
        "Best Sellers": "Automatically suggests top-selling products.",
        "New Arrivals": "Highlights items added in the last 30 days."
    };
    const SYSTEM_TRIGGERS: Record<string, string[]> = {
        "Best Sellers": ["best sellers", "bestsellers", "top selling", "popular"],
        "New Arrivals": ["new arrivals", "new items", "just in", "latest products"]
    };

    const handleCreateNew = () => {
        setCurrentCampaign({
            name: "",
            description: "",
            isActive: true,
            triggerKeywords: [],
            _products: []
        });
        setIsEditing(true);
    };

    const handleEdit = (campaign: Campaign) => {
        // Hydrate products using allProducts
        const hydratedProducts = campaign.products.map(cp => {
            const product = allProducts.find(p => p.prodId === cp.productId);
            return {
                id: cp.productId,
                title: product?.title || "Product " + cp.productId.split("/").pop(),
                image: product?.image || ""
            };
        });

        setCurrentCampaign({
            ...campaign,
            _products: hydratedProducts
        });
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this campaign?")) {
            const formData = new FormData();
            formData.append("actionType", "delete_campaign");
            formData.append("id", id);
            submit(formData, { method: "post" });
        }
    };

    const handleStatusToggle = (id: string, currentStatus: boolean) => {
        const formData = new FormData();
        formData.append("actionType", "toggle_campaign_status");
        formData.append("id", id);
        formData.append("isActive", (!currentStatus).toString());
        submit(formData, { method: "post" });
    }

    const handleSave = () => {
        const formData = new FormData();
        const actionType = currentCampaign.id ? "update_campaign" : "create_campaign";

        formData.append("actionType", actionType);
        if (currentCampaign.id) formData.append("campaignId", currentCampaign.id);
        formData.append("name", currentCampaign.name || "Untitled Campaign");
        formData.append("description", currentCampaign.description || "");
        formData.append("isActive", currentCampaign.isActive ? "true" : "false");
        formData.append("triggerKeywords", JSON.stringify(currentCampaign.triggerKeywords || []));

        // Extract product IDs
        const productIds = currentCampaign._products?.map(p => p.id) || [];
        formData.append("productIds", JSON.stringify(productIds));

        submit(formData, { method: "post" });
        setIsEditing(false);
    };

    const handleAddProducts = async () => {
        const selection = await shopify.resourcePicker({
            type: 'product',
            multiple: true,
            action: 'select',
            selectionIds: currentCampaign._products?.map(p => ({ id: p.id, variants: [] })) || []
        });


        if (selection) {
            const newProducts = selection.map((p: { id: string; title: string; images?: { originalSrc: string }[] }) => ({
                id: p.id,
                title: p.title,
                image: p.images?.[0]?.originalSrc
            }));

            setCurrentCampaign(prev => ({
                ...prev,
                _products: newProducts // Replace instead of append to avoid duplicates
            }));
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setCurrentCampaign(prev => ({
            ...prev,
            _products: prev._products?.filter(p => p.id !== productId)
        }));
    };

    const handleConfigureSystemCampaign = (type: 'Best Sellers' | 'New Arrivals') => {
        const existing = campaigns.find(c => c.name === type);
        if (existing) {
            handleEdit(existing);
        } else {
            setCurrentCampaign({
                name: type,
                description: SYSTEM_DESCRIPTIONS[type],
                isActive: true,
                triggerKeywords: SYSTEM_TRIGGERS[type],
                _products: []
            });
            setIsEditing(true);
        }
    };

    // --- RENDER HELPERS ---


    if (isEditing) {
        return (
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
                        <s-button variant="primary" icon="save" onClick={handleSave}>Save Changes</s-button>
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
                                <s-stack key={product.id} overflow="hidden" border="base" borderRadius="base">
                                    <div style={{ background: "white", width: "100%" }}>
                                        <s-grid gridTemplateColumns="auto 1fr auto" gap="base" padding="base">
                                            {product.image && <s-thumbnail src={product.image} />}
                                            <s-stack>
                                                <s-heading>{product.title}</s-heading>
                                                <s-text>ID: {product.id.split("/").pop()}</s-text>
                                            </s-stack>
                                            <s-button tone="critical" variant="primary" icon="delete" onClick={() => handleRemoveProduct(product.id)} />
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
                                    <s-table-cell>{campaign.products?.length || 0} items</s-table-cell>
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
    )
}
