import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { deleteFile } from "@/lib/minio";
import { canManageCommunityContent } from "@/lib/faq-auth";
import { normalizeHeroLinkUrl } from "@/lib/hub-hero";

type RouteContext = { params: Promise<{ id: string }> };

async function requireEditor() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!(await canManageCommunityContent(session.user.id))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { userId: session.user.id };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const guard = await requireEditor();
  if ("error" in guard) return guard.error;

  const { id } = await context.params;
  const body = await request.json();

  const existing = await db.hubHeroSlide.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  const data: {
    altText?: string;
    linkUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  } = {};

  if (body.altText !== undefined) {
    if (typeof body.altText !== "string" || !body.altText.trim()) {
      return NextResponse.json({ error: "Alt text is required" }, { status: 400 });
    }
    data.altText = body.altText.trim();
  }

  if (body.linkUrl !== undefined) {
    try {
      data.linkUrl = normalizeHeroLinkUrl(body.linkUrl);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid link URL" },
        { status: 400 },
      );
    }
  }

  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== "number") {
      return NextResponse.json({ error: "Invalid sort order" }, { status: 400 });
    }
    data.sortOrder = body.sortOrder;
  }

  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  const slide = await db.hubHeroSlide.update({
    where: { id },
    data,
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

  await logAction(guard.userId, "HUB_HERO_SLIDE_UPDATED", "HubHeroSlide", id, data);

  return NextResponse.json({
    slide: { ...slide, createdAt: slide.createdAt.toISOString() },
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const guard = await requireEditor();
  if ("error" in guard) return guard.error;

  const { id } = await context.params;

  const existing = await db.hubHeroSlide.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  if (existing.storageKey) {
    try {
      await deleteFile(existing.storageKey);
    } catch {
      // Storage cleanup is best-effort
    }
  }

  await db.hubHeroSlide.delete({ where: { id } });
  await logAction(guard.userId, "HUB_HERO_SLIDE_DELETED", "HubHeroSlide", id);

  return NextResponse.json({ success: true });
}
