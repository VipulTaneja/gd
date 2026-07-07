"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/shared/file-upload";
import { uploadRichTextImage } from "@/lib/rich-text-upload";
import type { HubHeroSlideManageDto } from "@/lib/hub-hero";

interface HubHeroManagePanelProps {
  initialSlides: HubHeroSlideManageDto[];
}

export function HubHeroManagePanel({ initialSlides }: HubHeroManagePanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  async function apiCall(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("Choose an image to upload");
      return;
    }
    if (!altText.trim()) {
      setError("Alt text is required");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadRichTextImage(selectedFile, { namespace: "hub-hero" });
      const keyMatch = imageUrl.match(/[?&]key=([^&]+)/);
      const storageKey = keyMatch ? decodeURIComponent(keyMatch[1]) : null;

      await apiCall("/api/hub/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          storageKey,
          altText: altText.trim(),
          linkUrl: linkUrl.trim() || null,
        }),
      });

      setAltText("");
      setLinkUrl("");
      setSelectedFile(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add slide");
    } finally {
      setUploading(false);
    }
  }

  async function moveSlide(slide: HubHeroSlideManageDto, direction: "up" | "down") {
    const index = initialSlides.findIndex((s) => s.id === slide.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swap = initialSlides[swapIndex];
    if (!swap) return;

    setError(null);
    try {
      await Promise.all([
        apiCall(`/api/hub/hero-slides/${slide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: swap.sortOrder }),
        }),
        apiCall(`/api/hub/hero-slides/${swap.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: slide.sortOrder }),
        }),
      ]);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add slide</CardTitle>
          <CardDescription>
            Upload a photo for the home page carousel. JPEG, PNG, WebP, or GIF · max 5 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <FileUpload
                maxFiles={1}
                accept="image/jpeg,image/png,image/webp,image/gif"
                onFilesSelected={(files) => setSelectedFile(files[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-alt">Description (alt text)</Label>
              <Input
                id="hero-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Holi celebration in the courtyard"
                required
                className="min-h-11 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-link">Click URL (optional)</Label>
              <Input
                id="hero-link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/events or https://…"
                className="min-h-11 md:text-sm"
              />
            </div>
            <Button type="submit" disabled={pending || uploading} className="min-h-11">
              {(pending || uploading) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add to carousel
            </Button>
          </form>
        </CardContent>
      </Card>

      {initialSlides.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom slides yet. The hub shows default community images until you add one.
        </p>
      ) : (
        <div className="space-y-3">
          {initialSlides.map((slide, index) => (
            <SlideRow
              key={slide.id}
              slide={slide}
              index={index}
              total={initialSlides.length}
              pending={pending}
              onMove={moveSlide}
              onRefresh={refresh}
              onError={setError}
              apiCall={apiCall}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SlideRow({
  slide,
  index,
  total,
  pending,
  onMove,
  onRefresh,
  onError,
  apiCall,
}: {
  slide: HubHeroSlideManageDto;
  index: number;
  total: number;
  pending: boolean;
  onMove: (slide: HubHeroSlideManageDto, direction: "up" | "down") => void;
  onRefresh: () => void;
  onError: (msg: string | null) => void;
  apiCall: (url: string, init?: RequestInit) => Promise<unknown>;
}) {
  const [linkUrl, setLinkUrl] = useState(slide.linkUrl ?? "");
  const [altText, setAltText] = useState(slide.altText);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function saveMeta() {
    onError(null);
    try {
      await apiCall(`/api/hub/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: altText.trim(),
          linkUrl: linkUrl.trim() || null,
        }),
      });
      onRefresh();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function toggleActive() {
    onError(null);
    try {
      await apiCall(`/api/hub/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      onRefresh();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function remove() {
    onError(null);
    try {
      await apiCall(`/api/hub/hero-slides/${slide.id}`, { method: "DELETE" });
      setDeleteOpen(false);
      onRefresh();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-(--card-spacing)">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={slide.isActive ? "default" : "secondary"}>
                  {slide.isActive ? "Live" : "Hidden"}
                </Badge>
                <span className="text-xs text-muted-foreground">Order {index + 1}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`alt-${slide.id}`}>Alt text</Label>
                <Input
                  id={`alt-${slide.id}`}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="min-h-10 md:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`link-${slide.id}`}>Click URL</Label>
                <Input
                  id={`link-${slide.id}`}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Optional"
                  className="min-h-10 md:text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={pending} onClick={saveMeta}>
                  Save
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={pending} onClick={toggleActive}>
                  {slide.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pending || index === 0}
                  onClick={() => onMove(slide, "up")}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pending || index === total - 1}
                  onClick={() => onMove(slide, "down")}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pending}
                  onClick={() => setDeleteOpen(true)}
                  aria-label="Delete slide"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove slide?</DialogTitle>
            <DialogDescription>
              This removes the image from the home page carousel. Uploaded files are deleted from storage.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={remove}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
