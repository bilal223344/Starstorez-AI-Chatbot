import { PrismaClient } from '@prisma/client';
import { shopifyGraphqlRequest, sleep } from 'app/utils/extra';
import { checkPineconeNamespace, createPineconeNamespace, generateEmbeddings, prepareOrderForPinecone, upsertVectors } from './pineconeService';
import { FormattedOrderData, NamespaceCreationResult, PineconeRecord, ShopifyGraphqlResponse, ShopifyOrderNode, ShopifyOrdersResponse, VectorData } from 'app/types';

const prisma = new PrismaClient();


// --- SYNC ALL ORDERS ---
export const syncAllOrders = async (shop: string, accessToken: string) => {
    console.log(`[SYNC] Starting Order Sync for ${shop}`);

    const nsCheck = await checkPineconeNamespace(shop);
    let namespace = nsCheck.pcNamespace;

    if (!namespace) {
        // Cast the result to your typed interface
        const creation = await createPineconeNamespace(shop) as NamespaceCreationResult | null;
        if (creation?.success) {
            namespace = creation.pcNamespace;
        }
    }

    if (!namespace) throw new Error("Could not setup Pinecone namespace");


    let hasNextPage = true;
    let after: string | null = null;
    let count = 0;

    const query = `
        query ($first: Int, $after: String) {
            orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
                edges {
                    node {
                        id name displayFinancialStatus displayFulfillmentStatus createdAt
                        totalPriceSet { shopMoney { amount } }
                        customer { id email firstName lastName phone createdAt updatedAt }
                        lineItems(first: 10) {
                            edges { node { title quantity sku product { id } } }
                        }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;

    console.log("[ORDER RESPONSE]")

    while (hasNextPage) {
        const response = await shopifyGraphqlRequest({
            shop, accessToken, query, variables: { first: 20, after }
        }) as ShopifyGraphqlResponse<ShopifyOrdersResponse>;

        console.log("[ORDER RESPONSE]", response.data);

        const nodes: ShopifyOrderNode[] = response.data?.orders?.edges.map((e) => e.node) || [];

        if (nodes.length === 0) break;


        const pineconeBatch: VectorData[] = [];

        // Process Batch
        await Promise.all(nodes.map(async (node: ShopifyOrderNode) => {
            // A. Save to DB
            const formatted = formatShopifyOrder(node, shop);
            const savedOrder = await saveOrderToDB(formatted);

            // B. Prepare for Pinecone
            if (savedOrder) {
                // We pass the saved DB object because it contains the internal Customer UUID
                pineconeBatch.push(prepareOrderForPinecone(savedOrder));
            }
        }));

        count += nodes.length;
        console.log(`[SYNC] Processed ${count} orders...`);

        hasNextPage = response.data?.orders.pageInfo.hasNextPage ?? false;
        after = response.data?.orders.pageInfo.endCursor ?? null;

        if (hasNextPage) await sleep(500);
    }
    return count;
};

export const syncOrderById = async (shop: string, accessToken: string, orderId: string) => {
    const query = `
        query ($id: ID!) {
            order(id: $id) {
                id name displayFinancialStatus displayFulfillmentStatus createdAt
                totalPriceSet { shopMoney { amount } }
                customer { id email firstName lastName phone createdAt updatedAt }
                lineItems(first: 20) {
                    edges { node { title quantity sku product { id } } }
                }
            }
        }
    `;

    const response = await shopifyGraphqlRequest({
        shop, accessToken, query, variables: { id: orderId },
    }) as ShopifyGraphqlResponse<{ order: ShopifyOrderNode }>;

    const orderNode = response.data?.order;
    if (!orderNode) {
        console.error(`[SYNC ERROR] Order ${orderId} not found.`);
        return;
    }

    // 1. Save to DB
    const savedOrder = await saveOrderToDB(formatShopifyOrder(orderNode, shop));

    // 2. Sync to Pinecone
    const nsCheck = await checkPineconeNamespace(shop);
    if (nsCheck.pcNamespace && savedOrder && savedOrder.items) {

        // Prepare vector data
        const { textToEmbed, metadata } = prepareOrderForPinecone(savedOrder);

        // Generate Embedding (You need to export generateEmbeddings from pineconeService or move it to a shared util)
        const vectors = await generateEmbeddings([textToEmbed]);

        const record: PineconeRecord = {
            id: `shopify_${orderId.split("/").pop()}`,
            values: vectors[0],
            metadata: metadata
        };

        // Upsert Single Vector
        await upsertVectors(nsCheck.pcNamespace, [record]);
        console.log(`[SYNC] Order ${orderNode.name} synced to DB and Pinecone.`);
    }
};

// --- Formatter ---
export const formatShopifyOrder = (node: ShopifyOrderNode, shop: string): FormattedOrderData & { shop: string } => {
    const rawItems = node.lineItems.edges.map(e => e.node);

    return {
        shopifyId: node.id,
        orderNumber: node.name,
        status: node.displayFulfillmentStatus, // or node.displayFinancialStatus depending on need
        totalPrice: parseFloat(node.totalPriceSet.shopMoney.amount),
        createdAt: new Date(node.createdAt),
        // We prepare the items to be nested in Prisma
        items: {
            create: rawItems.map(item => ({
                productName: item.title,
                quantity: item.quantity,
                sku: item.sku,
                productId: item.product?.id || ""
            }))
        },
        // We pass the raw customer to handle the relationship in the DB function
        _customerPayload: node.customer,
        shop: shop // Pass shop down
    } as any;
};

// --- DB Actions ---
export const saveOrderToDB = async (formattedData: FormattedOrderData & { shop: string }) => {
    const { _customerPayload, items, shop, ...orderData } = formattedData;

    try {
        return (await prisma.order.upsert({
            where: { shopifyId: orderData.shopifyId },
            create: {
                ...orderData,
                OrderItem: items,
                Customer: {
                    connectOrCreate: {
                        where: { shopifyId: _customerPayload.id },
                        create: {
                            shopifyId: _customerPayload.id,
                            email: _customerPayload.email,
                            lastName: _customerPayload.lastName,
                            source: "SHOPIFY",
                            shop: shop,
                            updatedAt: new Date()
                        } as any
                    }
                }
            } as any,
            update: {
                ...orderData,
                OrderItem: {
                    deleteMany: {},
                    create: items.create
                }
            } as any,
            include: {
                Customer: true,
                OrderItem: true
            } as any
        })) as any;
    } catch (error) {
        console.error(`[DB Error] Order Sync Failed:`, error);
        throw error;
    }
};

export const deleteOrderFromDB = async (shopifyId: string) => {
    try {
        await prisma.order.delete({ where: { shopifyId } });
        console.log(`[DB] Deleted Order ${shopifyId}`);
    } catch (error) {
        console.error(`[DB Error] Delete Order Failed:`, error);
    }
};