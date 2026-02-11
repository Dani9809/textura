export type ColorMode = "bw" | "color";

export interface GenerateOptions {
  image: HTMLImageElement;
  text: string;
  colorMode: ColorMode;
  fontSize?: number;
  fontFamily?: string;
  outputScale?: number;
}

export const FONT_OPTIONS = [
  // Signature / Script styles
  { label: "Great Vibes", value: "'Great Vibes', cursive", category: "script" },
  { label: "Dancing Script", value: "'Dancing Script', cursive", category: "script" },
  { label: "Sacramento", value: "'Sacramento', cursive", category: "script" },
  { label: "Pacifico", value: "'Pacifico', cursive", category: "script" },
  { label: "Satisfy", value: "'Satisfy', cursive", category: "script" },
  { label: "Caveat", value: "'Caveat', cursive", category: "script" },
  { label: "Petit Formal Script", value: "'Petit Formal Script', cursive", category: "script" },
  { label: "Indie Flower", value: "'Indie Flower', cursive", category: "script" },
  // Elegant serif
  { label: "Playfair Display", value: "'Playfair Display', serif", category: "elegant" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif", category: "elegant" },
  { label: "Lobster", value: "'Lobster', cursive", category: "elegant" },
  // Clean / Modern
  { label: "Raleway Light", value: "'Raleway', sans-serif", category: "modern" },
  { label: "Monospace", value: "monospace", category: "modern" },
  { label: "Georgia", value: "Georgia, serif", category: "modern" },
] as const;

export function generateTextPortrait(
  options: GenerateOptions,
  onProgress?: (pct: number) => void
): HTMLCanvasElement {
  const { image, text, colorMode, fontSize = 6, fontFamily = "monospace", outputScale = 2 } = options;

  if (!text.trim()) throw new Error("Text cannot be empty");

  // Sample canvas — downscale image to a character grid
  const sampleCanvas = document.createElement("canvas");
  const sCtx = sampleCanvas.getContext("2d", { willReadFrequently: true })!;

  // Each character cell is roughly fontSize x fontSize
  const cellW = fontSize * 0.6; // monospace char width approximation
  const cellH = fontSize;

  // Figure out grid dimensions based on image aspect ratio
  const maxGridCols = Math.floor(800 / cellW); // reasonable max
  const aspectRatio = image.height / image.width;

  let cols = Math.min(Math.floor(image.width / 2), maxGridCols);
  let rows = Math.floor(cols * aspectRatio * (cellW / cellH));

  // Clamp rows
  if (rows > 600) {
    rows = 600;
    cols = Math.floor(rows / aspectRatio / (cellW / cellH));
  }

  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  sCtx.drawImage(image, 0, 0, cols, rows);
  const imageData = sCtx.getImageData(0, 0, cols, rows);
  const pixels = imageData.data;

  // Output canvas
  const outW = Math.floor(cols * cellW * outputScale);
  const outH = Math.floor(rows * cellH * outputScale);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const ctx = outCanvas.getContext("2d")!;

  // Background
  ctx.fillStyle = colorMode === "bw" ? "#000000" : "#000000";
  ctx.fillRect(0, 0, outW, outH);

  ctx.font = `${fontSize * outputScale}px ${fontFamily}`;
  ctx.textBaseline = "top";

  const textChars = text.replace(/\s+/g, " ");
  let charIndex = 0;

  const totalRows = rows;

  for (let row = 0; row < rows; row++) {
    if (onProgress && row % 20 === 0) {
      onProgress(Math.floor((row / totalRows) * 100));
    }

    for (let col = 0; col < cols; col++) {
      const idx = (row * cols + col) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Brightness 0-255
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      // Skip very dark pixels (background)
      if (brightness < 10) continue;

      const char = textChars[charIndex % textChars.length];
      charIndex++;

      // Opacity based on brightness
      const alpha = brightness / 255;

      if (colorMode === "bw") {
        const gray = Math.floor(brightness);
        ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      }

      const x = col * cellW * outputScale;
      const y = row * cellH * outputScale;
      ctx.fillText(char, x, y);
    }
  }

  onProgress?.(100);
  return outCanvas;
}
