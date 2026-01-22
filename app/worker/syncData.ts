import { syncAllCustomers } from "app/services/customerService";
import { syncAllOrders } from "app/services/orderService";
import { syncProduct } from "app/services/productService";


// ===========================================================================
// WORKER ENTRY POINTS
// ===========================================================================

export const syncProductsWorker = async (shop: string, accessToken: string) => {
    try {
        const count = await syncProduct(shop, accessToken);
        return { status: "success", type: "PRODUCTS", count };
    } catch (error: any) {
        console.error("[WORKER ERROR] Products:", error);
        return { status: "error", type: "PRODUCTS", message: error.message };
    }
};

export const syncOrdersWorker = async (shop: string, accessToken: string) => {
    try {
        const count = await syncAllOrders(shop, accessToken);
        return { status: "success", type: "ORDERS", count };
    } catch (error: any) {
        console.error("[WORKER ERROR] Orders:", error);
        return { status: "error", type: "ORDERS", message: error.message };
    }
};

export const syncCustomersWorker = async (shop: string, accessToken: string) => {
    try {
        const count = await syncAllCustomers(shop, accessToken);
        return { status: "success", type: "CUSTOMERS", count };
    } catch (error: unknown) {
        console.error("[WORKER ERROR] Customers:", error);
        return { status: "error", type: "CUSTOMERS", message: error.message };
    }
};