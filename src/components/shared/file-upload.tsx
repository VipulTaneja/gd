"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({ onFilesSelected, maxFiles = 3, accept = "image/*" }: FileUploadProps) {
  const [preview, setPreview] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, maxFiles);

    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setPreview(previews);
    onFilesSelected(validFiles);
  };

  const removeFile = (index: number) => {
    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);
    onFilesSelected([]);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFiles}
        className="hidden"
      />

      {preview.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {preview.map((src, i) => (
            <div key={i} className="relative h-20 w-20 rounded-lg border overflow-hidden">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-input hover:border-gold/50 hover:bg-gold/5 transition-colors"
        >
          <div className="text-center">
            <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-1">Add photos (optional)</p>
          </div>
        </button>
      )}
    </div>
  );
}
