import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/rbac";
import { validateRichTextBody } from "@/lib/rich-text";

export const dynamic = "force-dynamic";

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

  const parsedBody = validateRichTextBody(body);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
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

  // Find the first post (thread body) and update it
  const firstPost = await db.forumPost.findFirst({
    where: { threadId: id, authorId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (firstPost) {
    await db.$transaction([
      db.forumThread.update({
        where: { id },
        data: { body: parsedBody.html, updatedAt: new Date() },
      }),
      db.forumPost.update({
        where: { id: firstPost.id },
        data: { body: parsedBody.html, editedAt: new Date() },
      }),
    ]);
  }

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
