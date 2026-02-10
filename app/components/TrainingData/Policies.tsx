
import { CircleCheckBig, FileText, Lock } from "lucide-react";
import { useFetcher } from "react-router";
import { useState, useEffect } from "react";

// --- Types ---
interface PolicyNode {
    id: string;
    title: string;
    body: string;
    updatedAt?: string;
    type: string;
    url: string;
}

// --- Helpers ---
const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// --- PolicyCard Sub-Component ---
function PolicyCard({
    title,
    type,
    policy,
    placeholder,
}: {
    title: string;
    type: string;
    policy?: PolicyNode;
    placeholder: string;
}) {
    const fetcher = useFetcher();
    const [isEditing, setIsEditing] = useState(false);
    const [body, setBody] = useState<string>(policy?.body || "");
    const isSaving = fetcher.state !== "idle";

    useEffect(() => {
        if (policy?.body) setBody(policy.body);
    }, [policy?.body]);

    // After save completes, exit edit mode
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            setIsEditing(false);
        }
    }, [fetcher.state, fetcher.data]);

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setBody(policy?.body || "");
        setIsEditing(false);
    };

    const handleSave = () => {
        fetcher.submit(
            { intent: "savePolicy", type, body },
            { method: "post" }
        );
    };

    return (
        <s-stack direction="inline" gap="base" padding="base" border="base" borderRadius="base" background="subdued">
            <s-stack direction="inline" inlineSize="100%" justifyContent="space-between" alignItems="center">
                <s-stack direction="inline" alignItems="center" gap="small-200">
                    <CircleCheckBig size={16} color={policy ? "green" : "gray"} />
                    <s-heading>{title}</s-heading>
                </s-stack>
                {policy && <s-paragraph>Updated {formatDate(policy.updatedAt)}</s-paragraph>}
            </s-stack>

            <s-text-area
                placeholder={placeholder}
                value={body}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInput={(e: any) => setBody(e.target.value)}
                rows={10}
                disabled={!isEditing}
            />

            <s-stack direction="inline" justifyContent="end" gap="base">
                {isEditing ? (
                    <>
                        <s-button icon="x" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                        </s-button>
                        <s-button variant="primary" icon="save" onClick={handleSave} loading={isSaving}>
                            Save
                        </s-button>
                    </>
                ) : (
                    <s-button icon="edit" onClick={handleEdit}>
                        {policy ? "Edit Policy" : "Add Policy"}
                    </s-button>
                )}
            </s-stack>
        </s-stack>
    );
}

// --- Main Component ---
export default function Policies({ policies: initialPolicies, hasScope: initialHasScope }: { policies: PolicyNode[], hasScope: boolean }) {
    const fetcher = useFetcher();

    const [policies, setPolicies] = useState<PolicyNode[]>(initialPolicies);
    const [hasScope, setHasScope] = useState(initialHasScope);

    // Sync props to state
    useEffect(() => {
        setPolicies(initialPolicies);
        setHasScope(initialHasScope);
    }, [initialPolicies, initialHasScope]);

    // Handle sync completion — parent revalidation will update props
    // We just need to handle the editing state reset if needed, which is already handled in PolicyCard


    const getPolicy = (type: string) => {
        return policies.find((p) => p.type === type);
    };

    const handleSync = () => {
        fetcher.submit({ intent: "syncPolicies" }, { method: "post" });
    };

    const handleRequestScope = async () => {
        // @ts-ignore
        const response = await window.shopify.scopes.request([
            "read_legal_policies",
            "write_legal_policies",
        ]);
        if (response.result === "granted-all") {
            console.log("Scopes granted, please reload or wait for sync.");
        }
    };

    return (
        <s-stack gap="base">
            <s-stack overflow="hidden" borderRadius="base">
                <div style={{ width: "100%", height: "100%", background: "#000000dd" }}>
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center" padding="base">
                        <s-stack direction="inline" alignItems="center" gap="base">
                            <div style={{ width: "50px", height: "50px", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", boxShadow: "rgb(255, 255, 255) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset" }}>
                                <FileText />
                            </div>
                            <s-stack>
                                <s-heading><span style={{ color: "#fff", fontSize: "1.15em" }}>Store Policies</span></s-heading>
                                <div style={{ width: "70%", color: "#fff" }}>
                                    <s-paragraph>
                                        <span style={{ color: "#fff" }}>Your AI uses these documents to answer questions about shipping times, returns, and data handling. Keep them up to date for accurate responses.</span>
                                    </s-paragraph>
                                </div>
                            </s-stack>
                        </s-stack>
                        <s-button icon="reset" onClick={handleSync} loading={fetcher.state === "submitting"}>Sync from Shopify</s-button>
                    </s-stack>
                </div>
            </s-stack>

            {!hasScope ? (
                <s-stack padding="large" gap="large" background="subdued" border="large" borderStyle="dashed" borderRadius="base" justifyContent="center" alignItems="center">
                    <div style={{ width: "60px", height: "60px", borderRadius: "999px", boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lock color="#000" />
                    </div>

                    <s-stack justifyContent="center" alignItems="center" gap="small-100">
                        <s-heading>Access Required</s-heading>
                        <s-paragraph>To display and edit store policies, the app needs permission to read and write legal policies.</s-paragraph>
                        <s-button variant="primary" onClick={handleRequestScope}>Grant Access</s-button>
                    </s-stack>
                </s-stack>
            ) : (
                <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                    <PolicyCard
                        title="Shipping Policy"
                        type="SHIPPING_POLICY"
                        policy={getPolicy("SHIPPING_POLICY")}
                        placeholder="No shipping policy found. Click add to create one."
                    />
                    <PolicyCard
                        title="Refund Policy"
                        type="REFUND_POLICY"
                        policy={getPolicy("REFUND_POLICY")}
                        placeholder="No refund policy found. Click add to create one."
                    />
                    <PolicyCard
                        title="Privacy Policy"
                        type="PRIVACY_POLICY"
                        policy={getPolicy("PRIVACY_POLICY")}
                        placeholder="No privacy policy found. Click add to create one."
                    />
                    <PolicyCard
                        title="Terms of Service"
                        type="TERMS_OF_SERVICE"
                        policy={getPolicy("TERMS_OF_SERVICE")}
                        placeholder="No terms of service found. Click add to create one."
                    />
                </s-grid>
            )}
        </s-stack>
    );
}
