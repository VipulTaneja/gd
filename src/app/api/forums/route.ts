import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forums = await db.forum.findMany({
    where: { isArchived: false },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: true } },
      threads: {
        orderBy: { lastActivityAt: "desc" },
        take: 1,
        select: { lastActivityAt: true },
      },
    },
  });

  const result = forums.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    scope: f.scope,
    subCommunityId: f.subCommunityId,
    isReadOnly: f.isReadOnly,
    sortOrder: f.sortOrder,
    threadCount: f._count.threads,
    lastActivityAt: f.threads[0]?.lastActivityAt ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!await isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, scope, subCommunityId } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await db.forum.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Forum with similar name already exists" }, { status: 409 });
  }

  const forum = await db.forum.create({
    data: {
      slug,
      name: sanitize(name),
      description: description ? sanitize(description) : null,
      scope: scope || "GLOBAL",
      subCommunityId: subCommunityId || null,
    },
  });

  return NextResponse.json({ success: true, id: forum.id, slug: forum.slug });
}
