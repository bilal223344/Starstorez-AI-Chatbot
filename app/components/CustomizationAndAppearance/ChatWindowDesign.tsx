import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

export interface ChatWindowData {
    avatar: string;
    botName: string;

    // Primary (Header/Bot)
    colorMode: 'solid' | 'gradient';
    primaryColor: string;
    gradientStart: string;
    gradientEnd: string;

    // Additional Colors
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;

    fontFamily: string;
    fontSize: number;
    fontWeight: string;
}

interface ChatWindowDesignProps {
    data: ChatWindowData;
    onUpdate: <K extends keyof ChatWindowData>(key: K, value: ChatWindowData[K]) => void;
}

export default function ChatWindowDesign({ data, onUpdate }: ChatWindowDesignProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const aestheticColors = ["#D73535", "#F4E5C2", "#295F4E", "#B2CD9C", "#FA8112", "#6E5034", "#5C6F2B", "#FFD41D", "#005461", "#061E29"];
    const fontColors = ["#111F35", "#ECECEC", "#362F4F", "#FCF8F8", "#222222", "#EDFFF0", "#000000", "#FFF8DE", "#2D3C59", "#EFE9E3", "#1A2A4F"];
    const bgColors = ["#FCF8F8" ,"#F0F0DB", "#ECECEC", "#EFE1B5", "#F0FFDF", "#F3F4F4", "#2B2A2A", "#3A2525", "#213448", "#1B211A"]
    const secondaryColors = ["#FF937E", "#FFD41D", "#005461", "#061E29", "#5C6F2B", "#B2CD9C", "#295F4E", "#F4E5C2", "#D73535", "#6E5034"]
    const presetGradients = [
        { start: "#1CB5E0", end: "#000851" }, { start: "#e3ffe7", end: "#d9e7ff" },
        { start: "#fcff9e", end: "#c67700" }, { start: "#d53369", end: "#daae51" },
        { start: "#9ebd13", end: "#008552" }, { start: "#f8ff00", end: "#3ad59f" },
    ];
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
        // Define the shape of the custom element to include 'files'
        // This tells TypeScript: "Treat this target as an HTMLElement that definitely has a files array"
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

    const handleGradientSelect = (start: string, end: string) => {
        onUpdate("gradientStart", start);
        onUpdate("gradientEnd", end);
    };

    return (
        <s-section padding="none">
            <s-clickable onClick={() => setIsOpen(!isOpen)}>
                <s-stack padding="small base" gap="small" justifyContent="space-between" alignItems="center" direction="inline">
                    <s-heading><span style={{ fontSize: "1.1em", fontWeight: 600 }}>Chat Window Design</span></s-heading>
                    <s-icon type={isOpen ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </s-clickable>

            {isOpen && (
                <>
                    <s-divider />
                    <s-stack padding="none base base" gap="base">
                        <s-stack gap="base">

                            {/* 1. Chatbot Avatar */}
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

                            {/* 2. Chatbot Name */}
                            <s-box>
                                <s-heading>Chatbot Name</s-heading>
                                <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-text-field value={data.botName} onInput={(e: CallbackEvent<"s-text-field">) => onUpdate("botName", e.currentTarget.value)} maxLength={30} minLength={3} />
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* 3. Chatbot Color (Primary) */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Chatbot Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-button-group gap="none">
                                        <s-button slot="secondary-actions" onClick={() => onUpdate("colorMode", "solid")}>Color</s-button>
                                        <s-button slot="secondary-actions" onClick={() => onUpdate("colorMode", "gradient")}>Gradient</s-button>
                                    </s-button-group>

                                    {data.colorMode === 'solid' && (
                                        <s-box>
                                            <s-color-field placeholder="Select a color" value={data.primaryColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("primaryColor", e.currentTarget.value)} />
                                            <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                                {aestheticColors.map((color) => (
                                                    <button key={color} onClick={() => onUpdate("primaryColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.primaryColor === color ? "2px solid black" : "none" }} />
                                                ))}
                                            </s-stack>
                                        </s-box>
                                    )}

                                    {data.colorMode === 'gradient' && (
                                        <s-box>
                                            <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                                                <s-color-field value={data.gradientStart} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("gradientStart", e.currentTarget.value)} />
                                                <s-color-field value={data.gradientEnd} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("gradientEnd", e.currentTarget.value)} />
                                            </s-grid>
                                            <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                                {presetGradients.map((grad, i) => (
                                                    <button key={i} onClick={() => handleGradientSelect(grad.start, grad.end)} style={{ width: "115px", height: "40px", borderRadius: "999px", cursor: "pointer", background: `linear-gradient(90deg, ${grad.start} 0%, ${grad.end} 100%)`, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", border: data.gradientStart === grad.start ? "2px solid black" : "none" }} />
                                                ))}
                                            </s-stack>
                                        </s-box>
                                    )}
                                </s-stack>
                            </s-box>

                            {/* 4. Chatbot Secondary Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Chatbot Secondary Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.secondaryColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("secondaryColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {secondaryColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("secondaryColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.secondaryColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* 5. Chatbot Background Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Chatbot Background Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.backgroundColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("backgroundColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {bgColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("backgroundColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.backgroundColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* 6. Text Color (Added to replace MessageBox logic) */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Text Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.textColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("textColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {fontColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("textColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.textColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* 7. Font Settings */}
                            <s-box>
                                <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                    <s-select label="Font family" value={data.fontFamily} onChange={(e: CallbackEvent<"s-select">) => onUpdate("fontFamily", e.currentTarget.value)}>
                                        <s-option value="Inter">Inter</s-option>
                                        <s-option value="Poppins">Poppins</s-option>
                                        <s-option value="Roboto">Roboto</s-option>
                                    </s-select>
                                    <s-number-field label="Font Size" value={data.fontSize.toString()} onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("fontSize", Number(e.currentTarget.value))} min={12} max={18} suffix="px" />
                                </s-grid>
                                <s-box paddingBlockStart="small">
                                    <s-select label="Font Weight" value={data.fontWeight} onChange={(e: CallbackEvent<"s-select">) => onUpdate("fontWeight", e.currentTarget.value)}>
                                        <s-option value="300">Light (300)</s-option>
                                        <s-option value="400">Regular (400)</s-option>
                                        <s-option value="700">Bold (700)</s-option>
                                    </s-select>
                                </s-box>
                            </s-box>

                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}