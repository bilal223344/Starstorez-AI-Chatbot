// ============================================================================
// 1. SHOPIFY GENERIC TYPES
// ============================================================================

export interface ShopifyEdge<T> {
    node: T;
}

export interface ShopifyGraphqlResponse<T> {
    data?: T;
    errors?: unknown;
}

export interface PageInfo {
    hasNextPage: boolean;
    endCursor: string | null;
}

// ============================================================================
// 2. SHOPIFY ENTITY NODES (Raw GraphQL Data)
// ============================================================================

export interface ShopifyVariantNode {
    id: string;
    title: string;
    price: string;
    sku: string | null;
    inventoryQuantity: number;
    image: { url: string } | null;
    selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProductNode {
    id: string;
    title: string;
    description: string;
    handle: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    vendor: string;
    productType: string;
    featuredImage: { url: string } | null;
    options: { name: string; values: string[] }[];
    collections: { edges: ShopifyEdge<{ title: string }>[] };
    variants: { edges: ShopifyEdge<ShopifyVariantNode>[] };
}

export interface ShopifyCustomerNode {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ShopifyOrderNode {
    id: string;
    name: string; // Order Number (e.g. #1001)
    displayFinancialStatus: string;
    displayFulfillmentStatus: string;
    totalPriceSet: { shopMoney: { amount: string } };
    createdAt: string;
    customer: ShopifyCustomerNode;
    lineItems: {
        edges: {
            node: {
                title: string;
                quantity: number;
                sku: string | null;
                // Note: Optional/Null in case product is deleted or custom item
                product: { id: string } | null;
            }
        }[]
    };
}

// ============================================================================
// 3. SHOPIFY RESPONSE WRAPPERS
// ============================================================================

export interface ShopifyProductsResponse {
    products: {
        edges: ShopifyEdge<ShopifyProductNode>[];
        pageInfo: PageInfo;
    };
}

export interface ShopifyOrdersResponse {
    orders: {
        edges: ShopifyEdge<ShopifyOrderNode>[];
        pageInfo: PageInfo;
    };
}

export interface ShopifyCustomersResponse {
    customers: {
        edges: ShopifyEdge<ShopifyCustomerNode>[];
        pageInfo: PageInfo;
    };
}

// ============================================================================
// 4. PINECONE TYPES
// ============================================================================

export interface PineconeNamespaceResponse {
    namespaces?: {
        name: string;
        record_count?: number;
    }[];
}

export interface NamespaceCreationResult {
    success: boolean;
    pcNamespace: string;
}

export type RawMetadata = Record<string, unknown>;
export type PineconeMetadata = Record<string, string | number | boolean | string[]>;

export interface PineconeRecord {
    id: string;
    values: number[];
    metadata: RawMetadata;
}

export interface PineconeEmbedResponse {
    data: { values: number[] }[];
}

export interface VectorData {
    textToEmbed: string;
    metadata: RawMetadata;
}

// ============================================================================
// 5. INTERNAL / FORMATTED TYPES (For Prisma Saving)
// ============================================================================

export type FormattedOrderData = {
    shopifyId: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: Date;
    items: {
        create: {
            productName: string;
            quantity: number;
            sku: string | null;
            productId: string;
        }[];
    };
    _customerPayload: ShopifyCustomerNode;
};


export interface SavedOrder {
    shopifyId: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    createdAt: Date;
    customer: {
        id: string; // The Internal Prisma ID
    };
    items: {
        quantity: number;
        productName: string;
    }[];
}