
interface ShopifyGraphqlParams {
    shop: string;
    accessToken: string;
    query: string;
    variables?: Record<string, unknown>;
}

interface ShopifyError {
    message: string;
    extensions?: {
        code?: string;
        cost?: number;
    };
}

interface NetworkError {
    response?: {
        status?: number;
        headers?: Headers | Record<string, unknown>;
    };
}

interface ShopifyResponse<T = unknown> {
    data?: T;
    errors?: ShopifyError[];
    extensions?: {
        cost?: {
            throttleStatus: {
                currentlyAvailable: number;
                restoreRate: number;
            };
        };
    };
}

// 2. Fixed Request Function
export async function shopifyGraphqlRequest<T = unknown>({
    shop,
    accessToken,
    query,
    variables,
}: ShopifyGraphqlParams): Promise<ShopifyResponse<T>> {
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-01";
    const url = `https://${shop}/admin/api/${apiVersion}/graphql.json`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
    });

    const costHeader = res.headers.get("X-GraphQL-Cost-Available");
    if (costHeader && Number(costHeader) < 100) {
        await sleep(2000);
    }

    const json = (await res.json()) as ShopifyResponse<T>;

    if (json.errors && Array.isArray(json.errors)) {
        const isThrottled = json.errors.some((e) => e.extensions?.code === "THROTTLED");
        if (isThrottled) {
            console.warn("Throttled. Retrying...");
            await sleep(2000);
            return shopifyGraphqlRequest<T>({ shop, accessToken, query, variables });
        }
    }

    return json;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export async function withRetry<T>(
    fn: () => Promise<T>,
    {
        retries = 3,
        baseDelay = 1000,
        maxDelay = 15000,
        serviceName = "unknown",
    } = {}
): Promise<T> {
    let attempt = 0;

    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: unknown) {
            attempt++;

            if (attempt >= retries) {
                throw error;
            }

            const err = error as NetworkError;
            const status = err?.response?.status;

            const headers = err?.response?.headers;
            let retryAfterHeader: string | null | undefined = null;

            if (headers && typeof headers === 'object') {
                if ('get' in headers && typeof (headers as Headers).get === 'function') {
                    retryAfterHeader = (headers as Headers).get("retry-after");
                } else {
                    retryAfterHeader = (headers as Record<string, unknown>)["retry-after"] as string | undefined;
                }
            }

            // Retry on Rate Limits (429) or Server Errors (500-599)
            const isRetryable = status === 429 || (status !== undefined && status >= 500 && status <= 599);

            if (!isRetryable) {
                throw error;
            }

            const delay = retryAfterHeader
                ? Number(retryAfterHeader) * 1000
                : Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

            console.warn(
                `[${serviceName}] Error (attempt ${attempt}/${retries}). Retrying in ${delay}ms`
            );

            await sleep(delay);
        }
    }

    throw new Error(`[${serviceName}] Failed after ${retries} attempts`);
}