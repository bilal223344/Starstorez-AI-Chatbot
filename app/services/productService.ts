import { PrismaClient, Prisma } from '@prisma/client';
import { shopifyGraphqlRequest, sleep } from 'app/utils/extra';
import { batchProcessPinecone, checkPineconeNamespace, createPineconeNamespace } from './pineconeService';
import { ShopifyGraphqlResponse, ShopifyProductNode, ShopifyProductsResponse } from 'app/types';

const prisma = new PrismaClient();



// ============================================================================
// 2. THE JOB FUNCTION (Reusable Logic)
// ============================================================================

/**
 * This is the main "Job" function. 
 * You can call this from a Loader, a Cron Job, or a Queue Worker.
 */
export const syncProduct = async (shop: string, accessToken: string) => {

    // 1. Fetch EVERYTHING (Memory Warning: For stores >10k products, paginating inside the loop is safer)
    const allProducts = await getProducts(shop, accessToken);

    if (allProducts.length === 0) {
        console.log("No products found to sync.");
        return { status: "success", count: 0, message: "No products found" };
    }

    console.log(`[SYNC] Found ${allProducts.length} products. Starting DB Save...`);

    // 2. SAVE TO DB IN BATCHES (Fixes DB Connection Crash)
    const DB_BATCH_SIZE = 50;
    const batches = chunkArray(allProducts, DB_BATCH_SIZE);

    for (const batch of batches) {
        await Promise.all(batch.map(async (node: ShopifyProductNode) => {
            try {
                const formatted = formatShopifyProduct(node, shop);
                await saveProductToDB(formatted);
            } catch (err) {
                console.error(`[DB Error] Failed to save ${node.title}:`, err);
            }
        }));
        await sleep(50);
    }

    console.log(`[SYNC] Database save complete.`);

    // --- STEP 3: SETUP PINECONE NAMESPACE ---
    const namespaceCheck = await checkPineconeNamespace(shop);
    let targetNamespace = namespaceCheck.pcNamespace;

    if (!targetNamespace) {
        const creation = await createPineconeNamespace(shop);
        targetNamespace = creation?.pcNamespace;
    }

    if (!targetNamespace) {
        console.error("[CRITICAL] Could not define a namespace. Aborting Pinecone sync.");
        return { status: "error", count: 0, message: "Namespace creation failed" };
    }

    // --- STEP 4: EMBED & UPLOAD TO PINECONE ---
    // (Your batchProcessPinecone function already handles chunking internally, so this is safe!)
    const processedCount = await batchProcessPinecone(targetNamespace, allProducts);

    console.log(`[JOB COMPLETE] Finished.`);
    console.log(`    - Local DB Saved: ${allProducts.length}`);
    console.log(`    - Pinecone Vectors: ${processedCount}`);

    return {
        status: "success",
        shopifyCount: allProducts.length,
        pineconeCount: processedCount
    };
};

export const syncProductById = async (shop: string, accessToken: string, productId: string) => {
    const query = `
        query ($id: ID!) {
            product(id: $id) {
                id title description vendor productType handle tags createdAt updatedAt
                featuredImage { url }
                options { name values }
                collections(first: 5) { edges { node { title } } }
                variants(first: 50) {
                    edges {
                        node {
                            id title price sku inventoryQuantity
                            image { url }
                            selectedOptions { name value }
                        }
                    }
                }
            }
        }
    `;

    const response = await shopifyGraphqlRequest({
        shop, accessToken, query, variables: { id: productId },
    }) as ShopifyGraphqlResponse<{ product: ShopifyProductNode }>;

    const product = response.data?.product;

    if (!product) {
        console.error(`[SYNC ERROR] Product ${productId} not found on Shopify.`);
        return;
    }

    // 1. Save to DB
    await saveProductToDB(formatShopifyProduct(product, shop));

    // 2. Sync to Pinecone
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace) {
        // Reuse your existing batch processor for a single item
        await batchProcessPinecone(nsCheck.pcNamespace, [product]);
        console.log(`[SYNC] Product ${product.title} synced to DB and Pinecone.`);
    }
};

const getProducts = async (shop: string, accessToken: string): Promise<ShopifyProductNode[]> => {
    const query = `
        query ($first: Int, $after: String){
            products(first: $first, after: $after) {
                edges {
                    node {
                        id title description vendor productType handle tags createdAt updatedAt
                        featuredImage { url }
                        options { name values }
                        collections(first: 5) { edges { node { title } } }
                        variants(first: 50) {
                            edges {
                                node {
                                    id title price sku inventoryQuantity
                                    image { url }
                                    selectedOptions { name value }
                                }
                            }
                        }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;
    console.log(`[JOB START] Syncing products for ${shop}`);
    let hasNextPage = true;
    let after: string | null = null;
    const collectedProducts: ShopifyProductNode[] = [];

    console.log(`Fetching all products from Shopify...`);

    while (hasNextPage) {
        const response = await shopifyGraphqlRequest({
            shop,
            accessToken,
            query,
            variables: { first: 50, after },
        }) as { data: ShopifyProductsResponse; errors?: [] };

        const data = response.data?.products;
        console.log("[SHOPIFY DATA]", response);
        if (!data) break;

        const rawNodes = data.edges.map((e) => e.node);

        // Add to list for Pinecone step
        collectedProducts.push(...rawNodes);

        console.log(`Synced batch: ${rawNodes.length}. Total: ${collectedProducts.length}`);
        hasNextPage = data.pageInfo.hasNextPage;
        after = data.pageInfo.endCursor;

        if (hasNextPage) await sleep(200);
    }

    return collectedProducts;
};

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

export const deleteProductFromDB = async (shopifyId: string) => {
    try {
        // 1. Find the internal database ID first
        const product = await prisma.product.findUnique({
            where: { prodId: shopifyId }
        });

        if (!product) {
            console.log(`[DB] Product ${shopifyId} not found, nothing to delete.`);
            return;
        }

        // 2. Perform a Transaction: Delete Kids -> Then Delete Parent
        await prisma.$transaction([
            // Step A: Delete all variants linked to this product
            prisma.productVariant.deleteMany({
                where: { productId: product.id }
            }),
            // Step B: Delete the product itself
            prisma.product.delete({
                where: { id: product.id }
            })
        ]);

        console.log(`[DB] Successfully deleted product and variants for ${shopifyId}`);

    } catch (error) {
        console.error(`[DB Error] Failed to delete ${shopifyId}:`, error);
    }
};

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};