"use client";

import { mediaUrlFromKey } from "@/lib/rich-text";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function normalizeUploadFile(file: File): File {
  if (file.name) return file;
  const ext = file.type.split("/")[1] || "png";
  return new File([file], `pasted-image.${ext}`, { type: file.type });
}

export async function uploadRichTextImage(file: File): Promise<string> {
  const uploadFile = normalizeUploadFile(file);
  if (!IMAGE_TYPES.includes(uploadFile.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }

  if (uploadFile.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 5 MB");
  }

  const presignRes = await fetch("/api/files/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: uploadFile.name,
      contentType: uploadFile.type,
      size: uploadFile.size,
    }),
  });

  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}));
    throw new Error(data.error || "Failed to prepare upload");
  }

  const { url, key } = await presignRes.json();

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: uploadFile,
    headers: { "Content-Type": uploadFile.type },
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image");
  }

  return mediaUrlFromKey(key);
}
