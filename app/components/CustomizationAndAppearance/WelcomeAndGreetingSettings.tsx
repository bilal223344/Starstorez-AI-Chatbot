import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface WelcomeData {
    greeting: string;
    quickQuestions: string[];
    inputPlaceholder: string;
    sendOnEnter: boolean;
    quickQuestionPadding: number;
    quickQuestionBorderRadius: number;
    quickQuestionFontSize: number;
    quickQuestionGap: number;
}

interface WelcomeSettingsProps {
    data: WelcomeData;
    onUpdate: <K extends keyof WelcomeData>(key: K, value: WelcomeData[K]) => void;
}


export default function WelcomeAndGreetingSettings({ data, onUpdate }: WelcomeSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // --- Handlers ---

    // 1. Add a new Quick Question
    const handleAddQuestion = () => {
        if (data.quickQuestions.length < 5) { // Optional Limit
            const newQuestions = [...data.quickQuestions, "New Question"];
            onUpdate("quickQuestions", newQuestions);
        }
    };

    // 2. Remove a Quick Question
    const handleRemoveQuestion = (index: number) => {
        const newQuestions = data.quickQuestions.filter((_, i) => i !== index);
        onUpdate("quickQuestions", newQuestions);
    };

    // 3. Update a specific Quick Question text
    const handleUpdateQuestion = (index: number, newValue: string) => {
        const newQuestions = [...data.quickQuestions];
        newQuestions[index] = newValue;
        onUpdate("quickQuestions", newQuestions);
    };


    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Welcome & Greeting Settings</span></s-heading>

                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Chat Window Greeting */}
                                <s-stack gap="small-200">
                                    <s-heading>Chat Window Greeting</s-heading>
                                    <s-grid gridTemplateColumns="1fr auto" gap="small">
                                        <s-text-field
                                            readOnly minLength={10} maxLength={120}
                                            value={data.greeting}
                                            onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("greeting", e.currentTarget.value)}
                                        />
                                        <s-button icon="blog" accessibilityLabel="Generate with AI"></s-button>
                                    </s-grid>
                                </s-stack>

                                {/* Quick Questions */}
                                <s-stack gap="small-200">
                                    <s-heading>Quick Questions</s-heading>
                                    {data.quickQuestions.map((question, index) => (
                                        <s-grid key={index} gridTemplateColumns="1fr auto auto" gap="small">
                                            <s-text-field
                                                minLength={3} maxLength={100}
                                                value={question}
                                                onInput={(e: CallbackEvent<"s-text-field">) => handleUpdateQuestion(index, e.currentTarget.value)}
                                            />
                                            <s-button
                                                icon="delete"
                                                tone="critical"
                                                onClick={() => handleRemoveQuestion(index)}
                                                accessibilityLabel="Delete question"
                                            />
                                            <s-button icon="blog" accessibilityLabel="Generate with AI" />
                                        </s-grid>
                                    ))}

                                    {/* Add Button */}
                                    {data.quickQuestions.length < 5 && (
                                        <s-button icon="plus" onClick={handleAddQuestion}>Add Question</s-button>
                                    )}

                                    {/* Quick Question Button Styling */}
                                    <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued" paddingBlockStart="small">
                                        <s-heading>Quick Question Button Styling</s-heading>
                                        <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                                <s-number-field 
                                                    label="Padding" 
                                                    value={data.quickQuestionPadding.toString()} 
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("quickQuestionPadding", Number(e.currentTarget.value))} 
                                                    min={4} 
                                                    max={20} 
                                                    suffix="px" 
                                                />
                                                <s-number-field 
                                                    label="Border Radius" 
                                                    value={data.quickQuestionBorderRadius.toString()} 
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("quickQuestionBorderRadius", Number(e.currentTarget.value))} 
                                                    min={0} 
                                                    max={50} 
                                                    suffix="px" 
                                                />
                                            </s-grid>
                                            <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                                <s-number-field 
                                                    label="Font Size" 
                                                    value={data.quickQuestionFontSize.toString()} 
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("quickQuestionFontSize", Number(e.currentTarget.value))} 
                                                    min={10} 
                                                    max={18} 
                                                    suffix="px" 
                                                />
                                                <s-number-field 
                                                    label="Gap Between Buttons" 
                                                    value={data.quickQuestionGap.toString()} 
                                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("quickQuestionGap", Number(e.currentTarget.value))} 
                                                    min={4} 
                                                    max={20} 
                                                    suffix="px" 
                                                />
                                            </s-grid>
                                        </s-stack>
                                    </s-box>
                                </s-stack>

                                {/* Input placeholder */}
                                <s-stack gap="small-200">
                                    <s-heading>Input placeholder</s-heading>
                                    <s-grid gridTemplateColumns="1fr auto" gap="small">
                                        <s-text-field
                                            minLength={10} maxLength={80}
                                            value={data.inputPlaceholder}
                                            onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("inputPlaceholder", e.currentTarget.value)}
                                        />
                                        <s-button icon="blog" accessibilityLabel="Generate with AI"></s-button>
                                    </s-grid>
                                </s-stack>

                                {/* On Enter Toggle */}
                                <s-stack gap="small-200">
                                    <s-heading>On Enter</s-heading>
                                    <s-switch
                                        label="Send message on Enter"
                                        checked={data.sendOnEnter}
                                        onChange={(e: CallbackEvent<"s-switch">) => onUpdate("sendOnEnter", e.currentTarget.checked)}
                                        details="
                                                    When enabled, Enter sends the message and Shift + Enter adds a new line.
                                                    When disabled, Enter adds a new line and Shift + Enter sends the message.
                                                "
                                    />
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    )
}