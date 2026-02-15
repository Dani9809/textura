import { useState, useEffect } from "react";
import { Maximize2, Download, ChevronDown, X, ZoomIn, ZoomOut } from "lucide-react";
import { useZoomPan } from "@/hooks/use-zoom-pan";

interface PortraitPreviewProps {
    resultUrl: string | null;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function PortraitPreview({ resultUrl, canvasRef }: PortraitPreviewProps) {
    const [expanded, setExpanded] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [showFullscreenDownloadMenu, setShowFullscreenDownloadMenu] = useState(false);

    // Zoom and Pan hook
    const {
        zoom,
        pan,
        isDragging,
        resetZoomPan,
        handleZoomIn,
        handleZoomOut,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        setZoom,
        setPan
    } = useZoomPan();

    // Handle body scroll when expanded
    useEffect(() => {
        if (expanded) {
            document.body.style.overflow = "hidden";
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") setExpanded(false);
            };
            // Reset zoom/pan when opening
            resetZoomPan();

            window.addEventListener("keydown", handleKeyDown);
            return () => {
                document.body.style.overflow = "";
                window.removeEventListener("keydown", handleKeyDown);
            };
        } else {
            document.body.style.overflow = "";
        }
    }, [expanded, resetZoomPan]);

    const handleDownload = (format: "png" | "jpeg" = "png") => {
        if (!canvasRef.current) return;

        const link = document.createElement('a');
        link.download = `textura-portrait.${format === 'jpeg' ? 'jpg' : format}`;
        link.href = canvasRef.current.toDataURL(`image/${format}`, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowDownloadMenu(false);
        setShowFullscreenDownloadMenu(false);
    };

    if (!resultUrl) return null;

    return (
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

            {/* Fullscreen Modal */}
            {expanded && (
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
                                handleZoomOut();
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
                                handleZoomIn();
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
                        onMouseDown={(e) => handleMouseDown(e, pan)}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
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
        </div>
    );
}
