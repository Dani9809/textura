import { useState, useRef, useCallback } from "react";
import { generateTextPortrait, FONT_OPTIONS, type ColorMode } from "@/lib/text-portrait";

const DEFAULT_TEXT = ``;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useTextPortrait() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [text, setText] = useState(DEFAULT_TEXT);
    const [colorMode, setColorMode] = useState<ColorMode>("color");
    const [fontSize, setFontSize] = useState(6);
    const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > MAX_FILE_SIZE) {
            alert("File size exceeds 5MB limit.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageSrc(e.target?.result as string);
            setResultUrl(null);
        };
        reader.readAsDataURL(file);
    }, []);

    const removeImage = useCallback(() => {
        setImageSrc(null);
        setResultUrl(null);
    }, []);

    const generate = useCallback(async () => {
        if (!imageSrc || !text.trim()) return;
        setGenerating(true);
        setProgress(0);
        setResultUrl(null);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // Small delay to allow UI to update
        await new Promise((resolve) => requestAnimationFrame(resolve));

        try {
            const canvas = generateTextPortrait(
                { image: img, text, colorMode, fontSize, fontFamily },
                (pct) => setProgress(pct)
            );
            canvasRef.current = canvas;
            setResultUrl(canvas.toDataURL("image/png"));
        } catch (error) {
            console.error("Generation failed:", error);
        } finally {
            setGenerating(false);
        }
    }, [imageSrc, text, colorMode, fontSize, fontFamily]);

    return {
        imageSrc,
        setImageSrc,
        text,
        setText,
        colorMode,
        setColorMode,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        generating,
        progress,
        resultUrl,
        setResultUrl,
        canvasRef,
        handleFile,
        removeImage,
        generate
    };
}
