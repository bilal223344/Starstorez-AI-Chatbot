import prisma from "../db.server";
import { DEFAULT_WIDGET_SETTINGS } from "../constants";
import { WidgetSettings } from "../types";

export async function getWidgetSettings(shop: string): Promise<WidgetSettings> {
    const customization = await prisma.chatbotCustomization.findUnique({
        where: { shop },
        select: { settings: true },
    });

    if (!customization?.settings) {
        return DEFAULT_WIDGET_SETTINGS;
    }

    // Merge with default settings to ensure new fields are present if schema updates
    return { ...DEFAULT_WIDGET_SETTINGS, ...(customization.settings as unknown as WidgetSettings) };
}

export async function updateWidgetSettings(shop: string, settings: WidgetSettings): Promise<WidgetSettings> {
    const customization = await prisma.chatbotCustomization.upsert({
        where: { shop },
        update: { settings: settings as unknown as any },
        create: {
            shop,
            settings: settings as unknown as any,
        },
        select: { settings: true },
    });

    return customization.settings as unknown as WidgetSettings;
}

export async function resetWidgetSettings(shop: string): Promise<WidgetSettings> {
    const customization = await prisma.chatbotCustomization.upsert({
        where: { shop },
        update: { settings: DEFAULT_WIDGET_SETTINGS as unknown as any },
        create: {
            shop,
            settings: DEFAULT_WIDGET_SETTINGS as unknown as any,
        },
        select: { settings: true },
    });

    return customization.settings as unknown as WidgetSettings;
}
