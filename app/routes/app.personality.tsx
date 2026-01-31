import { CallbackEvent } from "@shopify/polaris-types";
import {
  LanguageSettings,
  LanguageSettingsData,
} from "app/components/AIPersonalityAndBehavior/LanguageSettings";
import {
  Policies,
  PoliciesData,
} from "app/components/AIPersonalityAndBehavior/Policies";
import {
  RecommendedProducts,
  Product,
} from "app/components/AIPersonalityAndBehavior/RecommendedProducts";
import {
  ResponseSettings,
  ResponseSettingsData,
} from "app/components/AIPersonalityAndBehavior/ResponseSettings";
import {
  ResponseTone,
  ResponseToneData,
} from "app/components/AIPersonalityAndBehavior/ResponseTone";
import {
  StoreDetails,
  StoreDetailsData,
} from "app/components/AIPersonalityAndBehavior/StoreDetails";
import { useState, useEffect, useCallback } from "react";
import {
  useFetcher,
  useLoaderData,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";
import { authenticate } from "app/shopify.server";
import prisma from "app/db.server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Prisma } from "@prisma/client";

// ============================================================================
// AISettingsState Interface - Complete structure for AI settings
// ============================================================================
export interface AISettingsState {
  aiInstructions: string;
  recommendedProducts: Product[];
  storeDetails: StoreDetailsData;
  policies: PoliciesData;
  responseTone: ResponseToneData;
  languageSettings: LanguageSettingsData;
  responseSettings: ResponseSettingsData;
}

// ============================================================================
// LOADER - Fetch saved AI settings from database
// ============================================================================
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    return { aiSettings: null };
  }

  try {
    const aiSettings = await prisma.aISettings.findUnique({
      where: { shop: session.shop },
      select: {
        settings: true,
        updatedAt: true,
      },
    });

    return {
      aiSettings: aiSettings?.settings as AISettingsState | null,
      updatedAt: aiSettings?.updatedAt || null,
    };
  } catch (error) {
    console.error("[LOADER] Error fetching AI settings:", error);
    return { aiSettings: null };
  }
};

