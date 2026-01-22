import { useState, useEffect, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
    useLoaderData,
    useFetcher,
    useSearchParams,
    useSubmit,
    Form,
    useNavigation
} from "react-router";
import { authenticate } from "../shopify.server";
import { syncProduct } from "../services/productService";
import prisma from "../db.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { Prisma } from "@prisma/client";
import { CallbackEvent } from "@shopify/polaris-types";

// ============================================================================
// TYPES
// ============================================================================

interface ProductWithVariants {
    id: number;
    prodId: string;
    title: string;
    image: string | null;
    price: number;
    stock: number;
    isSynced: boolean;
    collection: string[];
    handle: string | null;
    updatedAt: string;
    variants: { id: number; sku: string; stock: number }[];
}

// ============================================================================
// LOADER
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const url = new URL(request.url);

    // Extract Params
    const search = url.searchParams.get("search") || "";
    const collectionFilter = url.searchParams.get("collection") || "";
    const availabilityFilter = url.searchParams.get("availability") || "";
    const priceMin = url.searchParams.get("priceMin") ? parseFloat(url.searchParams.get("priceMin")!) : undefined;
    const priceMax = url.searchParams.get("priceMax") ? parseFloat(url.searchParams.get("priceMax")!) : undefined;
    const sortBy = url.searchParams.get("sortBy") || "updatedAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = 50;

    // Build Query
    const where: Prisma.ProductWhereInput = { shop };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { variants: { some: { sku: { contains: search, mode: "insensitive" } } } }
        ];
    }
    if (collectionFilter) where.collection = { has: collectionFilter };

    if (availabilityFilter === "in_stock") where.stock = { gt: 0 };
    else if (availabilityFilter === "out_of_stock") where.stock = { lte: 0 };

    if (priceMin !== undefined || priceMax !== undefined) {
        where.price = {};
        if (priceMin !== undefined) where.price.gte = priceMin;
        if (priceMax !== undefined) where.price.lte = priceMax;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    // Dynamic key access safe here due to explicit fallback
    // @ts-expect-error - Dynamic key access safe here due to explicit fallback
    orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";

    const [products, totalProducts, stats, allProducts] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            include: { variants: { select: { id: true, sku: true, stock: true } } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.product.count({ where }),
        // GroupBy is more efficient for stats
        prisma.product.groupBy({
            by: ['isSynced'],
            where: { shop },
            _count: true,
        }),
        prisma.product.findMany({ where: { shop }, select: { collection: true } })
    ]);

    // Parse Stats
    const syncedCount = stats.find(s => s.isSynced)?._count || 0;
    const pendingCount = stats.find(s => !s.isSynced)?._count || 0;

    const lastSyncedProduct = await prisma.product.findFirst({
        where: { shop, isSynced: true },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
    });

    const collections = Array.from(new Set(allProducts.flatMap((p) => p.collection))).sort();

    return {
        products: products as unknown as ProductWithVariants[],
        totalProducts,
        syncedCount,
        pendingCount,
        errorCount: 0,
        lastSyncTime: lastSyncedProduct?.updatedAt || null,
        collections,
        shop,
        page,
        pageSize
    };
};

