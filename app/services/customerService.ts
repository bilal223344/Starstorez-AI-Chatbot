import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// --- Types ---
export interface ShopifyCustomerNode {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
}

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