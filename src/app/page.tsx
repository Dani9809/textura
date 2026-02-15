"use client";

import { Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ImageUpload } from "@/components/controls/ImageUpload";
import { TextControls } from "@/components/controls/TextControls";
import { PortraitPreview } from "@/components/preview/PortraitPreview";
import { useTextPortrait } from "@/hooks/use-text-portrait";

export default function Home() {
  const {
    imageSrc,
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
    canvasRef,
    handleFile,
    removeImage,
    generate
  } = useTextPortrait();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Upload */}
          <ImageUpload
            imageSrc={imageSrc}
            onFileSelect={handleFile}
            onRemove={removeImage}
          />

          {/* Right Column: Text + Options */}
          <TextControls
            text={text}
            onTextChange={setText}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generate}
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
        <PortraitPreview resultUrl={resultUrl} canvasRef={canvasRef} />

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

      <Footer />
    </div>
  );
}
