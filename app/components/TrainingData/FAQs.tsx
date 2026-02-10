import { useFetcher } from "react-router";
import { useState, useEffect, useMemo } from "react";

// --- Types ---
interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
}

interface FAQFormData {
    question: string;
    answer: string;
    category: string;
}

const CATEGORIES = ["General", "Shipping", "Returns", "Product", "Payment", "Account"];

export default function FAQs() {
    const loader = useFetcher<{ tab: string; faqs: FAQ[] }>();
    const fetcher = useFetcher<{ success: boolean; faq?: FAQ; message?: string }>();

    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState<FAQFormData>({ question: "", answer: "", category: "General" });
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
    const [notification, setNotification] = useState<{ tone: string; message: string } | null>(null);

    // Self-load on mount
    useEffect(() => {
        if (loader.state === "idle" && !loader.data) {
            loader.load("/app/trainingdata?tab=faqs");
        }
    }, []);

    // Sync fetched data
    useEffect(() => {
        if (loader.data?.faqs) {
            setFaqs(loader.data.faqs);
        }
    }, [loader.data]);

    // Handle CRUD action responses
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.success) {
            loader.load("/app/trainingdata?tab=faqs");
            setNotification({ tone: "success", message: editingFaq ? "FAQ updated!" : "FAQ saved!" });
            resetForm();
            setTimeout(() => setNotification(null), 3000);
        }
    }, [fetcher.state, fetcher.data]);

    const isBusy = fetcher.state !== "idle";

    const resetForm = () => {
        setEditingFaq(null);
        setFormData({ question: "", answer: "", category: "General" });
    };

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = !searchQuery ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [faqs, searchQuery]);

    // Loading state
    if (loader.state === "loading" || !loader.data) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
                <s-spinner size="large"></s-spinner>
            </div>
        );
    }

    const openCreate = () => {
        resetForm();
    };

    const openEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer, category: faq.category });
    };

    const handleSave = () => {
        if (!formData.question.trim() || !formData.answer.trim()) return;
        const data: Record<string, string> = {
            intent: editingFaq ? "editGeneralFaq" : "addGeneralFaq",
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
        };
        if (editingFaq) {
            data.faqId = editingFaq.id;
        }
        fetcher.submit(data, { method: "post" });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        fetcher.submit({ intent: "deleteGeneralFaq", faqId: deleteTarget.id }, { method: "post" });
        setDeleteTarget(null);
        setNotification({ tone: "success", message: "FAQ deleted." });
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <>
            {/* Notification Banner */}
            {notification && (
                <s-banner tone={notification.tone}>
                    {notification.message}
                </s-banner>
            )}

            {/* Search + Add */}
            <s-section>
                <s-grid gridTemplateColumns="1fr auto" gap="base" justifyContent="space-between" alignItems="center">
                    <s-search-field
                        placeholder="Search FAQs..."
                        value={searchQuery}
                        onInput={(e: any) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery("")}
                    />
                    <s-button
                        variant="primary"
                        icon="plus"
                        commandFor="faq-form-modal"
                        command="--show"
                        onClick={openCreate}
                    >
                        Add Question
                    </s-button>
                </s-grid>
            </s-section>

            {/* FAQ List */}
            <s-section padding="none">
                <s-stack gap="small">
                    {filteredFaqs.length === 0 && (
                        <s-stack padding="large" justifyContent="center" alignItems="center" gap="base">
                            <s-text>
                                {faqs.length === 0
                                    ? "No FAQs yet. Click \"Add Question\" to create your first one."
                                    : "No FAQs match your search."}
                            </s-text>
                        </s-stack>
                    )}

                    {filteredFaqs.map((faq) => (
                        <s-stack key={faq.id} border="base" padding="small base" borderRadius="base" gap="small-200">
                            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                                <s-badge size="large" color="strong">
                                    <span style={{ textTransform: "uppercase" }}>{faq.category}</span>
                                </s-badge>
                                <s-stack direction="inline" gap="base">
                                    <s-button
                                        variant="tertiary"
                                        tone="neutral"
                                        icon="edit"
                                        commandFor="faq-form-modal"
                                        command="--show"
                                        onClick={() => openEdit(faq)}
                                    />
                                    <s-button
                                        variant="tertiary"
                                        tone="critical"
                                        icon="delete"
                                        commandFor="faq-delete-modal"
                                        command="--show"
                                        onClick={() => setDeleteTarget(faq)}
                                    />
                                </s-stack>
                            </s-stack>
                            <s-heading>Q: {faq.question}</s-heading>
                            <s-text>
                                <span style={{ fontWeight: "bold" }}>A:</span> {faq.answer}
                            </s-text>
                        </s-stack>
                    ))}

                    {/* Create CTA at the bottom */}
                    <s-clickable
                        border="large-100 strong dashed"
                        borderRadius="base"
                        padding="base"
                        commandFor="faq-form-modal"
                        command="--show"
                        onClick={openCreate}
                    >
                        <s-stack padding="base" justifyContent="center" alignItems="center">
                            <s-button icon="plus">
                                <span style={{ fontSize: "1.15em", padding: "0.3em" }}>Create New FAQ</span>
                            </s-button>
                        </s-stack>
                    </s-clickable>
                </s-stack>
            </s-section>

            {/* Create / Edit Modal */}
            <s-modal
                id="faq-form-modal"
                heading={editingFaq ? "Edit FAQ" : "Add new FAQ"}
                size="large"
            >
                <s-stack gap="base">
                    <s-select
                        label="Category"
                        value={formData.category}
                        onChange={(e: any) =>
                            setFormData({ ...formData, category: e.target.value })
                        }
                    >
                        {CATEGORIES.map((cat) => (
                            <s-option key={cat} value={cat}>
                                {cat}
                            </s-option>
                        ))}
                    </s-select>

                    <s-text-field
                        label="Question"
                        placeholder="e.g. How long does shipping take?"
                        value={formData.question}
                        onInput={(e: any) =>
                            setFormData({ ...formData, question: e.target.value })
                        }
                    />

                    <s-text-area
                        label="Answer"
                        placeholder="e.g. Standard shipping takes 3-5 business days."
                        rows={4}
                        value={formData.answer}
                        onInput={(e: any) =>
                            setFormData({ ...formData, answer: e.target.value })
                        }
                    />
                </s-stack>

                <s-button
                    slot="secondary-actions"
                    commandFor="faq-form-modal"
                    command="--hide"
                >
                    Cancel
                </s-button>
                <s-button
                    slot="primary-action"
                    variant="primary"
                    commandFor="faq-form-modal"
                    command="--hide"
                    onClick={handleSave}
                    loading={isBusy}
                >
                    {editingFaq ? "Save changes" : "Add FAQ"}
                </s-button>
            </s-modal>

            {/* Delete Confirmation Modal */}
            <s-modal
                id="faq-delete-modal"
                heading="Delete FAQ"
                size="small"
            >
                <s-stack gap="base">
                    <s-text>Are you sure you want to delete this FAQ?</s-text>
                    <s-text tone="caution">This action cannot be undone.</s-text>
                    {deleteTarget && (
                        <s-stack border="base" padding="base" borderRadius="base" background="subdued">
                            <s-heading>Q: {deleteTarget.question}</s-heading>
                        </s-stack>
                    )}
                </s-stack>

                <s-button
                    slot="secondary-actions"
                    commandFor="faq-delete-modal"
                    command="--hide"
                >
                    Cancel
                </s-button>
                <s-button
                    slot="primary-action"
                    variant="primary"
                    tone="critical"
                    commandFor="faq-delete-modal"
                    command="--hide"
                    onClick={handleDelete}
                >
                    Delete
                </s-button>
            </s-modal>
        </>
    );
}