"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Sparkles, ImageIcon, Type, Palette, Maximize2, X, Trash2 } from "lucide-react";
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
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [expanded]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "textura-portrait.png";
    a.click();
  }, [resultUrl]);

  return (
    <div className="min-h-screen bg-[#eef5ff] text-slate-800">
      {/* Header */}
      <header className="border-b border-[#bcd9ff] bg-white/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <img src="/images/logo-textura-removedbg.png" alt="Textura Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">Textura</h1>
            <p className="text-xs text-slate-400">Transform images into text art</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#8ec2ff]" />
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
                ? "border-[#599fff] bg-[#d9e9ff]"
                : imageSrc
                  ? "border-[#bcd9ff] bg-white"
                  : "border-[#bcd9ff] bg-white hover:border-[#8ec2ff] hover:bg-[#eef5ff]"
                } ${imageSrc ? "p-2" : "p-12"}`}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Uploaded preview"
                  className="w-full rounded-lg object-contain max-h-64"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#8ec2ff]">
                  <Upload className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">
                      Drop an image here or click to browse
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Remove image
              </button>
            )}
          </div>

          {/* Right Column: Text + Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Type className="h-4 w-4 text-[#8ec2ff]" />
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Enter text to form the portrait..."
              rows={5}
              className="w-full rounded-xl border border-[#bcd9ff] bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#599fff]/20 focus:border-[#8ec2ff] resize-none transition-all"
            />
            <div className="text-right text-xs text-slate-400">
              {text.length}/{MAX_TEXT_LENGTH}
            </div>

            {/* Color Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#8ec2ff]" />
                Color Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setColorMode("bw")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${colorMode === "bw"
                    ? "border-[#599fff] bg-[#599fff] text-white shadow-sm"
                    : "border-[#bcd9ff] bg-white text-slate-600 hover:border-[#8ec2ff]"
                    }`}
                >
                  Black & White
                </button>
                <button
                  onClick={() => setColorMode("color")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${colorMode === "color"
                    ? "border-[#599fff] bg-[#599fff] text-white shadow-sm"
                    : "border-[#bcd9ff] bg-white text-slate-600 hover:border-[#8ec2ff]"
                    }`}
                >
                  Original Color
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Text Size: <span className="text-[#599fff] font-semibold">{fontSize}px</span>
              </label>
              <input
                type="range"
                min={3}
                max={12}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#599fff]"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Fine (3px)</span>
                <span>Coarse (12px)</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Type className="h-4 w-4 text-[#8ec2ff]" />
                Font Style
              </label>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Signature & Script</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.filter(f => f.category === "script").map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setFontFamily(font.value)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                          ? "border-[#599fff] bg-[#599fff] text-white shadow-sm"
                          : "border-[#bcd9ff] bg-white text-slate-600 hover:border-[#8ec2ff]"
                          }`}
                      >
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Elegant</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.filter(f => f.category === "elegant").map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setFontFamily(font.value)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                          ? "border-[#599fff] bg-[#599fff] text-white shadow-sm"
                          : "border-[#bcd9ff] bg-white text-slate-600 hover:border-[#8ec2ff]"
                          }`}
                      >
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5 uppercase tracking-wider font-medium">Clean & Modern</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.filter(f => f.category === "modern").map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setFontFamily(font.value)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all text-left ${fontFamily === font.value
                          ? "border-[#599fff] bg-[#599fff] text-white shadow-sm"
                          : "border-[#bcd9ff] bg-white text-slate-600 hover:border-[#8ec2ff]"
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
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-[#599fff] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#599fff]/25 transition-all hover:bg-[#4a8fe8] hover:shadow-lg hover:shadow-[#599fff]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? `Generating... ${progress}%` : "Generate Text Portrait"}
          </button>
        </div>

        {/* Progress Bar */}
        {generating && (
          <div className="max-w-md mx-auto">
            <div className="h-1.5 rounded-full bg-[#d9e9ff] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#599fff] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Preview */}
        {resultUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-600">Result</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#bcd9ff] bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-[#8ec2ff] hover:text-[#599fff]"
                >
                  <Maximize2 className="h-4 w-4" />
                  Expand
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#599fff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#4a8fe8] shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
              </div>
            </div>
            <div className="relative group rounded-xl border border-[#bcd9ff] bg-white p-2 overflow-auto shadow-sm">
              <img
                src={resultUrl}
                alt="Text portrait result"
                className="w-full rounded-lg cursor-pointer"
                onClick={() => setExpanded(true)}
              />
              <button
                onClick={() => setExpanded(true)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-[#bcd9ff] text-[#8ec2ff] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#599fff]"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="absolute top-6 right-20 p-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all z-10"
            >
              <Download className="h-6 w-6" />
            </button>
            <img
              src={resultUrl}
              alt="Text portrait result expanded"
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Empty State */}
        {!resultUrl && !generating && (
          <div className="text-center py-16 text-slate-400">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#bcd9ff] shadow-sm mb-4">
              <Sparkles className="h-7 w-7 text-[#8ec2ff]" />
            </div>
            <p className="text-sm">
              Upload an image and enter text, then hit Generate to create your
              text portrait.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#bcd9ff] bg-white/70 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-slate-400 mb-1">Textura &mdash; Typographic art, made simple.</p>
          <p className="text-xs text-slate-400 opacity-60">
            &copy; {new Date().getFullYear()} Textura. All rights reserved. Build with 💙 by <a href="https://github.com/Dani9809" target="_blank" rel="noopener noreferrer">Dani9809</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
