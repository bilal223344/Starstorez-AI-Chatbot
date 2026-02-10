import { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { deleteProductJob, syncCustomerJob, syncOrderJob, syncSingleProductJob } from "../services/webhookService";
import { deleteOrderFromDB } from "app/services/orderService";
import { deleteCustomerFromDB } from "app/services/customerService";

export const action = async ({ request }: ActionFunctionArgs) => {
    // 1. Validate the Webhook came from Shopify
    const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

    if (!admin) {
        // The shop has uninstalled or session is lost
        throw new Response();
    }

    console.log(`[WEBHOOK] Received '${topic}' for ${shop}`);

    // 2. Switch Logic
    try {
        switch (topic) {
            // --- PRODUCTS ---
            case "PRODUCTS_CREATE":
            case "PRODUCTS_UPDATE":
                {
                    const gid = payload.admin_graphql_api_id || `gid://shopify/Product/${payload.id}`;
                    if (gid) await syncSingleProductJob(shop, session.accessToken!, gid);
                }
                break;
            case "PRODUCTS_DELETE":
                if (payload.id) await deleteProductJob(shop, `gid://shopify/Product/${payload.id}`);
                break;

            // --- ORDERS ---
            case "ORDERS_CREATE":
            case "ORDERS_UPDATED": // Note: Shopify topic is UPDATED, not UPDATE
                {
                    const gid = payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`;
                    if (gid) await syncOrderJob(shop, session.accessToken!, gid);
                }
                break;
            case "ORDERS_DELETE":
                if (payload.id) await deleteOrderFromDB(`gid://shopify/Order/${payload.id}`);
                // Also delete from Pinecone if you indexed orders!
                break;

            // --- CUSTOMERS ---
            case "CUSTOMERS_CREATE":
            case "CUSTOMERS_UPDATE":
                {
                    const gid = payload.admin_graphql_api_id || `gid://shopify/Customer/${payload.id}`;
                    if (gid) await syncCustomerJob(shop, session.accessToken!, gid);
                }
                break;
            case "CUSTOMERS_DELETE":
                if (payload.id) await deleteCustomerFromDB(`gid://shopify/Customer/${payload.id}`);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled topic: ${topic}`);
        }
    } catch (error) {
        console.error(`[WEBHOOK ERROR] Failed to process ${topic}:`, error);
        // Return 200 anyway so Shopify doesn't keep retrying and clogging queues
        return new Response();
    }

    return new Response();
};