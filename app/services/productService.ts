import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// SHARED TYPES (Exported for use in other files)
// ============================================================================

export interface ShopifyEdge<T> {
    node: T;
}

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

// ============================================================================
// LOGIC
// ============================================================================

// --- 1. Formatter Function ---
export const formatShopifyProduct = (
    node: ShopifyProductNode,
    shop: string
): Prisma.ProductCreateInput => {

    const rawVariants = node.variants.edges.map((e) => e.node);
    const totalStock = rawVariants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    const price = rawVariants.length > 0 ? parseFloat(rawVariants[0].price) : 0.0;
    const collectionTitles = node.collections.edges.map((edge) => edge.node.title);

    return {
        shop: shop,
        prodId: node.id,
        title: node.title,
        description: node.description || "",
        tags: node.tags || [],
        collection: collectionTitles,
        options: node.options as unknown as Prisma.InputJsonValue,
        price: price,
        stock: totalStock,
        handle: node.handle,
        image: node.featuredImage?.url || "",
        isSynced: true,
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
        variants: {
            create: rawVariants.map((v) => ({
                sku: v.sku || "",
                title: v.title,
                option: v.selectedOptions.map((o) => o.value).join(" / "),
                image: v.image?.url || "",
                stock: v.inventoryQuantity || 0,
            })),
        },
    };
};

// --- 2. Database Save Function (Upsert) ---
export const saveProductToDB = async (
    formattedProduct: Prisma.ProductCreateInput
) => {
    const { variants, ...productData } = formattedProduct;

    // Type assertion for nested create
    const variantsData = (variants as Prisma.ProductVariantCreateNestedManyWithoutProductInput)?.create;

    if (!Array.isArray(variantsData)) {
        throw new Error("Variants data is missing or malformed");
    }

    try {
        const savedProduct = await prisma.product.upsert({
            where: {
                prodId: productData.prodId,
            },
            create: {
                ...productData,
                variants: {
                    create: variantsData as Prisma.ProductVariantCreateWithoutProductInput[],
                },
            },
            update: {
                ...productData,
                variants: {
                    deleteMany: {}, // Wipe old variants
                    create: variantsData as Prisma.ProductVariantCreateWithoutProductInput[], // Re-create new ones
                },
            },
            include: {
                variants: true,
            },
        });

        return savedProduct;
    } catch (error) {
        console.error(`[DB Error] Failed to save product ${productData.title}:`, error);
        throw error;
    }
};