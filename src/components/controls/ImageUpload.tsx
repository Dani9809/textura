import { useRef, useState } from "react";
import { Upload, ImageIcon, Trash2 } from "lucide-react";

interface ImageUploadProps {
    imageSrc: string | null;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
}

export function ImageUpload({ imageSrc, onFileSelect, onRemove }: ImageUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    const handleRemove = () => {
        onRemove();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
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
                        if (file) onFileSelect(file);
                    }}
                />
            </div>
            {imageSrc && (
                <button
                    onClick={handleRemove}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-800 cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" />
                    Remove image
                </button>
            )}
        </div>
    );
}
