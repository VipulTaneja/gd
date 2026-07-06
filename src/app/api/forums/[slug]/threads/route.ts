import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canReadForum, canPost } from "@/lib/forums/rbac";
import { containsProfanity } from "@/lib/forums/profanity";
import { checkThreadRateLimit } from "@/lib/forums/rate-limit";

export const dynamic = "force-dynamic";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const forum = await db.forum.findUnique({ where: { slug } });
  if (!forum) {
    return NextResponse.json({ error: "Forum not found" }, { status: 404 });
  }

  if (!canReadForum(forum, session.user as { id: string; globalRole: string; approvalStatus: string; isActive: boolean })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [threads, total] = await Promise.all([
    db.forumThread.findMany({
      where: { forumId: forum.id, status: { not: "HIDDEN" } },
      orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { posts: true } },
      },
    }),
    db.forumThread.count({
      where: { forumId: forum.id, status: { not: "HIDDEN" } },
    }),
  ]);

  return NextResponse.json({
    threads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { title, body } = await request.json();

  if (!title || !body) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  if (title.length > 120) {
    return NextResponse.json({ error: "Title must be 120 characters or less" }, { status: 400 });
  }

  if (body.length > 10000) {
    return NextResponse.json({ error: "Body must be 10,000 characters or less" }, { status: 400 });
  }

  if (containsProfanity(title) || containsProfanity(body)) {
    return NextResponse.json({ error: "Post contains inappropriate language" }, { status: 400 });
  }

  const underLimit = await checkThreadRateLimit(session.user.id);
  if (!underLimit) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }

  const forum = await db.forum.findUnique({ where: { slug } });
  if (!forum) {
    return NextResponse.json({ error: "Forum not found" }, { status: 404 });
  }

  if (!(await canPost(forum, session.user as { id: string; globalRole: string; approvalStatus: string; isActive: boolean }))) {
    if (forum.scope === "SUB_COMMUNITY") {
      return NextResponse.json({ error: "You must be a member of this community to post" }, { status: 403 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thread = await db.forumThread.create({
    data: {
      forumId: forum.id,
      authorId: session.user.id,
      title: sanitize(title),
      body: sanitize(body),
      posts: {
        create: {
          authorId: session.user.id,
          body: sanitize(body),
        },
      },
    },
    include: { posts: true },
  });

  // Notify admins about new thread
  const admins = await db.user.findMany({
    where: { globalRole: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
    select: { id: true },
  });
  const threadTitle = title.length > 50 ? title.slice(0, 50) + "…" : title;
  for (const admin of admins) {
    if (admin.id !== session.user.id) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "FORUM_REPLY",
          title: "New forum thread",
          body: `New thread "${threadTitle}" in ${forum.name}`,
          link: `/forums/${slug}/threads/${thread.id}`,
        },
      }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true, id: thread.id });
}
