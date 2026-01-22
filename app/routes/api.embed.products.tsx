import { authenticate } from "app/shopify.server";
import { shopifyGraphqlRequest, sleep } from "app/utils/extra";
import { LoaderFunctionArgs } from "react-router";

import {
    formatShopifyProduct,
    saveProductToDB,
    ShopifyProductNode
} from "app/services/productService";

import {
    checkPineconeNamespace,
    createPineconeNamespace,
    batchProcessPinecone
} from "app/services/pineconeService";

// ============================================================================
// TYPES
// ============================================================================



// ============================================================================
// 3. MAIN LOADER (The API Trigger)
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // 1. Authenticate Request
    const { session, admin } = await authenticate.admin(request);

    // 2. Run the Job
    const result = await embedProduct(session.shop, session.accessToken!);

    // 3. Return Response
    return {
        session,
        admin,
        jobResult: result
    };
};
