"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ReplyComposerProps {
  threadId: string;
}

export function ReplyComposer({ threadId }: ReplyComposerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be under 5MB");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          setError("Failed to upload image");
          continue;
        }

        const data = await res.json();
        setImages((prev) => [...prev, data.url]);
      }
    } catch {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!body.trim() && images.length === 0) {
      setError("Reply cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forums/threads/${threadId}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: body.trim(),
            images: images.length > 0 ? images : undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        setBody("");
        setImages([]);
        router.refresh();
      } catch {
        setError("Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={10000}
        rows={3}
        className="block w-full rounded-xl border bg-card px-4 py-2.5 text-sm ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
        placeholder="Write a reply..."
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <Image src={url} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 3}
            className="inline-flex h-10 items-center justify-center rounded-full border border-input px-3 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {body.length.toLocaleString()}/10,000
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending || (!body.trim() && images.length === 0)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-black transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reply"
          )}
        </button>
      </div>
    </form>
  );
}
