import { Type, Palette } from "lucide-react";
import { FONT_OPTIONS, type ColorMode } from "@/lib/text-portrait";

const MAX_TEXT_LENGTH = 10000;

interface TextControlsProps {
    text: string;
    onTextChange: (text: string) => void;
    colorMode: ColorMode;
    onColorModeChange: (mode: ColorMode) => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    fontFamily: string;
    onFontFamilyChange: (font: string) => void;
}

export function TextControls({
    text,
    onTextChange,
    colorMode,
    onColorModeChange,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange
}: TextControlsProps) {
    return (
        <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Text Content
            </label>
            <textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value.slice(0, MAX_TEXT_LENGTH))}
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Enter text to form the portrait..."
                rows={5}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
            />
            <div className="text-right text-xs text-muted-foreground">
                {text.length}/{MAX_TEXT_LENGTH}
            </div>

            {/* Color Mode */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Color Mode
                </label>
                <div className="flex gap-3">
                    <button
                        onClick={() => onColorModeChange("bw")}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${colorMode === "bw"
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary"
                            }`}
                    >
                        Black & White
                    </button>
                    <button
                        onClick={() => onColorModeChange("color")}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${colorMode === "color"
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary"
                            }`}
                    >
                        Original Color
                    </button>
                </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                    Text Size: <span className="text-primary font-semibold">{fontSize}px</span>
                </label>

                <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Fine (3px)</span>
                    <span>Coarse (12px)</span>
                </div>
            </div>

            {/* Font Family */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    Font Style
                </label>

                <div className="space-y-3">
                    <div>
                        <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Signature & Script</p>
                        <div className="grid grid-cols-2 gap-2">
                            {FONT_OPTIONS.filter(f => f.category === "script").map((font) => (
                                <button
                                    key={font.value}
                                    onClick={() => onFontFamilyChange(font.value)}
                                    className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                        : "border-border bg-card text-muted-foreground hover:border-primary"
                                        }`}
                                >
                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Elegant</p>
                        <div className="grid grid-cols-2 gap-2">
                            {FONT_OPTIONS.filter(f => f.category === "elegant").map((font) => (
                                <button
                                    key={font.value}
                                    onClick={() => onFontFamilyChange(font.value)}
                                    className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                        : "border-border bg-card text-muted-foreground hover:border-primary"
                                        }`}
                                >
                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Clean & Modern</p>
                        <div className="grid grid-cols-2 gap-2">
                            {FONT_OPTIONS.filter(f => f.category === "modern").map((font) => (
                                <button
                                    key={font.value}
                                    onClick={() => onFontFamilyChange(font.value)}
                                    className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                        : "border-border bg-card text-muted-foreground hover:border-primary"
                                        }`}
                                >
                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
