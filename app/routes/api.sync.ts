// app/routes/app.sync.ts
import { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { syncAllCustomers, syncAllOrders } from "../services/syncService";
import { embedProduct } from "./api.embed.products";

export const loader = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    try {

        await embedProduct(session.shop, session.accessToken!);

        await syncAllCustomers(session.shop, session.accessToken!);

        await syncAllOrders(session.shop, session.accessToken!);

        return { status: "success", message: `Synced` }
    } catch (error) {
        console.error("Sync Error:", error);
        return { status: "error"}
    }
};