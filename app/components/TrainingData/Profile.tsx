import { Store, CheckCircle, AlertCircle } from "lucide-react";
import { useFetcher } from "react-router";
import { useState, useEffect } from "react";

interface BrandProfile {
    story: string;
    location: string;
    website: string;
    storeType: string;
    primaryDomain: string;
}

export default function Profile() {
    const loader = useFetcher<{ tab: string; brandProfile: BrandProfile }>();
    const fetcher = useFetcher<{ success: boolean; message: string }>();

    const [formData, setFormData] = useState({
        story: "",
        location: "",
        website: "",
        storeType: "online",
        primaryDomain: "",
    });
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

    // Self-load on mount
    useEffect(() => {
        if (loader.state === "idle" && !loader.data) {
            loader.load("/app/trainingdata?tab=profile");
        }
    }, []);

    // Sync fetched data into form
    useEffect(() => {
        if (loader.data?.brandProfile) {
            const bp = loader.data.brandProfile;
            setFormData({
                story: bp.story || "",
                location: bp.location || "",
                website: bp.website || bp.primaryDomain || "",
                storeType: bp.storeType || "online",
                primaryDomain: bp.primaryDomain || "",
            });
        }
    }, [loader.data]);

    // Handle save response
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.success) {
                setNotification({ type: 'success', message: 'Brand profile saved successfully!' });
            } else {
                setNotification({ type: 'error', message: fetcher.data.message || 'Failed to save.' });
            }
            setTimeout(() => setNotification(null), 3000);
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

    const handleSave = () => {
        fetcher.submit(
            { intent: "saveBrandProfile", ...formData },
            { method: "post" }
        );
    };

    return (
        <s-stack gap="base">
            <s-stack overflow="hidden" borderRadius="base">
                <div style={{ width: "100%", height: "100%", background: "#152232" }}>
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center" padding="base">
                        <s-stack direction="inline" alignItems="center" gap="base">
                            <div style={{ width: "50px", height: "50px", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", boxShadow: "rgb(255, 255, 255) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset" }}>
                                <Store />
                            </div>
                            <s-stack>
                                <s-heading><span style={{ color: "#fff", fontSize: "1.15em" }}>Store Profile</span></s-heading>
                                <div style={{ width: "70%", color: "#fff" }}>
                                    <s-paragraph>
                                        <span style={{ color: "#fff" }}>Core information about your brand, location, and contact details used by the AI to answer general business questions.</span>
                                    </s-paragraph>
                                </div>
                            </s-stack>
                        </s-stack>
                        <s-button icon="save" onClick={handleSave} loading={fetcher.state === "submitting"}>Save Changes</s-button>
                    </s-stack>
                    {notification && (
                        <div style={{
                            padding: "10px 20px",
                            backgroundColor: notification.type === 'success' ? "#e3fcf7" : "#ffe3e3",
                            color: notification.type === 'success' ? "#006d5c" : "#d72c0d",
                            borderTop: "1px solid rgba(0,0,0,0.1)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {notification.message}
                        </div>
                    )}
                </div>
            </s-stack>

            <s-stack gap="small-200" borderRadius="base" padding="base" border="base" background="subdued">
                <s-heading>Brand Identity</s-heading>
                <s-text-area
                    label="About the Brand"
                    details="The AI uses this to tell your brand story and values."
                    placeholder="Brand Name: [Your Brand Name]\nTagline: [Your Tagline]\nBrand Voice: [e.g., Professional, Friendly, Casual, Witty]\nBrand Personality: [e.g., Modern, Traditional, Eco-conscious, Luxury]"
                    rows={5}
                    value={formData.story}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, story: e.target.value })}
                />
            </s-stack>

            <s-stack gap="small-200" borderRadius="base" padding="base" border="base" background="subdued">
                <s-heading>Location & Operations</s-heading>
                <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                    <s-stack gap="small">
                        <s-text>Store Type</s-text>
                        <s-stack direction="inline" gap="small">
                            <s-button
                                onClick={() => setFormData({ ...formData, storeType: 'online' })}
                                variant={formData.storeType === 'online' ? 'primary' : 'secondary'}
                                icon="globe-lines"
                            >
                                Online Only
                            </s-button>
                            <s-button
                                onClick={() => setFormData({ ...formData, storeType: 'physical' })}
                                variant={formData.storeType === 'physical' ? 'primary' : 'secondary'}
                                icon="store"
                            >
                                Physical Store
                            </s-button>
                        </s-stack>
                    </s-stack>

                    {formData.storeType === 'physical' && (
                        <s-text-field
                            label="Physical Location"
                            icon="location"
                            value={formData.location}
                            onInput={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. 123 Main St, Los Angeles, CA"
                        />
                    )}

                    <s-text-field
                        label="Primary Website"
                        icon="globe-lines"
                        value={formData.website}
                        disabled={true}
                        help-text="Managed in Shopify Settings > Domains"
                    />
                </s-grid>
            </s-stack>
        </s-stack>
    );
}
