import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

// --- Types ---
export interface TopNavData {
    avatar: string;
    botName: string;
    headerHeight: number;
    headerContent: string;
    headerFontSize: number;
    headerFontWeight: string;
    showOnlineStatus: boolean;
    onlineStatusType: string;
    customOnlineText: string;
}

interface TopNavigationStylingProps {
    data: TopNavData;
    onUpdate: <K extends keyof TopNavData>(key: K, value: TopNavData[K]) => void;
}

export default function TopNavigationStyling({ data, onUpdate }: TopNavigationStylingProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const avatarUrls = [
        "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=880&auto=format&fit=crop",
        "https://plus.unsplash.com/premium_photo-1739786996040-32bde1db0610?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1750924718670-b7b90abad70a?q=80&w=824&auto=format&fit=crop",
        "https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=880&auto=format&fit=crop",
        "https://plus.unsplash.com/premium_photo-1739283664366-abb2b1c6f218?q=80&w=1170&auto=format&fit=crop"
    ];

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
        const target = event.currentTarget as HTMLElement & { files: File[] };
        const files = target.files;

        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                const compressedImage = await resizeImage(files[0], 250);
                onUpdate("avatar", compressedImage);
            } catch (error) {
                console.error("Error resizing image:", error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    // Helper: Determine what text to show in the "Read Only" preview box
    // If 'Custom' is selected, show the custom text input, otherwise show the selected option.
    const statusPreviewText = data.onlineStatusType === "Custom"
        ? (data.customOnlineText || "Custom Status")
        : data.onlineStatusType;

    return (
        <>
            <s-section padding="none">
                <s-clickable onClick={() => setIsOpen(!isOpen)}>
                    <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                        <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Top Navigation Styling</span></s-heading>

                        <s-icon type="chevron-down" />
                    </s-stack>
                </s-clickable>

                {isOpen && (
                    <>
                        <s-divider />
                        <s-stack padding="none base base" gap="base">
                            <s-stack gap="small-200">
                                {/* Chatbot Avatar */}
                                <s-box>
                                    <s-heading>Chatbot Avatar</s-heading>
                                    <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-box borderRadius="large-200" inlineSize="50px" blockSize="auto">
                                            <s-drop-zone label={isUploading ? "..." : ""} accept=".jpg,.png,.gif" onInput={handleFileUpload} />
                                        </s-box>
                                        {avatarUrls.map((url, index) => (
                                            <button key={index} onClick={() => onUpdate("avatar", url)} style={{ width: "50px", height: "50px", overflow: "hidden", borderRadius: "999px", cursor: "pointer", border: data.avatar === url ? "2px solid blue" : "1px solid #dee3ed", padding: 0, backgroundColor: "black" }}>
                                                <img style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar" src={url} />
                                            </button>
                                        ))}
                                        {data.avatar && !avatarUrls.includes(data.avatar) && (
                                            <div style={{ width: "50px", height: "50px", overflow: "hidden", borderRadius: "999px", border: "2px solid blue" }}>
                                                <img src={data.avatar} alt="Custom" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            </div>
                                        )}
                                    </s-stack>
                                </s-box>

                                {/* Chatbot Name */}
                                <s-grid gridTemplateColumns="1fr 1fr">
                                    <s-text-field label="Chatbot Name" value={data.botName} onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("botName", e.currentTarget.value)} maxLength={30} minLength={3} />
                                </s-grid>

                                {/* Header Height */}
                                <s-number-field label="Header Height"
                                    value={data.headerHeight.toString()}
                                    min={40} max={90} suffix="px"
                                    onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("headerHeight", Number(e.currentTarget.value))}
                                />

                                {/* Header Content */}
                                <s-text-field
                                    label="Header Content"
                                    value={data.headerContent}
                                    onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("headerContent", e.currentTarget.value)}
                                />

                                {/* Header Font Settings */}
                                <s-box>
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                        <s-number-field label="Header Font Size" value={data.headerFontSize.toString()} onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("headerFontSize", Number(e.currentTarget.value))} min={12} max={24} suffix="px" />
                                        <s-select label="Header Font Weight" value={data.headerFontWeight} onChange={(e: CallbackEvent<"s-select">) => onUpdate("headerFontWeight", e.currentTarget.value)}>
                                            <s-option value="300">Light (300)</s-option>
                                            <s-option value="400">Regular (400)</s-option>
                                            <s-option value="600">Semi-Bold (600)</s-option>
                                            <s-option value="700">Bold (700)</s-option>
                                        </s-select>
                                    </s-grid>
                                </s-box>

                                {/* Online Status Section */}
                                <s-stack gap="small-200">
                                    <s-heading>Online Status Indicator</s-heading>
                                    {/* Toggle Visibility */}
                                    <s-switch
                                        label="Show/hide toggle"
                                        checked={data.showOnlineStatus}
                                        onChange={(e: CallbackEvent<"s-switch">) => onUpdate("showOnlineStatus", e.currentTarget.checked)}
                                    />
                                    <s-grid gridTemplateColumns="auto auto 1fr" gap="small" alignItems="center" justifyContent="center">
                                        {/* 1. Preview (Read Only) */}
                                        <s-text-field
                                            value={statusPreviewText}
                                            readOnly
                                            disabled={!data.showOnlineStatus}
                                        />
                                        {/* 2. Type Selector */}
                                        <s-select
                                            value={data.onlineStatusType}
                                            disabled={!data.showOnlineStatus}
                                            onChange={(e: CallbackEvent<"s-select">) => onUpdate("onlineStatusType", e.currentTarget.value)}
                                        >
                                            <s-option value="Online">Online</s-option>
                                            <s-option value="Active">Active</s-option>
                                            <s-option value="Available">Available</s-option>
                                            <s-option value="Custom">Custom</s-option>
                                        </s-select>
                                        {/* 3. Custom Text Input (Only visible/enabled if 'Custom' is selected) */}
                                        <s-text-field
                                            placeholder="Type status..."
                                            value={data.customOnlineText}
                                            disabled={!data.showOnlineStatus}
                                            onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("customOnlineText", e.currentTarget.value)}
                                        />
                                    </s-grid>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </>
                )}
            </s-section>
        </>
    )
}