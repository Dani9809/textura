export type ColorMode = "bw" | "color";

export interface GenerateOptions {
  image: HTMLImageElement | HTMLCanvasElement;
  text: string;
  colorMode: ColorMode;
  fontSize?: number;
  fontFamily?: string;
  outputScale?: number;
}

export const FONT_OPTIONS = [
  // Signature / Script styles - overlap is desirable for flow
  { label: "Great Vibes", value: "'Great Vibes', cursive", category: "script", widthRatio: 0.8 },
  { label: "Dancing Script", value: "'Dancing Script', cursive", category: "script", widthRatio: 0.9 },
  { label: "Sacramento", value: "'Sacramento', cursive", category: "script", widthRatio: 0.9 },
  { label: "Pacifico", value: "'Pacifico', cursive", category: "script", widthRatio: 1.0 },
  { label: "Satisfy", value: "'Satisfy', cursive", category: "script", widthRatio: 0.9 },
  { label: "Caveat", value: "'Caveat', cursive", category: "script", widthRatio: 0.8 },
  { label: "Petit Formal Script", value: "'Petit Formal Script', cursive", category: "script", widthRatio: 0.8 },
  { label: "Indie Flower", value: "'Indie Flower', cursive", category: "script", widthRatio: 0.9 },
  // Elegant serif
  { label: "Playfair Display", value: "'Playfair Display', serif", category: "elegant", widthRatio: 0.9 },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif", category: "elegant", widthRatio: 0.85 },
  { label: "Lobster", value: "'Lobster', cursive", category: "elegant", widthRatio: 1.0 },
  // Clean / Modern
  { label: "Raleway Light", value: "'Raleway', sans-serif", category: "modern", widthRatio: 0.8 },
  { label: "Monospace", value: "monospace", category: "modern", widthRatio: 0.6 },
  { label: "Georgia", value: "Georgia, serif", category: "modern", widthRatio: 0.9 },
] as const;

export async function generateTextPortrait(
  options: GenerateOptions,
  onProgress?: (pct: number) => void
): Promise<HTMLCanvasElement> {
  const { image, text, colorMode, fontSize = 6, fontFamily = "monospace" } = options;

  // Dynamic scale: smaller fonts need higher resolution to look crisp.
  // Base scale is 2, but if font is small, we bump it up.
  let outputScale = options.outputScale || 2;
  if (fontSize <= 6) outputScale = 4;
  else if (fontSize <= 9) outputScale = 3;

  if (!text.trim()) throw new Error("Text cannot be empty");

  // Sample canvas — downscale image to a character grid
  const sampleCanvas = document.createElement("canvas");
  const sCtx = sampleCanvas.getContext("2d", { willReadFrequently: true })!;

  // Find the selected font's width ratio, default to 0.6 (monospace-ish)
  const selectedFont = FONT_OPTIONS.find(f => f.value === fontFamily);
  const widthRatio = selectedFont ? selectedFont.widthRatio : 0.6;

  // Calculate cell dimensions
  const cellW = fontSize * widthRatio;
  const cellH = fontSize;

  // Safeguard: Downscale huge images to prevent memory/GPU issues
  const MAX_DIMENSION = 4096;
  let sourceImage: CanvasImageSource = image;
  let srcW = image.width;
  let srcH = image.height;

  if (srcW > MAX_DIMENSION || srcH > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / srcW, MAX_DIMENSION / srcH);
    const tempW = Math.floor(srcW * ratio);
    const tempH = Math.floor(srcH * ratio);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = tempW;
    tempCanvas.height = tempH;
    const tCtx = tempCanvas.getContext("2d");
    if (tCtx) {
      tCtx.drawImage(image, 0, 0, tempW, tempH);
      sourceImage = tempCanvas;
      srcW = tempW;
      srcH = tempH;
    }
  }

  // Figure out grid dimensions based on image aspect ratio
  // Target roughly 1000px width for the calculation base.
  // This ensures that "Coarse" (12px) results in ~130 columns, which looks properly large.
  // "Fine" (6px) results in ~270 columns, which looks detailed.
  const maxGridCols = Math.floor(1000 / cellW);
  const aspectRatio = srcH / srcW;

  let cols = Math.min(Math.floor(srcW / 2), maxGridCols);
  let rows = Math.floor(cols * aspectRatio * (cellW / cellH));

  // Clamp rows to prevent extremely tall images crashing the browser
  if (rows > 1500) {
    rows = 1500;
    cols = Math.floor(rows / aspectRatio / (cellW / cellH));
  }

  sampleCanvas.width = cols;
  sampleCanvas.height = rows;
  // Use high quality for downsampling
  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = "high";
  sCtx.drawImage(sourceImage, 0, 0, cols, rows);

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
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, outW, outH);

  // Use larger font to ensure overlap and no gaps
  // 1.5x multiplier ensures characters bleed into neighbors, creating a continuous look for scripts
  const drawFontSize = fontSize * outputScale * 1.5;
  ctx.font = `${drawFontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle"; // Better centering
  ctx.textAlign = "center";    // Better centering

  const textChars = text.replace(/\s+/g, " ");
  let charIndex = 0;

  const totalRows = rows;

  for (let row = 0; row < rows; row++) {
    if (onProgress && row % 20 === 0) {
      onProgress(Math.floor((row / totalRows) * 100));
      // Yield to main thread every 20 rows to let UI update
      await new Promise(resolve => setTimeout(resolve, 0));
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
      // Boost alpha slightly to make small text more visible
      const alpha = Math.min(1, (brightness / 255) * 1.2);

      if (colorMode === "bw") {
        const gray = Math.floor(brightness);
        ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      }

      // Calculate center position for text
      const x = (col * cellW * outputScale) + (cellW * outputScale / 2);
      const y = (row * cellH * outputScale) + (cellH * outputScale / 2);
      ctx.fillText(char, x, y);
    }
  }

  onProgress?.(100);
  return outCanvas;
}
