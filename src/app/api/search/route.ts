import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [], units: [], threads: [] });
  }

  const [users, units, threads] = await Promise.all([
    db.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        globalRole: true,
        unitMemberships: {
          where: { endDate: null },
          select: { unit: { select: { unitNumber: true } } },
        },
      },
      take: 5,
    }),
    db.unit.findMany({
      where: {
        unitNumber: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        unitNumber: true,
        block: true,
        floor: true,
        unitType: true,
      },
      take: 5,
    }),
    db.forumThread.findMany({
      where: {
        title: { contains: q, mode: "insensitive" },
        status: { not: "HIDDEN" },
      },
      select: {
        id: true,
        title: true,
        forum: { select: { slug: true, name: true } },
        author: { select: { id: true, name: true } },
        createdAt: true,
        _count: { select: { posts: true } },
      },
      take: 5,
      orderBy: { lastActivityAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      unitNumber: u.unitMemberships[0]?.unit?.unitNumber ?? null,
    })),
    units,
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      forumSlug: t.forum.slug,
      forumName: t.forum.name,
      author: t.author,
      createdAt: t.createdAt,
      replyCount: t._count.posts,
      href: `/forums/${t.forum.slug}/threads/${t.id}`,
    })),
  });
}
