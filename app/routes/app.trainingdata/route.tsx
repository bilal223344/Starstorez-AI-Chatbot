import { LoaderFunctionArgs, ActionFunctionArgs, useLoaderData, useSearchParams, Link } from "react-router";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import Discount from "app/components/TrainingData/Discount";
import Policies from "app/components/TrainingData/Policies";
import Products from "app/components/TrainingData/Products";
import ProductRecommendations from "app/components/TrainingData/ProductRecommendations";
import Profile from "app/components/TrainingData/Profile";
import { Database } from "lucide-react";
import FAQs from "app/components/TrainingData/FAQs";
import { syncProductById } from "app/services/productService";

// --- LOADER ---
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;
    const url = new URL(request.url);
    const tab = url.searchParams.get("tab") || "products";

    // Helper for Discounts Access Scopes
    const getDiscountData = async () => {
        let hasScope = false;
        try {
            const scopesResponse = await admin.graphql(`
                query { currentAppInstallation { accessScopes { handle } } }
            `);
            const scopesJson = await scopesResponse.json();
            interface AccessScope { handle: string; }
            const grantedScopes = (scopesJson.data?.currentAppInstallation?.accessScopes || []).map((s: AccessScope) => s.handle);
            hasScope = grantedScopes.includes("read_discounts");
        } catch (e) {
            console.error("Failed to fetch access scopes for discounts", e);
        }

        const discounts = await prisma.discount.findMany({
            where: { shop },
            orderBy: { createdAt: 'desc' }
        });

        const config = await prisma.chatConfiguration.findUnique({
            where: { shop },
            select: { discountSuggestionsEnabled: true }
        });

        return { discounts, hasDiscountScope: hasScope, discountSuggestionsEnabled: config?.discountSuggestionsEnabled ?? true };
    };

    // Helper for Policies
    const getPolicyData = async () => {
        let hasScope = false;
        let currentScopes = "";
        try {
            const scopesResponse = await admin.graphql(`
                query { currentAppInstallation { accessScopes { handle } } }
            `);
            const scopesJson = await scopesResponse.json();
            interface AccessScope { handle: string; }
            const grantedScopes = (scopesJson.data?.currentAppInstallation?.accessScopes || []).map((s: AccessScope) => s.handle);
            currentScopes = grantedScopes.join(",");
            hasScope = currentScopes.includes("read_legal_policies") && currentScopes.includes("write_legal_policies");
        } catch (e) {
            console.error("Failed to fetch access scopes for policies", e);
        }

        interface ShopPolicy {
            id: string;
            title: string;
            body: string;
            url: string;
            type: string;
        }
        let policies: ShopPolicy[] = [];

        if (hasScope) {
            try {
                const response = await admin.graphql(`
                    query {
                        shop {
                            shopPolicies {
                                id
                                title
                                body
                                url
                                type
                            }
                        }
                    }
                `);
                const responseJson = await response.json();
                policies = (responseJson.data?.shop?.shopPolicies || []) as ShopPolicy[];
            } catch (e: unknown) {
                console.error("Failed to fetch policies", e);
                const error = e as Error;
                if (error.message?.includes("Access denied") || JSON.stringify(error).includes("Access denied")) {
                    console.warn("Access denied for policies, marking scope as missing.");
                    hasScope = false;
                }
            }
        }
        return { policies, hasScope };
    };

    // Helper for FAQs
    const getFaqData = async () => {
        const faqCount = await prisma.fAQ.count({ where: { shop } });
        if (faqCount === 0) {
            await prisma.fAQ.createMany({
                data: [
                    {
                        shop,
                        question: "How do I track my order?",
                        answer: "You can track your order by clicking the link in your confirmation email or logging into your account.",
                        category: "Shipping",
                        sortOrder: 0,
                    },
                    {
                        shop,
                        question: "What is your return policy?",
                        answer: "We accept returns within 30 days of purchase. Items must be unused and in original packaging.",
                        category: "Returns",
                        sortOrder: 1,
                    },
                    {
                        shop,
                        question: "Do you ship internationally?",
                        answer: "Yes, we ship to over 50 countries worldwide. Shipping rates calculate at checkout.",
                        category: "Shipping",
                        sortOrder: 2,
                    },
                    {
                        shop,
                        question: "Are your products sustainable?",
                        answer: "Yes, we source 100% recycled materials for our packaging and prioritize eco-friendly manufacturing.",
                        category: "Product",
                        sortOrder: 3,
                    },
                ],
            });
        }
        return await prisma.fAQ.findMany({
            where: { shop },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
        });
    };

    // Helper for Profile
    const getProfileData = async () => {
        let brandProfile = {};
        try {
            const response = await admin.graphql(`
                query {
                    shop {
                        primaryDomain { url }
                        brandStory: metafield(namespace: "ai_context", key: "story") { value }
                        brandLocation: metafield(namespace: "ai_context", key: "location") { value }
                        brandStoreType: metafield(namespace: "ai_context", key: "store_type") { value }
                    }
                }
            `);
            const responseJson = await response.json();
            const shopData = responseJson.data?.shop || {};
            brandProfile = {
                story: shopData.brandStory?.value || "",
                location: shopData.brandLocation?.value || "",
                storeType: shopData.brandStoreType?.value || "online",
                primaryDomain: shopData.primaryDomain?.url || ""
            };
        } catch (e) {
            console.error("Failed to fetch brand metafields", e);
        }
        return brandProfile;
    };

    // Helper for Recommendations
    const getRecommendationsData = async () => {
        const campaigns = await prisma.campaign.findMany({
            where: { shop },
            include: { products: true }
        });
        const products = await prisma.product.findMany({
            where: { shop },
            orderBy: { title: 'asc' }
        });
        return { campaigns, products };
    };

    // --- DEFER ---
    // We only trigger the Promise for the ACTIVE tab. Others are null.

    const getProductsData = async () => {
        const pageStr = url.searchParams.get("page") || "1";
        const page = parseInt(pageStr, 10);
        const query = url.searchParams.get("query") || "";
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage;

        const where: Record<string, unknown> = { shop };
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ];
        }

        const totalProducts = await prisma.product.count({ where });
        const items = await prisma.product.findMany({
            where,
            include: { faqs: true, variants: true },
            orderBy: { title: 'asc' },
            skip,
            take: itemsPerPage
        });

        const totalPages = Math.ceil(totalProducts / itemsPerPage);

        return {
            items,
            page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            total: totalProducts,
            query
        };
    };

    return {
        shop,
        products: tab === "products" ? await getProductsData() : null,
        discounts: tab === "discounts" ? await getDiscountData() : null,
        policies: tab === "policies" ? await getPolicyData() : null,
        faqs: tab === "faqs" ? await getFaqData() : null,
        recommendations: tab === "recommendations" ? await getRecommendationsData() : null,
        profile: tab === "profile" ? await getProfileData() : null,
        activeTab: tab
    };
    /* Using 'await' because 'defer' was removed. This loads data for the active tab before rendering. */
};

