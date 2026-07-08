export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ...IMAGE_TYPES,
] as const;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;

export const PUBLIC_MEDIA_PREFIXES = ["uploads/hub-hero/", "uploads/faq/"] as const;

export function isPublicMediaKey(key: string): boolean {
  return PUBLIC_MEDIA_PREFIXES.some((prefix) => key.startsWith(prefix));
}
