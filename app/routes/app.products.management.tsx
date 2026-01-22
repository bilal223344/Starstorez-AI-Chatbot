import { useEffect, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
    useLoaderData,
    useFetcher,
    useSearchParams,
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
    // @ts-expect-error - Dynamic key access
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
        prisma.product.groupBy({
            by: ['isSynced'],
            where: { shop },
            _count: true,
        }),
        prisma.product.findMany({ where: { shop }, select: { collection: true } })
    ]);

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
                // This awaits the long-running process (e.g. 10s)
                const result = await syncProduct(shop, session.accessToken!);
                return { success: true, message: "Sync completed", result };
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
    const navigation = useNavigation();
    const shopify = useAppBridge();

    // --- Effects ---
    useEffect(() => {
        if (fetcher.data) {
            const isError = !fetcher.data.success;
            shopify.toast.show(fetcher.data.message || (isError ? "Action failed" : "Success"), { isError });
        }
    }, [fetcher.data, shopify]);

    // --- Handlers ---

    // Generic URL updater helper
    const updateParam = useCallback((key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        // Reset to page 1 on filter change
        if (key !== "page") newParams.set("page", "1");
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Debounced Search
    const handleSearch = useCallback((e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        // Simple debounce could be added here if needed, 
        // but react-router usually handles rapid setSearchParams calls gracefully
        updateParam("search", value);
    }, [updateParam]);

    // Sort Handler for s-choice-list
    const handleSortChange = (key: "sortBy" | "sortOrder", e: CallbackEvent<"s-choice-list">) => {
        // ChoiceList provides the selected value(s) via currentTarget.value or currentTarget.values
        const value = (e.currentTarget as { value?: string; values?: string[] }).value || 
                     ((e.currentTarget as { values?: string[] }).values?.[0]);
        if (value) updateParam(key, value);
    };

    const handleSync = () => fetcher.submit({ intent: "sync" }, { method: "POST" });

    // --- Loading States ---
    const isSyncing = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "sync";
    const isLoading = navigation.state === "loading";

    return (
        <s-page heading="Products Management">

            {/* --- Metrics Overview --- */}
            <s-section heading="Overview" padding="base">
                <s-grid gridTemplateColumns="repeat(3, 1fr)" gap="base">
                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-grid gap="small-300">
                            <s-text>Last Sync</s-text>
                            <s-heading>{loaderData.lastSyncTime ? new Date(loaderData.lastSyncTime).toLocaleDateString() : "Never"}</s-heading>
                        </s-grid>
                    </s-box>

                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-grid gap="small-300">
                            <s-text>Sync Status</s-text>
                            <s-stack direction="inline" gap="small-200" alignItems="center">
                                <s-text>{loaderData.syncedCount} Synced</s-text>
                                <s-text color="subdued">/</s-text>
                                <s-text>{loaderData.pendingCount} Pending</s-text>
                            </s-stack>
                        </s-grid>
                    </s-box>

                    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                        <s-grid gap="small-300">
                            <s-text>Quick Actions</s-text>
                            <s-button
                                onClick={handleSync}
                                loading={isSyncing}
                                variant="primary"
                                disabled={isSyncing}
                            >
                                {isSyncing ? "Syncing..." : "Sync Now"}
                            </s-button>
                        </s-grid>
                    </s-box>
                </s-grid>
            </s-section>

            {/* --- Index Table Section --- */}
            <s-section padding="none">
                <s-table
                    paginate
                    hasNextPage={loaderData.page * loaderData.pageSize < loaderData.totalProducts}
                    hasPreviousPage={loaderData.page > 1}
                    loading={isLoading}
                    onNextPage={() => updateParam("page", (loaderData.page + 1).toString())}
                    onPreviousPage={() => updateParam("page", (loaderData.page - 1).toString())}
                >
                    {/* --- Filters Slot --- */}
                    <div slot="filters">
                        <s-grid gridTemplateColumns="1fr auto auto" gap="small" alignItems="center">
                            {/* Search Field */}
                            <s-search-field
                                placeholder="Search products..."
                                value={searchParams.get("search") || ""}
                                onInput={handleSearch}
                            />

                            {/* Filter Button + Popover */}
                            <s-button icon="filter" variant="secondary" commandFor="filter-popover">Filter</s-button>
                            <s-popover id="filter-popover" minInlineSize="300px">
                                <s-box padding="base">
                                    <s-stack gap="small-200">
                                        <s-select
                                            label="Collection"
                                            value={searchParams.get("collection") || ""}
                                            onChange={(e: CallbackEvent<"s-select">) => updateParam("collection", e.currentTarget.value)}
                                        >
                                            <s-option value="">All Collections</s-option>
                                            {loaderData.collections.map((col) => (
                                                <s-option key={col} value={col}>{col}</s-option>
                                            ))}
                                        </s-select>

                                        <s-select
                                            label="Status"
                                            value={searchParams.get("availability") || ""}
                                            onChange={(e: CallbackEvent<"s-select">) => updateParam("availability", e.currentTarget.value)}
                                        >
                                            <s-option value="">All Status</s-option>
                                            <s-option value="in_stock">In Stock</s-option>
                                            <s-option value="out_of_stock">Out of Stock</s-option>
                                        </s-select>

                                        <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                            <s-text-field
                                                label="Min $"
                                                value={searchParams.get("priceMin") || ""}
                                                onInput={(e: CallbackEvent<"s-text-field">) => updateParam("priceMin", e.currentTarget.value)}
                                            />
                                            <s-text-field
                                                label="Max $"
                                                value={searchParams.get("priceMax") || ""}
                                                onInput={(e: CallbackEvent<"s-text-field">) => updateParam("priceMax", e.currentTarget.value)}
                                            />
                                        </s-grid>

                                        <s-button
                                            onClick={() => setSearchParams(new URLSearchParams())}
                                            variant="secondary"
                                        >
                                            Clear all
                                        </s-button>
                                    </s-stack>
                                </s-box>
                            </s-popover>

                            {/* Sort Button + Popover */}
                            <s-button icon="sort" variant="secondary" commandFor="sort-popover" accessibilityLabel="Sort"></s-button>
                            <s-popover id="sort-popover">
                                <s-box padding="small">
                                    <s-choice-list
                                        label="Sort by"
                                        values={[searchParams.get("sortBy") || "updatedAt"]}
                                        onChange={(e: CallbackEvent<"s-choice-list">) => handleSortChange("sortBy", e)}
                                    >
                                        <s-choice value="title">Name</s-choice>
                                        <s-choice value="price">Price</s-choice>
                                        <s-choice value="updatedAt">Date Added</s-choice>
                                    </s-choice-list>

                                    <s-divider />

                                    <s-choice-list
                                        label="Order"
                                        values={[searchParams.get("sortOrder") || "desc"]}
                                        onChange={(e: CallbackEvent<"s-choice-list">) => handleSortChange("sortOrder", e)}
                                    >
                                        <s-choice value="asc">Ascending</s-choice>
                                        <s-choice value="desc">Descending</s-choice>
                                    </s-choice-list>
                                </s-box>
                            </s-popover>
                        </s-grid>
                    </div>

                    {/* --- Table Header --- */}
                    <s-table-header-row>
                        <s-table-header>Image</s-table-header>
                        <s-table-header>Product</s-table-header>
                        <s-table-header>SKU</s-table-header>
                        <s-table-header>Price</s-table-header>
                        <s-table-header>Stock</s-table-header>
                        <s-table-header>Synced</s-table-header>
                        <s-table-header>Action</s-table-header>
                    </s-table-header-row>

                    {/* --- Table Body --- */}
                    <s-table-body>
                        {loaderData.products.length === 0 ? (
                            <s-table-row>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell><s-text>No products found</s-text></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                                <s-table-cell></s-table-cell>
                            </s-table-row>
                        ) : (
                            loaderData.products.map((product) => (
                                <s-table-row key={product.id}>
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
                                        <s-button onClick={() => shopify.intents.invoke?.("edit:shopify/Product", { value: product.prodId })} variant="tertiary">Edit</s-button>
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