// --- ACTION ---
export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;
    const formData = await request.formData();
    const actionType = formData.get("actionType");

    try {
        // --- FAQ ACTIONS ---
        if (actionType === "create_faq") {
            const question = formData.get("question") as string;
            const answer = formData.get("answer") as string;
            const productId = parseInt(formData.get("productId") as string);

            await prisma.productFAQ.create({
                data: { question, answer, productId }
            });
            return Response.json({ success: true, message: "FAQ created" });
        }

        if (actionType === "delete_faq") {
            const faqId = formData.get("faqId") as string;
            await prisma.productFAQ.delete({ where: { id: faqId } });
            return Response.json({ success: true, message: "FAQ deleted" });
        }

        if (actionType === "update_faq") {
            const faqId = formData.get("faqId") as string;
            const question = formData.get("question") as string;
            const answer = formData.get("answer") as string;
            await prisma.productFAQ.update({
                where: { id: faqId },
                data: { question, answer }
            });
            return Response.json({ success: true, message: "FAQ updated" });
        }


        // --- CAMPAIGN ACTIONS ---
        if (actionType === "create_campaign") {
            const name = formData.get("name") as string;
            const description = formData.get("description") as string;
            const isActive = formData.get("isActive") === "true";
            const triggersRaw = formData.get("triggerKeywords"); // Frontend sends 'triggerKeywords'
            const triggers = triggersRaw ? JSON.parse(triggersRaw as string) : [];
            const productIdsRaw = formData.get("productIds");
            const productIds = productIdsRaw ? Array.from(new Set(JSON.parse(productIdsRaw as string))) as string[] : [];

            // Ensure products exist in our DB before linking
            for (const pid of productIds) {
                const productExists = await prisma.product.findUnique({ where: { prodId: pid } });
                if (!productExists) {
                    await syncProductById(shop, session.accessToken!, pid);
                }
            }

            await prisma.campaign.create({
                data: {
                    shop,
                    name,
                    description,
                    isActive,
                    triggerKeywords: triggers,
                    products: {
                        create: productIds.map((pid: string) => ({
                            productId: pid
                        }))
                    }
                }
            });
            return Response.json({ success: true, message: "Campaign created" });
        }

        if (actionType === "update_campaign") {
            const id = formData.get("campaignId") as string; // Frontend sends 'campaignId'
            const name = formData.get("name") as string;
            const description = formData.get("description") as string; // Frontend might send this? Check Form
            const isActive = formData.get("isActive") === "true";
            const triggersRaw = formData.get("triggerKeywords");
            const triggers = triggersRaw ? JSON.parse(triggersRaw as string) : [];
            const productIdsRaw = formData.get("productIds");
            const productIds = productIdsRaw ? Array.from(new Set(JSON.parse(productIdsRaw as string))) as string[] : [];

            // Ensure products exist in our DB before linking
            for (const pid of productIds) {
                const productExists = await prisma.product.findUnique({ where: { prodId: pid } });
                if (!productExists) {
                    await syncProductById(shop, session.accessToken!, pid);
                }
            }

            // Transactional update: update details and replacing products
            await prisma.$transaction([
                prisma.campaignProduct.deleteMany({ where: { campaignId: id } }),
                prisma.campaign.update({
                    where: { id },
                    data: {
                        name,
                        description,
                        isActive,
                        triggerKeywords: triggers,
                        products: {
                            create: productIds.map((pid: string) => ({
                                productId: pid
                            }))
                        }
                    }
                })
            ]);
            return Response.json({ success: true, message: "Campaign updated" });
        }

        if (actionType === "toggle_campaign_status") {
            const id = formData.get("id") as string;
            const isActive = formData.get("isActive") === "true";
            await prisma.campaign.update({
                where: { id },
                data: { isActive }
            });
            return Response.json({ success: true, message: "Campaign status updated" });
        }

        if (actionType === "delete_campaign") {
            const id = formData.get("id") as string;
            await prisma.campaign.delete({ where: { id } });
            return Response.json({ success: true, message: "Campaign deleted" });
        }

        // --- CAMPAIGN PRODUCT ACTIONS ---
        if (actionType === "add_products_to_campaign") {
            const campaignId = formData.get("campaignId") as string;
            const productIds = JSON.parse(formData.get("productIds") as string); // Array of GID strings

            for (const pid of productIds) {
                const exists = await prisma.campaignProduct.findUnique({
                    where: { campaignId_productId: { campaignId, productId: pid } }
                });
                if (!exists) {
                    await prisma.campaignProduct.create({
                        data: { campaignId, productId: pid }
                    });
                }
            }
            return Response.json({ success: true, message: "Products added to campaign" });
        }

        if (actionType === "remove_product_from_campaign") {
            const campaignId = formData.get("campaignId") as string;
            const productId = formData.get("productId") as string;

            await prisma.campaignProduct.delete({
                where: { campaignId_productId: { campaignId, productId } }
            });
            return Response.json({ success: true, message: "Product removed from campaign" });
        }

        if (actionType === "toggle_discounts_master") {
            const enabled = formData.get("enabled") === "true";
            await prisma.chatConfiguration.upsert({
                where: { shop },
                update: { discountSuggestionsEnabled: enabled },
                create: { shop, discountSuggestionsEnabled: enabled }
            });
            return Response.json({ success: true, message: "Master discount setting updated" });
        }

        if (actionType === "toggle_discount") {
            const discountid = formData.get("discountId") as string;
            const isSuggested = formData.get("isSuggested") === "true";

            await prisma.discount.update({
                where: { id: discountid },
                data: { isSuggested }
            });
            return Response.json({ success: true, message: "Discount updated" });
        }

        if (actionType === "sync_discounts") {
            try {
                const response = await admin.graphql(`
                query {
                    codeDiscountNodes(first: 25) {
                        nodes {
                            id
                            codeDiscount {
                                ... on DiscountCodeBasic {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                    codes(first: 1) { nodes { code } }
                                }
                                ... on DiscountCodeBxgy {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                     codes(first: 1) { nodes { code } }
                                }
                                ... on DiscountCodeFreeShipping {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                    codes(first: 1) { nodes { code } }
                                }
                            }
                        }
                    }
                    automaticDiscountNodes(first: 25) {
                        nodes {
                            id
                            automaticDiscount {
                                ... on DiscountAutomaticBasic {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                }
                                ... on DiscountAutomaticBxgy {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                }
                                ... on DiscountAutomaticFreeShipping {
                                    title
                                    status
                                    startsAt
                                    endsAt
                                }
                            }
                        }
                    }
                }
            `);
                const responseJson = await response.json();
                console.log("Shopify Discounts Response:", JSON.stringify(responseJson, null, 2));

                const codeDiscounts = responseJson.data?.codeDiscountNodes?.nodes || [];
                const autoDiscounts = responseJson.data?.automaticDiscountNodes?.nodes || [];

                // Normalize data structure
                const allDiscounts = [
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...codeDiscounts.map((n: { id: string, codeDiscount: any }) => ({
                        id: n.id,
                        data: n.codeDiscount,
                        code: n.codeDiscount.codes?.nodes[0]?.code || ""
                    })),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...autoDiscounts.map((n: { id: string, automaticDiscount: any }) => ({
                        id: n.id,
                        data: n.automaticDiscount,
                        code: "" // Automatic discounts have no code
                    }))
                ];

                console.log(`Found ${allDiscounts.length} total discounts (Code: ${codeDiscounts.length}, Auto: ${autoDiscounts.length}).`);

                // Sync with DB
                for (const discount of allDiscounts) {
                    const discountData = discount.data;
                    const shopifyId = discount.id;
                    const code = discount.code;

                    // Basic upsert logic
                    const existing = await prisma.discount.findUnique({ where: { shopifyId } });
                    if (existing) {
                        await prisma.discount.update({
                            where: { shopifyId },
                            data: {
                                title: discountData.title,
                                status: discountData.status,
                                code: code,
                                startsAt: new Date(discountData.startsAt),
                                endsAt: discountData.endsAt ? new Date(discountData.endsAt) : null,
                            }
                        });
                    } else {
                        await prisma.discount.create({
                            data: {
                                shop,
                                shopifyId,
                                title: discountData.title,
                                status: discountData.status,
                                code: code,
                                startsAt: new Date(discountData.startsAt),
                                endsAt: discountData.endsAt ? new Date(discountData.endsAt) : null,
                                isSuggested: true
                            }
                        });
                    }
                }
                return Response.json({ success: true, message: "Discounts synced from Shopify" });
            } catch (e) {
                console.error("Failed to sync discounts", e);
                return Response.json({ success: false, message: "Failed to sync discounts" });
            }
        }

        if (actionType === "sync_policy") {
            const policiesToSync = ["shipping-policy", "refund-policy", "privacy-policy", "terms-of-service"];
            const results = [];

            const shopIdResp = await admin.graphql('{ shop { id } }');
            const shopIdJson = await shopIdResp.json();
            const shopId = shopIdJson.data?.shop?.id;
            if (!shopId) {
                console.error("Failed to fetch shop ID", shopIdJson);
                return Response.json({ success: false, message: "Failed to fetch Shop ID" });
            }
            const ownerId = `gid://shopify/Shop/${shopId.split('/').pop()}`;

            for (const handle of policiesToSync) {
                const metafieldDef = {
                    namespace: "app_policies",
                    key: handle,
                    type: "single_line_text_field",
                    value: new Date().toISOString(),
                    ownerId
                };

                await admin.graphql(`mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
                    metafieldsSet(metafields: $metafields) {
                        metafields {
                            id
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }`, {
                    variables: {
                        metafields: [metafieldDef]
                    }
                });
                results.push(handle);
            }

            return Response.json({ success: true, message: `Policies synced: ${results.join(", ")}` });
        }

        // --- STORE FAQ ACTIONS ---
        if (actionType === "create_store_faq") {
            const question = formData.get("question") as string;
            const answer = formData.get("answer") as string;
            const category = formData.get("category") as string || "General";

            await prisma.fAQ.create({
                data: { shop, question, answer, category }
            });
            return Response.json({ success: true, message: "FAQ created" });
        }

        if (actionType === "update_store_faq") {
            const faqId = formData.get("faqId") as string;
            const question = formData.get("question") as string;
            const answer = formData.get("answer") as string;
            const category = formData.get("category") as string || "General";

            await prisma.fAQ.update({
                where: { id: faqId },
                data: { question, answer, category }
            });
            return Response.json({ success: true, message: "FAQ updated" });
        }

        if (actionType === "delete_store_faq") {
            const faqId = formData.get("faqId") as string;
            await prisma.fAQ.delete({ where: { id: faqId } });
            return Response.json({ success: true, message: "FAQ deleted" });
        }

        // --- BRAND PROFILE ACTIONS ---
        if (actionType === "update_brand") {
            const story = formData.get("story") as string;
            const location = formData.get("location") as string;
            const storeType = formData.get("storeType") as string;

            // Get Shop ID helper
            const shopIdResp = await admin.graphql('{ shop { id } }');
            const shopIdJson = await shopIdResp.json();
            const shopId = shopIdJson.data.shop.id;

            const metafieldsToSet = [
                { ownerId: shopId, namespace: "ai_context", key: "story", type: "multi_line_text_field", value: story },
                { ownerId: shopId, namespace: "ai_context", key: "location", type: "single_line_text_field", value: location },
                { ownerId: shopId, namespace: "ai_context", key: "store_type", type: "single_line_text_field", value: storeType }
            ].filter(m => m.value && m.value.trim() !== ""); // Filter out empty values

            console.log("[Update Brand] Shop ID:", shopId);
            console.log("[Update Brand] Payload:", JSON.stringify(metafieldsToSet));

            if (metafieldsToSet.length === 0) {
                return Response.json({ success: true, message: "No changes to save." });
            }

            const response = await admin.graphql(`mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
                    metafields {
                        id
                        key
                        value
                    }
                    userErrors {
                        field
                        message
                        }
                }
            }`, {
                variables: {
                    metafields: metafieldsToSet
                }
            });
            const responseJson = await response.json();
            const userErrors = responseJson.data?.metafieldsSet?.userErrors || [];

            if (userErrors.length > 0) {
                return Response.json({ success: false, message: userErrors[0].message });
            }

            return Response.json({ success: true, message: "Brand profile updated" });
        }

        if (actionType === "update_policy") {
            const type = formData.get("type") as string; // e.g. "REFUND_POLICY"
            const body = formData.get("body") as string;

            const response = await admin.graphql(`mutation shopPolicyUpdate($shopPolicy: ShopPolicyInput!) {
                shopPolicyUpdate(shopPolicy: $shopPolicy) {
                    shopPolicy {
                        id
                        body
                        type
                    }
                    userErrors {
                        field
                        message
                        }
                }
            }`, {
                variables: {
                    shopPolicy: {
                        type,
                        body
                    }
                }
            });

            const responseJson = await response.json();
            const userErrors = responseJson.data?.shopPolicyUpdate?.userErrors || [];

            if (userErrors.length > 0) {
                return Response.json({ success: false, message: userErrors[0].message });
            }

            return Response.json({ success: true, message: "Policy updated" });
        }


    } catch (error) {
        console.error("Action Error", error);
        return Response.json({ success: false, error: "Action failed" }, { status: 500 });
    }

    return Response.json({ success: false });
};


