import { db } from "@/lib/db";
import { hubHero, hubGallery } from "@/lib/hub-images";

export type HubHeroSlideDto = {
  id: string;
  imageUrl: string;
  altText: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type HubHeroSlideManageDto = HubHeroSlideDto & {
  storageKey: string | null;
  createdAt: string;
};

const fallbackSlides: HubHeroSlideDto[] = [
  {
    id: "fallback-hero",
    imageUrl: hubHero.src,
    altText: hubHero.alt,
    linkUrl: null,
    sortOrder: 0,
    isActive: true,
  },
  ...hubGallery.map((img, i) => ({
    id: `fallback-gallery-${i}`,
    imageUrl: img.src,
    altText: img.alt,
    linkUrl: null,
    sortOrder: i + 1,
    isActive: true,
  })),
];

export function normalizeHeroLinkUrl(url: unknown): string | null {
  if (url == null || url === "") return null;
  if (typeof url !== "string") throw new Error("Invalid link URL");
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    // fall through
  }
  throw new Error("Link must start with / or be a full http(s) URL");
}

export async function listActiveHubHeroSlides(): Promise<HubHeroSlideDto[]> {
  const slides = await db.hubHeroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      imageUrl: true,
      altText: true,
      linkUrl: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return slides.length > 0 ? slides : fallbackSlides;
}

export async function listManageHubHeroSlides(): Promise<HubHeroSlideManageDto[]> {
  const slides = await db.hubHeroSlide.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      imageUrl: true,
      storageKey: true,
      altText: true,
      linkUrl: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
    },
  });

  return slides.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function nextHubHeroSortOrder(): Promise<number> {
  const last = await db.hubHeroSlide.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function reorderHubHeroSlides(ids: string[]) {
  await db.$transaction(
    ids.map((id, index) =>
      db.hubHeroSlide.update({
        where: { id },
        data: { sortOrder: index * 10 },
      }),
    ),
  );
}
