import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { canManageHubHero } from "@/lib/hub-hero-auth";
import {
  listActiveHubHeroSlides,
  listManageHubHeroSlides,
  nextHubHeroSortOrder,
  normalizeHeroLinkUrl,
} from "@/lib/hub-hero";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("manage") === "1") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await canManageHubHero(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const slides = await listManageHubHeroSlides();
    return NextResponse.json({ slides });
  }

  const slides = await listActiveHubHeroSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await canManageHubHero(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { imageUrl, storageKey, altText, linkUrl } = body;

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }
  if (!altText || typeof altText !== "string" || !altText.trim()) {
    return NextResponse.json({ error: "Alt text is required" }, { status: 400 });
  }

  let normalizedLink: string | null;
  try {
    normalizedLink = normalizeHeroLinkUrl(linkUrl);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid link URL" },
      { status: 400 },
    );
  }

  const sortOrder = await nextHubHeroSortOrder();

  const slide = await db.hubHeroSlide.create({
    data: {
      imageUrl,
      storageKey: typeof storageKey === "string" ? storageKey : null,
      altText: altText.trim(),
      linkUrl: normalizedLink,
      sortOrder,
      createdById: session.user.id,
    },
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

  await logAction(session.user.id, "HUB_HERO_SLIDE_CREATED", "HubHeroSlide", slide.id, {
    altText: slide.altText,
  });

  return NextResponse.json({
    slide: { ...slide, createdAt: slide.createdAt.toISOString() },
  });
}
