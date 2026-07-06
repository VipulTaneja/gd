import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { containsProfanity } from "@/lib/forums/profanity";
import { checkPostRateLimit } from "@/lib/forums/rate-limit";

export const dynamic = "force-dynamic";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body, replyToPostId } = await request.json();

  if (!body) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  if (body.length > 10000) {
    return NextResponse.json({ error: "Body must be 10,000 characters or less" }, { status: 400 });
  }

  if (containsProfanity(body)) {
    return NextResponse.json({ error: "Post contains inappropriate language" }, { status: 400 });
  }

  const underLimit = await checkPostRateLimit(session.user.id);
  if (!underLimit) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }

  const thread = await db.forumThread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (thread.status === "LOCKED") {
    return NextResponse.json({ error: "Thread is locked" }, { status: 403 });
  }

  if (replyToPostId) {
    const parentPost = await db.forumPost.findUnique({ where: { id: replyToPostId } });
    if (!parentPost || parentPost.threadId !== id) {
      return NextResponse.json({ error: "Invalid reply target" }, { status: 400 });
    }
  }

  const post = await db.$transaction(async (tx) => {
    const newPost = await tx.forumPost.create({
      data: {
        threadId: id,
        authorId: session.user.id,
        body: sanitize(body),
        replyToPostId: replyToPostId || null,
      },
    });

    await tx.forumThread.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return newPost;
  });

  // Send notifications
  const authorName = (await db.user.findUnique({ where: { id: session.user.id }, select: { name: true } }))?.name ?? "Someone";
  const threadTitle = thread.title.length > 50 ? thread.title.slice(0, 50) + "…" : thread.title;

  // Notify thread author (if not the replier)
  if (thread.authorId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: thread.authorId,
        type: "FORUM_REPLY",
        title: "New reply on your thread",
        body: `${authorName} replied to "${threadTitle}"`,
        link: `/forums/threads/${id}`,
      },
    }).catch(() => {});
  }

  // Notify parent post author (if replying to someone else's post)
  if (replyToPostId) {
    const parentPost = await db.forumPost.findUnique({ where: { id: replyToPostId }, select: { authorId: true } });
    if (parentPost && parentPost.authorId !== session.user.id && parentPost.authorId !== thread.authorId) {
      await db.notification.create({
        data: {
          userId: parentPost.authorId,
          type: "FORUM_REPLY",
          title: "Reply to your comment",
          body: `${authorName} replied in "${threadTitle}"`,
          link: `/forums/threads/${id}`,
        },
      }).catch(() => {});
    }
  }

  return NextResponse.json({ success: true, id: post.id });
}
