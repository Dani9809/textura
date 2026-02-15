"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Sparkles, ImageIcon, Type, Palette, Maximize2, X, Trash2, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { generateTextPortrait, FONT_OPTIONS, type ColorMode } from "@/lib/text-portrait";

const DEFAULT_TEXT = ``;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 10000;

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [fontSize, setFontSize] = useState(6);
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleGenerate = useCallback(async () => {
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

    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const canvas = generateTextPortrait(
        { image: img, text, colorMode, fontSize, fontFamily },
        (pct) => setProgress(pct)
      );
      canvasRef.current = canvas;
      setResultUrl(canvas.toDataURL("image/png"));
    } catch {
      // generation failed silently
    } finally {
      setGenerating(false);
    }
  }, [imageSrc, text, colorMode, fontSize, fontFamily]);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setExpanded(false);
      };
      setZoom(1);
      setPan({ x: 0, y: 0 });
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [expanded]);

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showFullscreenDownloadMenu, setShowFullscreenDownloadMenu] = useState(false);

  const handleDownload = useCallback((format: "png" | "jpeg" = "png") => {
    if (!canvasRef.current) return;

    // Create a temporary link
    const link = document.createElement('a');
    link.download = `textura-portrait.${format === 'jpeg' ? 'jpg' : format}`;
    // Quality 0.9 for jpeg
    link.href = canvasRef.current.toDataURL(`image/${format}`, 0.9);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowDownloadMenu(false);
    setShowFullscreenDownloadMenu(false);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-background/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/images/logo-textura-removedbg.png" alt="Textura Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Textura</h1>
              <p className="text-xs text-muted-foreground">Transform images into text art</p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Upload Image
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${dragOver
                ? "border-primary bg-primary/10"
                : imageSrc
                  ? "border-border bg-card"
                  : "border-border bg-card hover:border-primary hover:bg-accent"
                } ${imageSrc ? "p-2" : "p-12"}`}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Uploaded preview"
                  className="w-full rounded-lg object-contain max-h-64"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-primary">
                  <Upload className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Drop an image here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Supports JPG, PNG
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
            {imageSrc && (
              <button
                onClick={() => {
                  setImageSrc(null);
                  setResultUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-800 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Remove image
              </button>
            )}
          </div>

          {/* Right Column: Text + Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
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
                  onClick={() => setColorMode("bw")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${colorMode === "bw"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary"
                    }`}
                >
                  Black & White
                </button>
                <button
                  onClick={() => setColorMode("color")}
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
                onChange={(e) => setFontSize(Number(e.target.value))}
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
                        onClick={() => setFontFamily(font.value)}
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
                        onClick={() => setFontFamily(font.value)}
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
                        onClick={() => setFontFamily(font.value)}
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
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!imageSrc || !text.trim() || generating}
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? `Generating... ${progress}%` : "Generate Text Portrait"}
          </button>
        </div>

        {/* Progress Bar */}
        {generating && (
          <div className="max-w-md mx-auto">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Preview */}
        {resultUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Result</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <Maximize2 className="h-4 w-4" />
                  Expand
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                    <ChevronDown className="h-3 w-3 opacity-80" />
                  </button>
                  {showDownloadMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDownloadMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-popover shadow-xl z-20 overflow-hidden flex flex-col py-1">
                        <button
                          onClick={() => handleDownload("png")}
                          className="px-4 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          As PNG
                        </button>
                        <button
                          onClick={() => handleDownload("jpeg")}
                          className="px-4 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          As JPG
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="relative group rounded-xl border border-border bg-card p-2 overflow-hidden shadow-sm">
              <img
                src={resultUrl}
                alt="Text portrait result"
                className="w-full rounded-lg cursor-pointer"
                onClick={() => setExpanded(true)}
              />
              <button
                onClick={() => setExpanded(true)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Modal */}
        {expanded && resultUrl && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setExpanded(false)}
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="absolute top-6 right-20 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreenDownloadMenu(!showFullscreenDownloadMenu);
                }}
                className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-1"
              >
                <Download className="h-6 w-6" />
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFullscreenDownloadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullscreenDownloadMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border border-white/10 bg-black/80 backdrop-blur-md shadow-xl z-30 overflow-hidden flex flex-col py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload("png");
                      }}
                      className="px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      As PNG
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload("jpeg");
                      }}
                      className="px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      As JPG
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(z => Math.max(0.5, z - 0.25));
                }}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-white text-sm font-medium w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(z => Math.min(3, z + 0.25));
                }}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>

            <div
              className="overflow-hidden w-full h-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={(e) => {
                if (zoom <= 1) return;
                e.preventDefault();
                setIsDragging(true);
                dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                e.preventDefault();
                setPan({
                  x: e.clientX - dragStartRef.current.x,
                  y: e.clientY - dragStartRef.current.y
                });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resultUrl}
                alt="Text portrait result expanded"
                className="object-contain max-w-[95vw] max-h-[95vh] rounded-lg transition-transform duration-75 ease-out will-change-transform"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!resultUrl && !generating && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-sm mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm">
              Upload an image and enter text, then hit Generate to create your
              text portrait.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/70 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground mb-1">Textura &mdash; Typographic art, made simple.</p>
          <p className="text-xs text-muted-foreground opacity-60">
            &copy; {new Date().getFullYear()} Textura. All rights reserved. Build with 💙 by <a href="https://github.com/Dani9809" target="_blank" rel="noopener noreferrer">Dani9809</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
