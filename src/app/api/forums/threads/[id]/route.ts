import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const thread = await db.forumThread.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      forum: true,
      posts: {
        where: { isHidden: false },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  await db.forumThread.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ...thread, viewCount: thread.viewCount + 1 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body } = await request.json();

  if (!body) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  if (body.length > 10000) {
    return NextResponse.json({ error: "Body must be 10,000 characters or less" }, { status: 400 });
  }

  const thread = await db.forumThread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (thread.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (thread.createdAt < fifteenMinAgo) {
    return NextResponse.json({ error: "Can only edit within 15 minutes of posting" }, { status: 403 });
  }

  const sanitized = sanitize(body);

  await db.$transaction([
    db.forumThread.update({
      where: { id },
      data: { body: sanitized, updatedAt: new Date() },
    }),
    db.forumPost.updateMany({
      where: { threadId: id, authorId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 1,
      data: { body: sanitized, editedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const thread = await db.forumThread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const admin = await isAdmin(session.user.id);
  if (thread.authorId !== session.user.id && !admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.forumThread.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
