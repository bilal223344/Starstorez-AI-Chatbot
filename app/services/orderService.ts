import { PrismaClient, Prisma } from '@prisma/client';
import { ShopifyCustomerNode } from './customerService';

const prisma = new PrismaClient();

// --- Types ---
export interface ShopifyOrderNode {
    id: string;
    name: string; // Order Number (e.g. #1001)
    displayFinancialStatus: string;
    displayFulfillmentStatus: string;
    totalPriceSet: { shopMoney: { amount: string } };
    createdAt: string;
    customer: ShopifyCustomerNode; // Order includes customer details
    lineItems: {
        edges: {
            node: {
                title: string;
                quantity: number;
                sku: string | null;
            }
        }[]
    };
}

// --- Formatter ---
export const formatShopifyOrder = (node: ShopifyOrderNode) => {
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
                sku: item.sku
            }))
        },
        // We pass the raw customer to handle the relationship in the DB function
        _customerPayload: node.customer
    };
};

// --- DB Actions ---
export const saveOrderToDB = async (formattedData: any) => {
    const { _customerPayload, items, ...orderData } = formattedData;

    try {
        return await prisma.order.upsert({
            where: { shopifyId: orderData.shopifyId },
            create: {
                ...orderData,
                items: items, 
                customer: {
                    connectOrCreate: {
                        where: { shopifyId: _customerPayload.id },
                        create: {
                            shopifyId: _customerPayload.id,
                            email: _customerPayload.email,
                            firstName: _customerPayload.firstName,
                            lastName: _customerPayload.lastName,
                            source: "SHOPIFY"
                        }
                    }
                }
            },
            update: {
                ...orderData,
                items: {
                    deleteMany: {},
                    create: items.create
                }
            },
            include: { 
                customer: true,
                items: true 
            } 
        });
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