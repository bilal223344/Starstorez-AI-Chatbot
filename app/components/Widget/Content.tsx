import { useState } from "react";
import type { CallbackEvent } from "@shopify/polaris-types";
import { WidgetSettings } from "../../types";

interface ContentProps {
    settings: WidgetSettings['content'];
    onChange: <K extends keyof WidgetSettings['content']>(key: K, value: WidgetSettings['content'][K]) => void;
}

export default function Content({ settings, onChange }: ContentProps) {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(true);

    const handleActionChange = (index: number, value: string) => {
        const newActions = [...settings.quickActions];
        newActions[index] = value;
        onChange('quickActions', newActions);
    };

    const handleAddAction = () => {
        onChange('quickActions', [...settings.quickActions, "New Action"]);
    };

    const handleDeleteAction = (index: number) => {
        const newActions = settings.quickActions.filter((_, i) => i !== index);
        onChange('quickActions', newActions);
    };

    return (
        <s-stack gap="base">
            {/* Welcome Message Section */}
            < s-section padding="none" >
                <s-clickable onClick={() => setIsOpenDisplayRule(!isOpenDisplayRule)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Welcome Message</span></s-heading>
                        <s-icon type={isOpenDisplayRule ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenDisplayRule && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            <s-text-field
                                value={settings.welcomeMessage}
                                minLength={2}
                                maxLength={120}
                                onInput={(e: CallbackEvent<'s-text-field'>) => onChange('welcomeMessage', (e.target as HTMLInputElement).value)}
                            />
                        </s-stack>
                    </>
                )}
            </s-section>

            {/* Quick Actions Section */}
            < s-section padding="none" >
                <s-clickable onClick={() => setIsOpenDisplayRule(!isOpenDisplayRule)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Quick Actions</span></s-heading>
                        <s-icon type={isOpenDisplayRule ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </s-clickable>

                {isOpenDisplayRule && (
                    <>
                        <s-divider />
                        <s-stack gap="small" padding="small-200 base base">
                            {settings.quickActions.map((action, index) => (
                                <s-grid key={index} gridTemplateColumns="1fr auto" gap="small">
                                    <s-text-field
                                        value={action}
                                        onInput={(e: CallbackEvent<'s-text-field'>) => handleActionChange(index, (e.target as HTMLInputElement).value)}
                                    />
                                    <s-button icon="delete" onClick={() => handleDeleteAction(index)} />
                                </s-grid>
                            ))}
                            <s-grid gridTemplateColumns="1fr">
                                <s-button icon="plus" onClick={handleAddAction}>Add Action</s-button>
                            </s-grid>
                        </s-stack>
                    </>
                )}
            </s-section>
        </s-stack>
    )
}