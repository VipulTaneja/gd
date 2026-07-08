import { canManageCommunityContent } from "@/lib/faq-auth";
import {
  DOCUMENT_TYPES,
  IMAGE_TYPES,
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/upload-constants";

export {
  DOCUMENT_TYPES,
  IMAGE_TYPES,
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_SIZE,
  PUBLIC_MEDIA_PREFIXES,
  isPublicMediaKey,
} from "@/lib/upload-constants";

type UploadNamespace = "faq" | "hub-hero" | "document";

const UPLOAD_NAMESPACES: Record<
  UploadNamespace,
  {
    authGuard: (userId: string) => Promise<boolean>;
    allowedTypes: readonly string[];
    maxSize: number;
    keyPrefix: string;
    typeError: string;
    sizeError: string;
  }
> = {
  faq: {
    authGuard: canManageCommunityContent,
    allowedTypes: IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
    keyPrefix: "faq",
    typeError: "Only images are allowed for FAQ",
    sizeError: "Image must be under 5 MB",
  },
  "hub-hero": {
    authGuard: canManageCommunityContent,
    allowedTypes: IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
    keyPrefix: "hub-hero",
    typeError: "Only images are allowed for hero slides",
    sizeError: "Image must be under 5 MB",
  },
  document: {
    authGuard: async () => true,
    allowedTypes: DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
    keyPrefix: "",
    typeError: "File type not allowed",
    sizeError: "File too large (max 25 MB)",
  },
};

export function resolveUploadNamespace(namespace?: string): UploadNamespace {
  if (namespace === "faq" || namespace === "hub-hero") return namespace;
  return "document";
}

export function getUploadNamespaceConfig(namespace?: string) {
  return UPLOAD_NAMESPACES[resolveUploadNamespace(namespace)];
}

export function validateUpload(contentType: string, size: number, namespace?: string) {
  const config = getUploadNamespaceConfig(namespace);
  if (!config.allowedTypes.includes(contentType)) {
    return config.typeError;
  }
  if (size > config.maxSize) {
    return config.sizeError;
  }
  return null;
}
