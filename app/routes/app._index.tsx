import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { formatDistanceToNow, subDays } from "date-fns";
import prisma from "../db.server";
import { syncProduct } from "app/services/productService";

// ============================================================================
// LOADER - Aggregate Real Prisma Data
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // --- 1. Fetch Theme ID for Deep Linking ---
  let themeId;
  try {
    const graphqlResponse = await admin.graphql(
      `query GetAppAndTheme {
        themes(first: 1, roles: MAIN) {
          edges {
            node {
              id
            }
          }
        }
      }`
    );
    const { data }: any = await graphqlResponse.json();
    themeId = data?.themes?.edges?.[0]?.node?.id?.split("/").pop();
  } catch (error) {
    console.warn("Failed to fetch App ID or Theme ID:", error);
  }

  // --- 2. Parallel Data Fetching ---
  const [
    totalMessages,
    pendingHandoffs,
    recentChats,
    syncStatus,
    totalProducts,
    totalCustomers
  ] = await Promise.all([
    // A. Total Messages
    prisma.message.count({
      where: { session: { shop } }
    }),

    // B. Human Handoffs (Sessions needing attention)
    prisma.chatSession.count({
      where: {
        shop,
        messages: { some: {} },
        // Logic: Session exists, has messages, but NO assistant reply implies human needed OR manual takeover
        NOT: { messages: { some: { role: "assistant" } } }
      }
    }),

    // C. Recent Conversations
    prisma.chatSession.findMany({
      where: { shop },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    }),

    // D. AI Training Status
    prisma.product.groupBy({
      by: ['isSynced'],
      where: { shop },
      _count: true
    }),

    // E. Total Products (New Metric)
    prisma.product.count({
      where: { shop }
    }),

    // F. Active Customers (New Metric - Total customers in DB)
    prisma.customer.count({
      where: { shop }
    })
  ]);

  // --- 3. Format Sync Status ---
  const syncedCount = syncStatus.find(s => s.isSynced)?._count || 0;
  const unsyncedCount = syncStatus.find(s => !s.isSynced)?._count || 0;

  return {
    shop,
    stats: {
      totalMessages,
      pendingHandoffs,
      totalProducts,
      totalCustomers
    },
    recentChats,
    syncStatus: {
      syncedCount,
      unsyncedCount
    },
    themeId,
    appId: process.env.SHOPIFY_API_KEY || "",
  };
};

