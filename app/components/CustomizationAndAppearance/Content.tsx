import { useState } from "react";

export default function Content() {
    const [isOpenDisplayRule, setIsOpenDisplayRule] = useState(true);

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
                                value="👋 Hi there! I'm StartStorez. How can I help you find the perfect product today?"
                                minLength={2}
                                maxLength={120}
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
                            <s-grid gridTemplateColumns="1fr auto" gap="small">
                                <s-text-field value="Track my order" />
                                <s-button icon="delete" />
                            </s-grid>
                            <s-grid gridTemplateColumns="1fr auto" gap="small">
                                <s-text-field value="Shipping policy" />
                                <s-button icon="delete" />
                            </s-grid>
                            <s-grid gridTemplateColumns="1fr auto" gap="small">
                                <s-text-field value="Best sellers" />
                                <s-button icon="delete" />
                            </s-grid>
                            <s-grid gridTemplateColumns="1fr">
                                <s-button icon="plus">Add Action</s-button>
                            </s-grid>
                        </s-stack>
                    </>
                )}
            </s-section>
        </s-stack>
    )
}