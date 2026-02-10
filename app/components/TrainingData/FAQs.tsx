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

interface FAQFormState {
    question: string;
    answer: string;
    category: string;
}

const CATEGORIES = ["General", "Shipping", "Returns", "Product", "Payment", "Account"];

const DEFAULT_FORM: FAQFormState = { question: "", answer: "", category: "General" };

// --- Component ---
export default function FAQs({ faqs }: { faqs: FAQ[] }) {
    const fetcher = useFetcher<{ success: boolean; message: string }>();
    const [searchQuery, setSearchQuery] = useState("");
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState<FAQFormState>(DEFAULT_FORM);
    const [notification, setNotification] = useState<{ message: string; tone: "success" | "critical" } | null>(null);

    // --- Effects ---
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.success) {
                setNotification({ message: fetcher.data.message || "Done!", tone: "success" });
                setEditingFaq(null);
                setDeleteTarget(null);
                setFormData(DEFAULT_FORM);
            } else {
                setNotification({ message: fetcher.data.message || "Something went wrong", tone: "critical" });
            }
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [fetcher.state, fetcher.data]);

    // --- Filtering ---
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return faqs;
        const q = searchQuery.toLowerCase();
        return faqs.filter(
            (f) =>
                f.question.toLowerCase().includes(q) ||
                f.answer.toLowerCase().includes(q) ||
                f.category.toLowerCase().includes(q)
        );
    }, [faqs, searchQuery]);

    // --- Handlers ---
    const openCreate = () => {
        setEditingFaq(null);
        setFormData(DEFAULT_FORM);
    };

    const openEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer, category: faq.category });
    };

    const handleSave = () => {
        if (!formData.question.trim() || !formData.answer.trim()) return;

        if (editingFaq) {
            fetcher.submit(
                { actionType: "update_store_faq", faqId: editingFaq.id, ...formData },
                { method: "post" }
            );
        } else {
            fetcher.submit(
                { actionType: "create_store_faq", ...formData },
                { method: "post" }
            );
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        fetcher.submit(
            { actionType: "delete_store_faq", faqId: deleteTarget.id },
            { method: "post" }
        );
    };

    const isBusy = fetcher.state !== "idle";

    // --- Render ---
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