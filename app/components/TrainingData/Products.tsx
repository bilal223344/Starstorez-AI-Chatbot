import { CircleQuestionMark, StickyNote } from "lucide-react";
import { useState, useEffect } from "react";
import { useFetcher, useSubmit } from "react-router";

declare const shopify: any;

interface Product {
    id: number;
    title: string;
    status: string;
    totalInventory: number;
    totalVariants: number;
    tags: string[];
    vendor: string;
    faqs: FAQ[];
    shop: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function Products() {
    const loader = useFetcher<{ tab: string; products: Product[] }>();
    const submit = useSubmit();

    const [products, setProducts] = useState<Product[]>([]);
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");

    // Self-load on mount
    useEffect(() => {
        if (loader.state === "idle" && !loader.data) {
            loader.load("/app/trainingdata?tab=products");
        }
    }, []);

    // Sync fetched data into local state
    useEffect(() => {
        if (loader.data?.products) {
            setProducts(loader.data.products);
        }
    }, [loader.data]);

    // Loading state
    if (loader.state === "loading" || !loader.data) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
                <s-spinner size="large"></s-spinner>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleFaqClick = (product: Product) => {
        setActiveProduct(product);
    };

    const handleCreateFaq = () => {
        if (!activeProduct || !newQuestion.trim() || !newAnswer.trim()) return;
        const formData = new FormData();
        formData.append("intent", "addFaq");
        formData.append("productId", activeProduct.id.toString());
        formData.append("question", newQuestion);
        formData.append("answer", newAnswer);
        submit(formData, { method: "post" });

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newFaqItem: FAQ = { id: tempId, question: newQuestion, answer: newAnswer };
        setProducts(prev => prev.map(p =>
            p.id === activeProduct.id ? { ...p, faqs: [...p.faqs, newFaqItem] } : p
        ));
        setActiveProduct(prev => prev ? { ...prev, faqs: [...prev.faqs, newFaqItem] } : null);
        setNewQuestion("");
        setNewAnswer("");
    };

    const handleDeleteFaq = (faqId: string) => {
        if (!activeProduct) return;
        const formData = new FormData();
        formData.append("intent", "deleteFaq");
        formData.append("faqId", faqId);
        submit(formData, { method: "post" });

        // Optimistic update
        setProducts(prev => prev.map(p =>
            p.id === activeProduct.id ? { ...p, faqs: p.faqs.filter(f => f.id !== faqId) } : p
        ));
        setActiveProduct(prev => prev ? { ...prev, faqs: prev.faqs.filter(f => f.id !== faqId) } : null);
    };

    return (
        <>
            <s-section>
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-stack direction="inline" gap="base" alignItems="center">
                        <s-heading>Products</s-heading>

                        <s-divider direction="block" />

                        <s-button-group gap="none">
                            <s-button slot="secondary-actions">Add Product</s-button>
                            <s-button slot="secondary-actions">Import Products</s-button>
                            <s-button slot="secondary-actions">Sync All</s-button>
                        </s-button-group>
                    </s-stack>
                    <s-stack direction="inline" gap="base">
                        <s-button variant="tertiary" icon="download"></s-button>
                        <s-button icon="reset">Sync</s-button>
                        <s-button variant="primary" icon="plus">Add Product</s-button>
                    </s-stack>
                </s-stack>
            </s-section>

            <s-section padding="none">
                <s-table paginate>
                    {/* --- Filters Slot --- */}
                    <div slot="filters">
                        <s-grid gridTemplateColumns="1fr auto auto" gap="small" alignItems="center">
                            {/* Search Field */}
                            <s-search-field
                                placeholder="Search products..."
                                value={searchTerm}
                                onInput={(e: any) => setSearchTerm(e.target.value)}
                            />

                            {/* Filter Button + Popover */}
                            <s-button icon="filter" variant="secondary" commandFor="filter-popover">Filter</s-button>
                            <s-popover id="filter-popover" minInlineSize="300px">
                                <s-box padding="base">
                                    <s-stack gap="small-200">
                                        <s-select label="Collection">
                                            <s-option value="">All Collections</s-option>
                                        </s-select>

                                        <s-select label="Status">
                                            <s-option value="">All Status</s-option>
                                            <s-option value="in_stock">In Stock</s-option>
                                            <s-option value="out_of_stock">Out of Stock</s-option>
                                        </s-select>

                                        <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                            <s-text-field label="Min $" value={"20"} />
                                            <s-text-field label="Max $" value={"20"} />
                                        </s-grid>

                                        <s-button variant="secondary">Clear all</s-button>
                                    </s-stack>
                                </s-box>
                            </s-popover>

                            {/* Sort Button + Popover */}
                            <s-button icon="sort" variant="secondary" commandFor="sort-popover" accessibilityLabel="Sort"></s-button>
                            <s-popover id="sort-popover">
                                <s-box padding="small">
                                    <s-choice-list label="Sort by">
                                        <s-choice value="title">Name</s-choice>
                                        <s-choice value="price">Price</s-choice>
                                        <s-choice value="updatedAt">Date Added</s-choice>
                                    </s-choice-list>

                                    <s-divider />

                                    <s-choice-list label="Order">
                                        <s-choice value="asc">Ascending</s-choice>
                                        <s-choice value="desc">Descending</s-choice>
                                    </s-choice-list>
                                </s-box>
                            </s-popover>
                        </s-grid>
                    </div>

                    {/* --- Table Header --- */}
                    <s-table-header-row>
                        <s-table-header>Product</s-table-header>
                        <s-table-header>Status</s-table-header>
                        <s-table-header>Inventory</s-table-header>
                        <s-table-header>Tags</s-table-header>
                        <s-table-header>Knowledge</s-table-header>
                        <s-table-header>Action</s-table-header>
                    </s-table-header-row>

                    {/* --- Table Body --- */}
                    <s-table-body>
                        {filteredProducts.map((product) => (
                            <s-table-row key={product.id}>
                                <s-table-cell>
                                    <s-stack direction="inline" alignItems="center" gap="small">
                                        <s-thumbnail size="small" src="" alt={product.title} />
                                        <s-stack>
                                            <s-link target="_blank">{product.title}</s-link>
                                            <s-text>{product.vendor}</s-text>
                                        </s-stack>
                                    </s-stack>
                                </s-table-cell>
                                <s-table-cell><s-badge tone="success">ACTIVE</s-badge></s-table-cell>
                                <s-table-cell>
                                    <s-stack>
                                        <s-text><span style={{ fontWeight: "bold" }}>{product.totalInventory || 0}</span> in stock</s-text>
                                        <s-text>{product.totalVariants || 0} variant</s-text>
                                    </s-stack>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-stack direction="inline" gap="small-100" style={{ flexWrap: "wrap" }}>
                                        {product.tags && product.tags.map((tag: string, i: number) => (
                                            <s-chip key={i}>{tag}</s-chip>
                                        ))}
                                    </s-stack>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-button
                                        variant="secondary"
                                        commandFor="faqs-modal"
                                        command="--show"
                                        onClick={() => handleFaqClick(product)}
                                    >
                                        <s-stack direction="inline" gap="small-200">
                                            <s-icon type="edit" size="small" />
                                            <s-text>{product.faqs ? product.faqs.length : 0} FAQs</s-text>
                                        </s-stack>
                                    </s-button>
                                </s-table-cell>
                                <s-table-cell>
                                    <s-button onClick={() => shopify.intents.invoke?.("edit:shopify/Product", { id: product.id })} variant="tertiary">Edit</s-button>
                                </s-table-cell>
                            </s-table-row>
                        ))}
                    </s-table-body>
                </s-table>
            </s-section>


            {/* FAQs Modal */}
            <s-modal id="faqs-modal" heading="Manage FAQs">
                <s-stack direction="inline" gap="small" paddingBlockEnd="base" alignItems="center">
                    <s-box border="base" borderRadius="base" background="strong" overflow="hidden" inlineSize="50px" blockSize="50px">
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CircleQuestionMark />
                        </div>
                    </s-box>
                    <s-stack>
                        <s-heading>Product FAQs</s-heading>
                        <s-paragraph>Manage specific questions for {activeProduct?.title}</s-paragraph>
                    </s-stack>
                </s-stack>

                {activeProduct?.faqs && activeProduct.faqs.length > 0 ? (
                    <s-stack gap="small-100">
                        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                            <s-heading>Questions</s-heading>
                            <s-button variant="secondary" icon="plus" commandFor="add-faq-question-modal" command="--show">Add Question</s-button>
                        </s-stack>

                        {activeProduct.faqs.map((faq: FAQ) => (
                            <s-stack key={faq.id} background="strong" padding="small-200" border="base" borderRadius="base">
                                <s-stack direction="inline" alignItems="center" justifyContent="space-between">
                                    <div style={{ width: "80%" }}>
                                        <s-heading>{faq.question}</s-heading>
                                    </div>
                                    <s-stack direction="inline" alignItems="center" gap="small-200">
                                        <s-button variant="tertiary" icon="delete" onClick={() => handleDeleteFaq(faq.id)} />
                                    </s-stack>
                                </s-stack>
                                <s-text>{faq.answer}</s-text>
                            </s-stack>
                        ))}
                    </s-stack>
                ) : (
                    <s-stack padding="large" gap="large" background="subdued" border="large" borderStyle="dashed" borderRadius="base" justifyContent="center" alignItems="center">
                        <div style={{ width: "60px", height: "60px", borderRadius: "999px", boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <StickyNote color="#000" />
                        </div>

                        <s-stack justifyContent="center" alignItems="center" gap="small-100">
                            <s-heading>No FAQs found</s-heading>
                            <s-paragraph>Add questions customers frequently ask about this specific product.</s-paragraph>
                            <s-button variant="tertiary" icon="plus" commandFor="add-faq-question-modal">Add First FAQ</s-button>
                        </s-stack>
                    </s-stack>
                )}

                <s-button slot="secondary-actions" commandFor="faqs-modal" command="--hide">
                    Close
                </s-button>

            </s-modal>

            <s-modal id="add-faq-question-modal" heading="Add FAQ Question">
                <s-stack direction="inline" gap="small" paddingBlockEnd="base" alignItems="center">
                    <s-box border="base" borderRadius="base" background="strong" overflow="hidden" inlineSize="50px" blockSize="50px">
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CircleQuestionMark />
                        </div>
                    </s-box>
                    <s-stack>
                        <s-heading>Product FAQs</s-heading>
                        <s-paragraph>Add question for <span style={{ fontWeight: "bold" }}>{activeProduct?.title}</span></s-paragraph>
                    </s-stack>
                </s-stack>

                <s-stack gap="small-100" border="base" borderRadius="base" padding="base">
                    <s-heading>New Question</s-heading>
                    <s-text-field
                        placeholder="e.g. Is this product machine washable?"
                        label="Question"
                        required
                        value={newQuestion}
                        onInput={(e: any) => setNewQuestion(e.target.value)}
                    />
                    <s-text-area
                        placeholder="Provide a clear, concise answer to the question."
                        label="Answer"
                        rows={4}
                        required
                        value={newAnswer}
                        onInput={(e: any) => setNewAnswer(e.target.value)}
                    />
                </s-stack>

                <s-button slot="secondary-actions" commandFor="add-faq-question-modal" command="--hide">
                    Close
                </s-button>
                <s-button
                    slot="primary-action"
                    variant="primary"
                    commandFor="add-faq-question-modal"
                    command="--hide"
                    onClick={handleCreateFaq}
                >
                    Save
                </s-button>
            </s-modal>
        </>
    );
}