// ============================================================================
// ACTION - Save AI settings to database
// ============================================================================
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    return { error: "Unauthorized" };
  }

  try {
    const body = await request.json();
    // Handle both stringified JSON and direct object
    const settings: AISettingsState =
      typeof body.settings === "string"
        ? JSON.parse(body.settings)
        : body.settings;

    if (!settings) {
      return { error: "Settings data is required" };
    }

    // Validate that settings is an object
    if (typeof settings !== "object" || Array.isArray(settings)) {
      return { error: "Invalid settings format" };
    }

    // Convert AISettingsState to Prisma JSON format
    const settingsJson = JSON.parse(
      JSON.stringify(settings),
    ) as unknown as Prisma.InputJsonValue;

    await prisma.aISettings.upsert({
      where: { shop: session.shop },
      create: {
        shop: session.shop,
        settings: settingsJson,
      },
      update: {
        settings: settingsJson,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "AI settings saved successfully" };
  } catch (error) {
    console.error("[ACTION] Error saving AI settings:", error);
    return { error: "Failed to save AI settings" };
  }
};

export default function AIPersonalityAndBehavior() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from loader or use defaults
  const [aiInstructions, setAiInstructions] = useState(
    () => (loaderData.aiSettings?.aiInstructions || "") as string,
  );

  const [recommentProducts, setRecommentProducts] = useState<Product[]>(
    () => loaderData.aiSettings?.recommendedProducts || [],
  );

  const [storeDetails, setStoreDetails] = useState<StoreDetailsData>(
    () =>
      loaderData.aiSettings?.storeDetails || {
        about: "",
        location: "",
      },
  );

  const [policies, setPolicies] = useState<PoliciesData>(
    () =>
      loaderData.aiSettings?.policies || {
        shipping: "",
        payment: "",
        refund: "",
      },
  );

  const [responseTone, setResponseTone] = useState<ResponseToneData>(
    () =>
      loaderData.aiSettings?.responseTone || {
        selectedTone: ["professional"],
        customInstructions: "Speak in a calm and friendly tone.",
      },
  );

  const [languageSettings, setLanguageSettings] =
    useState<LanguageSettingsData>(
      () =>
        loaderData.aiSettings?.languageSettings || {
          primaryLanguage: "english",
          autoDetect: true,
        },
    );

  const [responseSettings, setResponseSettings] =
    useState<ResponseSettingsData>(
      () =>
        loaderData.aiSettings?.responseSettings || {
          length: ["balanced"],
          style: ["emojis"],
        },
    );

  // Save AI settings to database
  const saveAISettings = useCallback(async () => {
    setIsSaving(true);
    try {
      const settings: AISettingsState = {
        aiInstructions,
        recommendedProducts: recommentProducts,
        storeDetails,
        policies,
        responseTone,
        languageSettings,
        responseSettings,
      };

      fetcher.submit(
        { settings: JSON.stringify(settings) },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    } catch (error) {
      console.error("[SAVE] Error saving AI settings:", error);
      shopify.toast.show("Failed to save AI settings", { isError: true });
      setIsSaving(false);
    }
  }, [
    aiInstructions,
    recommentProducts,
    storeDetails,
    policies,
    responseTone,
    languageSettings,
    responseSettings,
    fetcher,
    shopify,
  ]);

  // Manual save only - no auto-save

  // Show toast on save success/error
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
        setIsSaving(false);
      } else if (fetcher.data.success) {
        shopify.toast.show("AI settings saved successfully");
        setIsSaving(false);
      }
    }
  }, []);

  const handleExampleClick = (type: "professional" | "friendly" | "sales") => {
    let text = "";
    switch (type) {
      case "professional":
        text =
          "Act as a professional store concierge. Keep answers brief, polite, and factual. Focus on product details and specifications. Do not use emojis or slang. If a user asks about a product we don't have, apologize and suggest checking our catalog page.";
        break;
      case "friendly":
        text =
          "You are a friendly shopping assistant! Use a warm, enthusiastic tone and feel free to use emojis 🛍️. When recommending products, explain why they are a good choice. If a customer seems unsure, offer to help them find the perfect item for their needs.";
        break;
      case "sales":
        text =
          "Your goal is to convert visitors into buyers. Highlight our 'Best Sellers' and current discounts whenever possible. Use persuasive language like 'Don't miss out!' or 'Limited stock available.' If a user asks about shipping, emphasize our fast delivery times.";
        break;
    }
    setAiInstructions(text);
  };

  // const handleChange = (event: CallbackEvent<"s-choice-list">) => {
  //     console.log('Values: ', event.currentTarget.values)
  // }

  return (
    <s-page heading="AI Personality & Behavior" inlineSize="large">
      <s-button
        slot="primary-action"
        onClick={() => saveAISettings()}
        loading={isSaving}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save AI Settings"}
      </s-button>

      {isSaving && <s-banner tone="info">Saving AI settings...</s-banner>}

      {/* AI Instructions */}
      <s-section>
        <s-stack gap="small-200">
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <s-heading>
                <span style={{ fontSize: "1.1em", fontWeight: 600 }}>
                  AI Instructions
                </span>
              </s-heading>
              <>
                <s-tooltip id="ai-instruction-tooltip">
                  Customize your AI&apos;s tone and behavior with specific
                  instructions, while intents such as product recommendations,
                  agent handover, after-sales service, checkout, and order
                  tracking remain unaffected.
                </s-tooltip>
                <s-button
                  variant="tertiary"
                  interestFor="ai-instruction-tooltip"
                  accessibilityLabel="AI-Instructions"
                  icon="info"
                />
              </>
            </div>
            <div>
              <>
                <s-button commandFor="customer-menu">
                  Example Instructions
                </s-button>

                <s-menu
                  id="example-instructions-menu"
                  accessibilityLabel="Example instructions"
                >
                  <s-button onClick={() => handleExampleClick("professional")}>
                    Professional & Concise
                  </s-button>
                  <s-button onClick={() => handleExampleClick("friendly")}>
                    Friendly & Engaging
                  </s-button>
                  <s-button onClick={() => handleExampleClick("sales")}>
                    Sales-Driven
                  </s-button>
                </s-menu>
              </>
            </div>
          </div>
          <s-text-area
            required
            rows={4}
            details="For writing more detailed instructions tied to specific queries, use the feature below."
            value={aiInstructions}
            onInput={(e: CallbackEvent<"s-text-area">) =>
              setAiInstructions(e.currentTarget.value)
            }
          />
        </s-stack>
      </s-section>

      {/* Product-specific Recommendation Instructions */}
      <RecommendedProducts
        products={recommentProducts}
        setProducts={setRecommentProducts}
      />

      {/* Store Details Component */}
      <StoreDetails data={storeDetails} setData={setStoreDetails} />

      {/* Policies Component */}
      <Policies data={policies} setData={setPolicies} />

      <ResponseTone data={responseTone} setData={setResponseTone} />

      <LanguageSettings data={languageSettings} setData={setLanguageSettings} />

      <ResponseSettings data={responseSettings} setData={setResponseSettings} />
    </s-page>
  );
}
