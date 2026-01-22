import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

export interface ChatWindowData {
    // Primary (Header/Bot)
    colorMode: 'solid' | 'gradient';
    primaryColor: string;
    gradientStart: string;
    gradientEnd: string;

    // Additional Colors
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    secondaryTextColor: string;

    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    width: number;
    height: number;
    borderRadius: number;
}

interface ChatWindowDesignProps {
    data: ChatWindowData;
    onUpdate: <K extends keyof ChatWindowData>(key: K, value: ChatWindowData[K]) => void;
}

export default function ChatWindowDesign({ data, onUpdate }: ChatWindowDesignProps) {
    const [isOpen, setIsOpen] = useState(false);

    const aestheticColors = ["#D73535", "#F4E5C2", "#295F4E", "#B2CD9C", "#FA8112", "#6E5034", "#5C6F2B", "#FFD41D", "#005461", "#061E29"];
    const fontColors = ["#111F35", "#ECECEC", "#362F4F", "#FCF8F8", "#222222", "#EDFFF0", "#000000", "#FFF8DE", "#2D3C59", "#EFE9E3", "#1A2A4F"];
    const bgColors = ["#FCF8F8" ,"#F0F0DB", "#ECECEC", "#EFE1B5", "#F0FFDF", "#F3F4F4", "#2B2A2A", "#3A2525", "#213448", "#1B211A"]
    const secondaryColors = ["#FF937E", "#FFD41D", "#005461", "#061E29", "#5C6F2B", "#B2CD9C", "#295F4E", "#F4E5C2", "#D73535", "#6E5034"]
    const presetGradients = [
        { start: "#1CB5E0", end: "#000851" }, { start: "#e3ffe7", end: "#d9e7ff" },
        { start: "#fcff9e", end: "#c67700" }, { start: "#d53369", end: "#daae51" },
        { start: "#9ebd13", end: "#008552" }, { start: "#f8ff00", end: "#3ad59f" },
    ];

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

                            {/* 1. Chatbot Color (Primary) */}
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

                            {/* 6. Primary Text Color (Added to replace MessageBox logic) */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Primary Text Color</s-heading>
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

                            {/* 7. Secondary Text Color */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Secondary Text Color</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-box>
                                        <s-color-field placeholder="Select a color" value={data.secondaryTextColor} onChange={(e: CallbackEvent<"s-color-field">) => onUpdate("secondaryTextColor", e.currentTarget.value)} />
                                        <s-stack direction="inline" gap="small" alignItems="center" paddingBlockStart="small">
                                            {fontColors.map((color) => (
                                                <button key={color} onClick={() => onUpdate("secondaryTextColor", color)} style={{ width: "40px", height: "40px", background: color, boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px", borderRadius: "999px", cursor: "pointer", border: data.secondaryTextColor === color ? "2px solid black" : "none" }} />
                                            ))}
                                        </s-stack>
                                    </s-box>
                                </s-stack>
                            </s-box>

                            {/* 8. Font Settings */}
                            <s-box>
                                <s-grid gridTemplateColumns="1fr 1fr" gap="small" alignItems="center" paddingBlockStart="small-200">
                                    <s-select label="Font family" value={data.fontFamily} onChange={(e: CallbackEvent<"s-select">) => onUpdate("fontFamily", e.currentTarget.value)}>
                                        <s-option value="Inter"><span style={{fontFamily: "Inter, sans-serif"}}>Inter</span></s-option>
                                        <s-option value="Poppins"><span style={{fontFamily: "Poppins, sans-serif"}}>Poppins</span></s-option>
                                        <s-option value="Roboto"><span style={{fontFamily: "Roboto, sans-serif"}}>Roboto</span></s-option>
                                        <s-option value="Open Sans"><span style={{fontFamily: '"Open Sans", sans-serif'}}>Open Sans</span></s-option>
                                        <s-option value="Lato"><span style={{fontFamily: "Lato, sans-serif"}}>Lato</span></s-option>
                                        <s-option value="Montserrat"><span style={{fontFamily: "Montserrat, sans-serif"}}>Montserrat</span></s-option>
                                        <s-option value="Raleway"><span style={{fontFamily: "Raleway, sans-serif"}}>Raleway</span></s-option>
                                        <s-option value="Nunito"><span style={{fontFamily: "Nunito, sans-serif"}}>Nunito</span></s-option>
                                        <s-option value="Playfair Display"><span style={{fontFamily: '"Playfair Display", sans-serif'}}>Playfair Display</span></s-option>
                                        <s-option value="Merriweather"><span style={{fontFamily: "Merriweather, sans-serif"}}>Merriweather</span></s-option>
                                        <s-option value="Source Sans Pro"><span style={{fontFamily: '"Source Sans Pro", sans-serif'}}>Source Sans Pro</span></s-option>
                                        <s-option value="Ubuntu"><span style={{fontFamily: "Ubuntu, sans-serif"}}>Ubuntu</span></s-option>
                                        <s-option value="Oswald"><span style={{fontFamily: "Oswald, sans-serif"}}>Oswald</span></s-option>
                                        <s-option value="PT Sans"><span style={{fontFamily: '"PT Sans", sans-serif'}}>PT Sans</span></s-option>
                                        <s-option value="Noto Sans"><span style={{fontFamily: '"Noto Sans", sans-serif'}}>Noto Sans</span></s-option>
                                    </s-select>
                                    <s-number-field label="Font Size" value={data.fontSize.toString()} onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("fontSize", Number(e.currentTarget.value))} min={12} max={18} suffix="px" />
                                </s-grid>
                                <s-box paddingBlockStart="small">
                                    <s-select label="Font Weight" value={data.fontWeight} onChange={(e: CallbackEvent<"s-select">) => onUpdate("fontWeight", e.currentTarget.value)}>
                                        <s-option value="300"><span style={{fontWeight: 300}}>Light (300)</span></s-option>
                                        <s-option value="400"><span style={{fontWeight: 400}}>Regular (400)</span></s-option>
                                        <s-option value="700"><span style={{fontWeight: 700}}>Bold (700)</span></s-option>
                                    </s-select>
                                </s-box>
                            </s-box>

                            {/* 9. Window Size & Border Radius */}
                            <s-box border="base base dashed" borderRadius="base" padding="small" background="subdued">
                                <s-heading>Window Size & Border Radius</s-heading>
                                <s-stack direction="block" gap="small" paddingBlockStart="small-200">
                                    <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                                        <s-number-field
                                            label="Width"
                                            value={data.width.toString()}
                                            min={280}
                                            max={600}
                                            suffix="px"
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("width", Number(e.currentTarget.value))}
                                        />
                                        <s-number-field
                                            label="Height"
                                            value={data.height.toString()}
                                            min={300}
                                            max={800}
                                            suffix="px"
                                            onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("height", Number(e.currentTarget.value))}
                                        />
                                    </s-grid>
                                    <s-number-field
                                        label="Border Radius"
                                        value={data.borderRadius.toString()}
                                        min={0}
                                        max={30}
                                        suffix="px"
                                        onInput={(e: CallbackEvent<"s-number-field">) => onUpdate("borderRadius", Number(e.currentTarget.value))}
                                    />
                                </s-stack>
                            </s-box>

                        </s-stack>
                    </s-stack>
                </>
            )}
        </s-section>
    );
}