export default function TrainingData() {
    const loaderData = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "products";

    const renderContent = () => {
        switch (activeTab) {
            case "products":
                if (!loaderData.products) return null;
                return <Products products={loaderData.products} />;
            case "discounts": {
                if (!loaderData.discounts) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const d = loaderData.discounts as { discounts: any[], discountSuggestionsEnabled: boolean };
                return <Discount 
                    discounts={d?.discounts || []} 
                    discountSuggestionsEnabled={d?.discountSuggestionsEnabled ?? true} 
                />;
            }
            case "policies": {
                if (!loaderData.policies) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const p = loaderData.policies as { policies: any[], hasScope: boolean };
                return <Policies policies={p?.policies || []} hasScope={p?.hasScope || false} />;
            }
            case "recommendations": {
                if (!loaderData.recommendations) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const r = loaderData.recommendations as { campaigns: any[], products: any[] };
                return <ProductRecommendations campaigns={r?.campaigns || []} products={r?.products || []} />;
            }
            case "profile":
                if (!loaderData.profile) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <Profile brandProfile={loaderData.profile as any || {}} />;
            case "faqs":
                if (!loaderData.faqs) return null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <FAQs faqs={loaderData.faqs as any || []} />;
            default:
                if (!loaderData.products) return null;
                return <Products products={loaderData.products} />;
        }
    };

    return (
        <s-page inlineSize="large">
            <s-section padding="none">
                <s-stack background="base" gap="base" padding="base">
                    <s-stack justifyContent="space-between" direction="inline" gap="base" >
                        <s-stack direction="inline" alignItems="center" gap="base">
                            <s-box borderRadius="base" background="subdued" overflow="hidden" inlineSize="50px" blockSize="50px">
                                <div style={{ width: "100%", height: "100%", backgroundColor: "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Database color="#0D9488" />
                                </div>
                            </s-box>
                            <s-stack>
                                <s-heading><span style={{ fontSize: "1.5em", fontWeight: "bold" }}>Training Data</span></s-heading>
                                <s-text>Manage sources</s-text>
                            </s-stack>
                        </s-stack>
                        <s-stack direction="inline" alignItems="center" gap="base">
                            <s-button disabled><s-heading>Last Sync: </s-heading>&nbsp;<s-text>Just Now</s-text></s-button>
                            <s-button icon="reset">Sync All</s-button>
                        </s-stack>
                    </s-stack>

                    {/* Tabs using Links for instant navigation */}
                    <s-grid gridTemplateColumns="1fr 1fr 1fr" border="base" borderWidth="base none none none" paddingBlockStart="base">
                        <s-stack direction="inline" justifyContent="center" gap="large">
                            <Link to="?tab=products" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="package" {...{ pressed: activeTab === "products" } as any}>Products</s-button>
                            </Link>
                            <Link to="?tab=discounts" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="discount" {...{ pressed: activeTab === "discounts" } as any}>Discount</s-button>
                            </Link>
                            <s-button icon="globe-lines" disabled>Market</s-button>
                        </s-stack>
                        <s-stack border="base" borderWidth="none base none base" borderColor="strong" direction="inline" justifyContent="center" gap="large">
                            <Link to="?tab=faqs" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="info" {...{ pressed: activeTab === "faqs" } as any}>FAQs</s-button>
                            </Link>
                            <Link to="?tab=policies" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="shield-check-mark" {...{ pressed: activeTab === "policies" } as any}>Policies</s-button>
                            </Link>
                            <s-button icon="receipt" disabled>Documents</s-button>
                        </s-stack>
                        <s-stack direction="inline" justifyContent="center" gap="large">
                            <Link to="?tab=profile" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="profile" {...{ pressed: activeTab === "profile" } as any}>Profile</s-button>
                            </Link>
                            <Link to="?tab=recommendations" preventScrollReset>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <s-button icon="star" {...{ pressed: activeTab === "recommendations" } as any}>Recommendations</s-button>
                            </Link>
                        </s-stack>
                    </s-grid>
                </s-stack>
            </s-section>

            <s-section >
                {/* Breadcrumbs or Header for context */}
                <s-stack direction="inline" alignItems="center" gap="small-200" paddingBlockEnd="base">
                    <s-heading>Data</s-heading>
                    <s-icon type="arrow-right" />
                    <s-text>Store Data</s-text>
                    <s-icon type="arrow-right" />
                    <span style={{ textTransform: 'capitalize' }}>{activeTab}</span>
                </s-stack>

                {renderContent()}

            </s-section>
        </s-page>
    )
}
