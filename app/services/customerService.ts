import { PrismaClient, Prisma } from '@prisma/client';
import { ShopifyCustomerNode, ShopifyCustomersResponse, ShopifyGraphqlResponse } from 'app/types';
import { shopifyGraphqlRequest, sleep } from 'app/utils/extra';
const prisma = new PrismaClient();


// --- SYNC ALL CUSTOMERS ---
export const syncAllCustomers = async (shop: string, accessToken: string) => {
    console.log(`[SYNC] Starting Customer Sync for ${shop}`);

    let hasNextPage = true;
    let after: string | null = null;
    let count = 0;

    const query = `
        query ($first: Int, $after: String) {
            customers(first: $first, after: $after) {
                edges {
                    node { id email firstName lastName createdAt updatedAt }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    `;

    while (hasNextPage) {
        const response = await shopifyGraphqlRequest({
            shop, accessToken, query, variables: { first: 50, after }
        }) as ShopifyGraphqlResponse<ShopifyCustomersResponse>;

        console.log("[CUSTOMER RESPONSE]");

        const data = response.data?.customers;
        if (!data) break;

        const nodes: ShopifyCustomerNode[] = data.edges.map(e => e.node);

        if (nodes.length === 0) break;

        // Save batch to DB
        await Promise.all(nodes.map(async (node: ShopifyCustomerNode) => {
            await saveCustomerToDB(formatShopifyCustomer(node));
        }));

        count += nodes.length;
        console.log(`[SYNC] Processed ${count} customers...`);

        hasNextPage = data.pageInfo.hasNextPage;
        after = data.pageInfo.endCursor;

        if (hasNextPage) await sleep(200);
    }
    return count;
};

export const syncCustomerById = async (shop: string, accessToken: string, customerId: string) => {
    const query = `
        query ($id: ID!) {
            customer(id: $id) {
                id email firstName lastName phone createdAt updatedAt
            }
        }
    `;

    const response = await shopifyGraphqlRequest({
        shop, accessToken, query, variables: { id: customerId },
    }) as ShopifyGraphqlResponse<{ customer: ShopifyCustomerNode }>;

    const customer = response.data?.customer;

    if (customer) {
        await saveCustomerToDB(formatShopifyCustomer(customer));
        console.log(`[SYNC] Customer ${customer.email} synced to DB.`);
    }
};

// --- Formatter ---
export const formatShopifyCustomer = (node: ShopifyCustomerNode): Prisma.CustomerCreateInput => {
    return {
        shopifyId: node.id,
        email: node.email,
        firstName: node.firstName,
        lastName: node.lastName,
        phone: node.phone,
        source: "SHOPIFY", // Explicitly marking source
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
    };
};

// --- DB Actions ---
export const saveCustomerToDB = async (data: Prisma.CustomerCreateInput) => {
    try {
        console.log("[SAVE CUSTOMER DB]");

        // Upsert ensures we Create if new, Update if exists
        return await prisma.customer.upsert({
            where: { shopifyId: data.shopifyId! }, // We know it exists coming from Shopify
            create: data,
            update: data,
        });
    } catch (error) {
        console.error(`[DB Error] Customer Sync Failed:`, error);
        throw error;
    }
};

export const deleteCustomerFromDB = async (shopifyId: string) => {
    try {
        await prisma.customer.delete({
            where: { shopifyId },
        });
        console.log(`[DB] Deleted Customer ${shopifyId}`);
    } catch (error) {
        console.error(`[DB Error] Delete Customer Failed:`, error);
    }
};