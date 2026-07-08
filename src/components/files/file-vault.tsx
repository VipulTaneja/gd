"use client";

import { useState, useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { formatBytes, mimeTypeIcon } from "@/lib/format-files";

export function DocumentUpload({
  subCommunityId,
  onUpload,
}: {
  subCommunityId?: string;
  onUpload?: (file: { name: string; size: number; mimeType: string; storageKey: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url, key } = await res.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storageKey: key,
          subCommunityId: subCommunityId || null,
        }),
      });
      onUpload?.({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        storageKey: key,
      });

      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FileList({
  files,
  onDelete,
}: {
  files: { id: string; name: string; sizeBytes: number; mimeType: string; createdAt: string }[];
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
          <span className="text-xl">{mimeTypeIcon(file.mimeType)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.sizeBytes)} · {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <a
            href={`/api/files/download?id=${file.id}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-xs font-medium hover:bg-muted"
          >
            Download
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(file.id)}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      {files.length === 0 && (
        <p className="text-center py-8 text-sm text-muted-foreground">No files uploaded yet.</p>
      )}
    </div>
  );
}

/** @deprecated Use DocumentUpload */
export const FileUpload = DocumentUpload;
