import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface MessageBoxData {
    borderRadius: number;
    messageSpacing: number;
    paddingVertical: number;
    paddingHorizontal: number;

    // Behavior
    typingStyle: string;
    typingIndicator: string;

    // Icon
    sendIcon: string;
    sendIconSize: number;

    timestampDisplay: boolean;
}

interface MessageBoxStylingProps {
    data: MessageBoxData;
    onUpdate: <K extends keyof MessageBoxData>(key: K, value: MessageBoxData[K]) => void;
}

export default function MessageBoxStyling({ data, onUpdate }: MessageBoxStylingProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const sendIconPresets = [
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/send-button-icon-svg-download-png-11716098.png?f=webp&w=512",
        "https://t4.ftcdn.net/jpg/17/05/28/11/240_F_1705281167_DYWtle3ktsTeaG7UxErp59xvxse9qsfF.jpg",
        "https://t4.ftcdn.net/jpg/16/64/06/21/240_F_1664062157_iHlaAJEuaEfg5wDkq0psJY3Dw2ZeE3iw.jpg",
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/send-button-icon-svg-download-png-4272434.png?f=webp&w=512",
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/send-icon-svg-download-png-11865919.png?f=webp&w=512"
    ];

    // Image Compression
    const resizeImage = (file: File, maxWidth: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileUpload = async (event: CallbackEvent<"s-drop-zone">) => {
        // Define the shape of the custom element to include 'files'
        // This tells TypeScript: "Treat this target as an HTMLElement that definitely has a files array"
        const target = event.currentTarget as HTMLElement & { files: File[] };
        const files = target.files;

        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                const compressedImage = await resizeImage(files[0], 250);
                onUpdate("sendIcon", compressedImage);
            } catch (error) {
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        }
    };


    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Message Box Styling</span></s-heading>

                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Chat Window Greeting */}
                                <s-grid gap="small" gridTemplateColumns="1fr 1fr">
                                    <s-stack gap="small-200">
                                        <s-number-field
                                            label="Border radius slider"
                                            suffix="px"
                                            value={data.borderRadius.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadius", Number(e.currentTarget.value))}
                                        />
                                    </s-stack>
                                    <s-stack gap="small-200">
                                        <s-number-field
                                            label="Message Spacing"
                                            value={data.messageSpacing.toString()}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("messageSpacing", Number(e.currentTarget.value))}
                                            suffix="px"
                                            min={4}
                                            max={16}
                                            details="Gap between messages slider"
                                        />
                                    </s-stack>
                                </s-grid>


                                {/* Chat Window Greeting */}
                                <s-stack gap="small-200">
                                    <s-heading>Message Padding</s-heading>
                                    <s-grid gap="small" gridTemplateColumns="1fr 1fr">
                                        <s-stack gap="small-200">
                                            <s-number-field label="Vertical padding slider"
                                                value={data.paddingVertical.toString()}
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("paddingVertical", Number(e.currentTarget.value))}
                                                min={8} max={20} suffix="px"
                                            />
                                        </s-stack>
                                        <s-stack gap="small-200">
                                            <s-number-field label="Horizontal padding slider"
                                                value={data.paddingHorizontal.toString()}
                                                onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("paddingHorizontal", Number(e.currentTarget.value))}
                                                min={12} max={24} suffix="px"
                                            />
                                        </s-stack>
                                    </s-grid>
                                </s-stack>

                                {/* Typing Style */}
                                <s-box>
                                    <s-heading>Tying Style</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-clickable
                                            onClick={() => onUpdate("typingStyle", "In the Msg Box")}
                                            background={data.typingStyle === "In the Msg Box" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>In the Msg Box</s-heading>
                                        </s-clickable>
                                        <s-clickable
                                            onClick={() => onUpdate("typingStyle", "Top Nav")}
                                            background={data.typingStyle === "Top Nav" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>Top Nav</s-heading>
                                        </s-clickable>
                                    </s-grid>
                                </s-box>

                                {/* Typing Indicators */}
                                <s-box>
                                    <s-heading>Typing Indicators</s-heading>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-clickable
                                            onClick={() => onUpdate("typingIndicator", "Dots (animated)")}
                                            background={data.typingIndicator === "Dots (animated)" ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>Dots (animated)</s-heading>
                                        </s-clickable>
                                        <s-clickable
                                            onClick={() => onUpdate("typingIndicator", "AI is typing...")}
                                            background={data.typingIndicator === "AI is typing..." ? "strong" : "base"}
                                            padding="base" borderRadius="base" border="base" borderWidth="base" borderColor="strong"
                                        >
                                            <s-heading>AI is typing...</s-heading>
                                        </s-clickable>
                                    </s-grid>
                                </s-box>

                                {/* Sending Button Icon */}
                                <s-box>
                                    <s-heading>Sending Button Icon</s-heading>
                                    <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        {/* Upload */}
                                        <s-box borderRadius="large-200" inlineSize="50px" blockSize="auto">
                                            <s-drop-zone
                                                label={isUploading ? "..." : ""}
                                                accept=".jpg,.png,.gif"
                                                onInput={handleFileUpload}
                                            />
                                        </s-box>

                                        {/* Presets */}
                                        {sendIconPresets.map((url, i) => (
                                            <button key={i} onClick={() => onUpdate("sendIcon", url)}
                                                style={{
                                                    width: "50px", height: "50px", overflow: "hidden", objectFit: "contain", cursor: "pointer",
                                                    border: data.sendIcon === url ? "2px solid blue" : "none"
                                                }}
                                            >
                                                <img style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Icon" src={url} />
                                            </button>
                                        ))}

                                        {/* Custom Preview */}
                                        {data.sendIcon && !sendIconPresets.includes(data.sendIcon) && (
                                            <div style={{ width: "50px", height: "50px", border: "2px solid blue", padding: '2px' }}>
                                                <img src={data.sendIcon} style={{ width: "100%", height: "100%" }} alt="Custom" />
                                            </div>
                                        )}

                                    </s-stack>
                                </s-box>

                                {/* Sending Button Icon Size */}
                                <s-stack>
                                    <s-heading>Sending Button Icon</s-heading>
                                    <s-grid gridTemplateColumns="auto 1fr 1fr" gap="small">
                                        <s-text-field defaultValue={`${data.sendIconSize}x${data.sendIconSize}`} suffix="px" readOnly />
                                        <s-number-field
                                            value={data.sendIconSize.toString()}
                                            suffix="px" min={8} max={24}
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("sendIconSize", Number(e.currentTarget.value))}
                                        />
                                        {/* <s-number-field value={data.sendIconSize.toString()} suffix="px" min={8} max={24} /> */}
                                    </s-grid>
                                </s-stack>


                                {/* Timestamp display toggle */}
                                <s-stack gap="small-200">
                                    <s-heading>Timestamp display</s-heading>
                                    <s-switch
                                        label="Show message timestamps"
                                        checked={data.timestampDisplay}
                                        details="Toggle visibility of message timestamps in chat."
                                        onChange={(e: CallbackEvent<"s-switch">) => onUpdate("timestampDisplay", e.currentTarget.checked)}
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