// ============================================================================
// ACTION
// ============================================================================

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const intent = formData.get("intent");
    const shop = session.shop;

    try {
        switch (intent) {
            case "sync": {
                const result = await syncProduct(shop, session.accessToken!);
                return { success: true, message: "Sync completed", result };
            }
            case "update-frequency": {
                return { success: true, frequency: formData.get("frequency") };
            }
            case "bulk-link": {
                const productIds = formData.getAll("productIds").map(id => parseInt(id as string));
                await prisma.product.updateMany({
                    where: { shop, id: { in: productIds } },
                    data: { isSynced: true },
                });
                return { success: true, message: `${productIds.length} products linked` };
            }
            case "link-product": {
                const id = parseInt(formData.get("productId") as string);
                await prisma.product.update({ where: { id }, data: { isSynced: true } });
                return { success: true, message: `Product linked` };
            }
            default:
                return { success: false, message: "Unknown action" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Action failed" };
    }
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProductsManagement() {
    const loaderData = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    const [searchParams, setSearchParams] = useSearchParams();
    const submit = useSubmit();
    const navigation = useNavigation();
    const shopify = useAppBridge();

    // Local selection state
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    // Client-side persistence for frequency
    const [syncFrequency, setSyncFrequency] = useState(() =>
        (typeof window !== "undefined" ? localStorage.getItem("syncFrequency") : "real-time") || "real-time"
    );

    // Toast & Error Handling
    useEffect(() => {
        if (fetcher.data) {
            const isError = !fetcher.data.success;
            shopify.toast.show(fetcher.data.message || (isError ? "Action failed" : "Success"), { isError });

            if (fetcher.data.success) {
                if (fetcher.data.frequency) localStorage.setItem("syncFrequency", fetcher.data.frequency as string);
                if (fetcher.state === "idle" && !fetcher.data.frequency) setSelectedProducts(new Set());
            }
        }
    }, [fetcher.data, fetcher.state, shopify]);

    // --- Handlers ---

    // Debounced Search Handler
    const handleSearch = useCallback((e: Event) => {
        const target = e.target as HTMLInputElement;
        const form = target.closest('form');
        if (form) {
            submit(form, { replace: true });
        }
    }, [submit]);

    // Manual Submit for Popover controls
    const handleControlChange = (e: Event) => {
        const target = e.target as HTMLElement;
        const form = target.closest('form');
        if (form) submit(form);
    };

    // Handle pagination via URL
    const handlePageChange = (direction: 'next' | 'prev') => {
        const newPage = direction === 'next' ? loaderData.page + 1 : loaderData.page - 1;
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage.toString());
        setSearchParams(newParams);
    };

    const handleSync = () => fetcher.submit({ intent: "sync" }, { method: "POST" });

    const handleFrequencyChange = (frequency: string) => {
        setSyncFrequency(frequency);
        fetcher.submit({ intent: "update-frequency", frequency }, { method: "POST" });
    };

    const handleBulkAction = (intent: "bulk-link") => {
        if (selectedProducts.size === 0) return;
        const formData = new FormData();
        formData.set("intent", intent);
        selectedProducts.forEach((id) => formData.append("productIds", id.toString()));
        fetcher.submit(formData, { method: "POST" });
    };

    const toggleProductSelection = (productId: number) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) newSelected.delete(productId);
        else newSelected.add(productId);
        setSelectedProducts(newSelected);
    };

    const toggleAllSelection = () => {
        if (selectedProducts.size === loaderData.products.length) setSelectedProducts(new Set());
        else setSelectedProducts(new Set(loaderData.products.map((p) => p.id)));
    };

    const isSyncing = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "sync";
    const isLoading = navigation.state === "loading";


    console.log("loaderData", loaderData.page * loaderData.pageSize, loaderData.totalProducts);

    return (
        <s-page heading="Products Management">
            <s-section heading="Overview" padding="base">
                <s-grid gridTemplateColumns="repeat(4, 1fr)" gap="base">
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-stack gap="small">
                            <s-text>Frequency</s-text>
                            <s-select
                                value={syncFrequency}
                                onChange={(e: CallbackEvent<"s-select">) => handleFrequencyChange(e.currentTarget.value)}
                            >
                                <s-option value="real-time">Real-time</s-option>
                                <s-option value="hourly">Hourly</s-option>
                                <s-option value="daily">Daily</s-option>
                            </s-select>
                        </s-stack>
                    </s-box>
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-stack gap="small">
                            <s-text>Synced / Pending</s-text>
                            <s-heading>{loaderData.syncedCount} / {loaderData.pendingCount}</s-heading>
                        </s-stack>
                    </s-box>
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-stack gap="small">
                            <s-text>Actions</s-text>
                            <s-button onClick={handleSync} loading={isSyncing} variant="primary">Sync Now</s-button>
                        </s-stack>
                    </s-box>
                </s-grid>
            </s-section>

            {/* --- Table Section --- */}
            <s-section padding="none">
                <s-table
                    paginate
                    hasNextPage={loaderData.page * loaderData.pageSize < loaderData.totalProducts}
                    hasPreviousPage={loaderData.page > 1}
                    loading={isLoading}
                    onNextPage={() => handlePageChange('next')}
                    onPreviousPage={() => handlePageChange('prev')}
                >
                    {/* --- Integrated Filters Slot --- */}
                    <div slot="filters">
                        <Form method="get" onChange={(e) => submit(e.currentTarget)}>
                            <s-grid gridTemplateColumns="1fr auto auto auto" gap="small" alignItems="center">
                                {/* Search Field */}
                                <s-search-field
                                    name="search"
                                    placeholder="Search products..."
                                    value={searchParams.get("search") || ""}
                                    onInput={handleSearch}
                                />

                                {/* Filter Button + Popover */}
                                <s-button icon="filter" variant="secondary" commandFor="filter-popover">Filter</s-button>
                                <s-popover id="filter-popover" minInlineSize="300px">
                                    <s-box padding="base">
                                        <s-stack gap="base">
                                            <s-select label="Collection" name="collection" value={searchParams.get("collection") || ""} onChange={handleControlChange}>
                                                <s-option value="">All Collections</s-option>
                                                {loaderData.collections.map((col) => (
                                                    <s-option key={col} value={col}>{col}</s-option>
                                                ))}
                                            </s-select>
                                            <s-select label="Status" name="availability" value={searchParams.get("availability") || ""} onChange={handleControlChange}>
                                                <s-option value="">All Status</s-option>
                                                <s-option value="in_stock">In Stock</s-option>
                                                <s-option value="out_of_stock">Out of Stock</s-option>
                                            </s-select>
                                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                                <s-text-field label="Min $" name="priceMin" value={searchParams.get("priceMin") || ""} onChange={handleControlChange} />
                                                <s-text-field label="Max $" name="priceMax" value={searchParams.get("priceMax") || ""} onChange={handleControlChange} />
                                            </s-grid>
                                            <s-button onClick={() => { setSearchParams(new URLSearchParams()); }} variant="tertiary">Clear all</s-button>
                                        </s-stack>
                                    </s-box>
                                </s-popover>

                                {/* Sort Button + Popover */}
                                <s-button icon="sort" variant="secondary" commandFor="sort-popover" accessibilityLabel="Sort"></s-button>
                                <s-popover id="sort-popover">
                                    <s-box padding="small">
                                        <s-choice-list label="Sort by" name="sortBy" values={[searchParams.get("sortBy") || "updatedAt"]} onChange={handleControlChange}>
                                            <s-choice value="title">Name</s-choice>
                                            <s-choice value="price">Price</s-choice>
                                            <s-choice value="updatedAt">Date Added</s-choice>
                                        </s-choice-list>
                                        <s-divider />
                                        <s-choice-list label="Order" name="sortOrder" values={[searchParams.get("sortOrder") || "desc"]} onChange={handleControlChange}>
                                            <s-choice value="asc">Ascending</s-choice>
                                            <s-choice value="desc">Descending</s-choice>
                                        </s-choice-list>
                                    </s-box>
                                </s-popover>

                                {/* Bulk Actions */}
                                {selectedProducts.size > 0 && (
                                    <s-stack direction="inline" gap="small">
                                        <s-button onClick={() => handleBulkAction("bulk-link")} variant="primary">Link ({selectedProducts.size})</s-button>
                                    </s-stack>
                                )}
                            </s-grid>
                        </Form>
                    </div>

                    {/* --- Table Header --- */}
                    <s-table-header-row>
                        <s-table-header>
                            <s-checkbox
                                checked={loaderData.products.length > 0 && selectedProducts.size === loaderData.products.length}
                                onChange={toggleAllSelection}
                            />
                        </s-table-header>
                        <s-table-header>Image</s-table-header>
                        <s-table-header>Product</s-table-header>
                        <s-table-header>SKU</s-table-header>
                        <s-table-header>Price</s-table-header>
                        <s-table-header>Stock</s-table-header>
                        <s-table-header>Synced</s-table-header>
                        <s-table-header>Actions</s-table-header>
                    </s-table-header-row>

                    {/* --- Table Body --- */}
                    <s-table-body>
                        {loaderData.products.length === 0 ? (
                            <s-table-row>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell><s-text>No products found</s-text></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                            </s-table-row>
                        ) : (
                            loaderData.products.map((product) => (
                                <s-table-row key={product.id}>
                                    <s-table-cell>
                                        <s-checkbox checked={selectedProducts.has(product.id)} onChange={() => toggleProductSelection(product.id)} />
                                    </s-table-cell>
                                    <s-table-cell>
                                        <s-thumbnail size="small" src={product.image || ""} alt={product.title} />
                                    </s-table-cell>
                                    <s-table-cell>
                                        <s-link href={`https://${loaderData.shop}/products/${product.handle || ""}`} target="_blank">{product.title}</s-link>
                                    </s-table-cell>
                                    <s-table-cell><s-text>{product.variants[0]?.sku || "-"}</s-text></s-table-cell>
                                    <s-table-cell><s-text>${product.price.toFixed(2)}</s-text></s-table-cell>
                                    <s-table-cell>
                                        <s-badge tone={product.stock > 0 ? "success" : "critical"}>{product.stock > 0 ? "In Stock" : "Out"}</s-badge>
                                    </s-table-cell>
                                    <s-table-cell>
                                        <s-badge tone={product.isSynced ? "success" : "neutral"}>{product.isSynced ? "Yes" : "No"}</s-badge>
                                    </s-table-cell>
                                    <s-table-cell>
                                        <s-stack direction="inline" gap="small">
                                            <s-button onClick={() => shopify.intents.invoke?.("edit:shopify/Product", { value: product.prodId })} variant="tertiary">Edit</s-button>
                                            {!product.isSynced && (
                                                <s-button
                                                    onClick={() => fetcher.submit({ intent: "link-product", productId: product.id.toString() }, { method: "POST" })}
                                                    variant="primary"
                                                >
                                                    Link
                                                </s-button>
                                            )}
                                        </s-stack>
                                    </s-table-cell>
                                </s-table-row>
                            ))
                        )}
                    </s-table-body>
                </s-table>
            </s-section>
        </s-page>
    );
}