// ============================================================================
// ACTION - For Manual Sync Trigger
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "sync") {
    await syncProduct(session.shop, session.accessToken!);
    return { success: true };
  }

  return null;
};

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================
export default function Dashboard() {
  const { stats, recentChats, syncStatus, shop, themeId, appId } = useLoaderData<typeof loader>();

  const deepLinkUrl = (themeId)
    ? `https://${shop}/admin/themes/${themeId}/editor?context=apps&activateAppId=${appId}/chatbot_widget`
    : "/app/customization";

  const fetcher = useFetcher();

  return (
    <s-page heading="Chatbot Dashboard">
      {/* 1. KEY METRICS */}
      <s-section padding="base">
        <s-grid gridTemplateColumns="repeat(4, 1fr)" gap="base">

          {/* Total Products Card */}
          <s-box padding="base" border="base" borderRadius="base">
            <s-stack gap="small-100">
              <s-text tone="neutral">Total Products</s-text>
              <s-heading>{stats.totalProducts.toLocaleString()}</s-heading>
              <s-text tone="neutral">Available for AI</s-text>
            </s-stack>
          </s-box>

          {/* Active Customers Card */}
          <s-box padding="base" border="base" borderRadius="base">
            <s-stack gap="small-100">
              <s-text tone="neutral">Total Customers</s-text>
              <s-heading>{stats.totalCustomers.toLocaleString()}</s-heading>
              <s-text tone="neutral">Interacted with bot</s-text>
            </s-stack>
          </s-box>

          {/* Total Messages Card */}
          <s-box padding="base" border="base" borderRadius="base">
            <s-stack gap="small-100">
              <s-text tone="neutral">Total Messages</s-text>
              <s-heading>{stats.totalMessages.toLocaleString()}</s-heading>
            </s-stack>
          </s-box>

          {/* Human Handoffs Card */}
          <s-box padding="base" border="base" borderRadius="base">
            <s-stack gap="small-100">
              <s-text tone="neutral">Human Handoffs</s-text>
              <s-heading>{stats.pendingHandoffs}</s-heading>
              {stats.pendingHandoffs > 0 ? (
                <s-badge tone="caution">Needs Action</s-badge>
              ) : (
                <s-badge tone="success">All Clear</s-badge>
              )}
            </s-stack>
          </s-box>

        </s-grid>
      </s-section>

      {/* 2. RECENT ACTIVITY TABLE */}
      <s-section heading="Recent Conversations">
        <s-box border="base" borderRadius="base" overflow="hidden">
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Customer</s-table-header>
              <s-table-header>Mode</s-table-header>
              <s-table-header>Last Message</s-table-header>
              <s-table-header>Time</s-table-header>
            </s-table-header-row>

            <s-table-body>
              {recentChats.length === 0 ? (
                <s-table-row><s-table-cell><s-text color="subdued">No recent chats found.</s-text></s-table-cell></s-table-row>
              ) : (
                recentChats.map((chat) => (
                  <s-table-row key={chat.id}>
                    <s-table-cell>
                      <s-stack direction="inline" gap="small" alignItems="center">
                        <s-avatar size="small" initials={chat.customer?.firstName?.[0] || "G"} />
                        <s-link href={`/app/chats/management?customerId=${chat.customer?.id || ''}`}>
                          {chat.customer?.email || "Guest User"}
                        </s-link>
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>
                      <s-badge tone={chat.messages[0]?.role === "assistant" ? "success" : "caution"}>
                        {chat.messages[0]?.role === "assistant" ? "AI Managed" : "Awaiting Reply"}
                      </s-badge>
                    </s-table-cell>
                    <s-table-cell>
                      <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <s-text tone="neutral">{chat.messages[0]?.content || "No messages"}</s-text>
                      </div>
                    </s-table-cell>
                    <s-table-cell>
                      {formatDistanceToNow(new Date(chat.createdAt))} ago
                    </s-table-cell>
                  </s-table-row>
                ))
              )}
            </s-table-body>
          </s-table>
          <s-box padding="base" borderStyle="solid none none none">
            <s-link href="/app/chats/management">View all conversations in Inbox</s-link>
          </s-box>
        </s-box>
      </s-section>

      {/* 3. TRAINING & CUSTOMIZATION CARDS */}
      <s-grid gridTemplateColumns="1fr 1fr" gap="base">
        <s-box padding="base" border="base" borderRadius="base">
          <s-stack gap="base">
            <s-heading>AI Training Status</s-heading>
            <s-paragraph>
              Your AI is trained on **{syncStatus.syncedCount}** products.
              **{syncStatus.unsyncedCount}** products require synchronization to be included in chat recommendations.
            </s-paragraph>
            <fetcher.Form method="post">
              <s-button variant="primary" type="submit" loading={fetcher.state !== "idle"}>
                Sync Products Now
              </s-button>
            </fetcher.Form>
          </s-stack>
        </s-box>

        <s-box padding="base" border="base" borderRadius="base" background="subdued">
          <s-stack gap="base">
            <s-heading>Widget Appearance</s-heading>
            <s-paragraph>Update your bot&apos;s colors, welcome message, and positioning to match your store&apos;s theme.</s-paragraph>
            {/* Opens in new tab because it leads to Shopify Admin */}
            <s-button variant="secondary" href={deepLinkUrl} target={deepLinkUrl.startsWith('http') ? "_blank" : undefined}>Open Visual Editor</s-button>
          </s-stack>
        </s-box>
      </s-grid>

      <s-stack justifyContent="center" alignItems="center" padding="base">
        <s-text>
          Learn more about <s-link href="/app/personality">configuring AI Tone</s-link> or <s-link href="/app/products/management">managing order inquiries</s-link>.
        </s-text>
      </s-stack>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};