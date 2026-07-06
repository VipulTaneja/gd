import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { containsProfanity } from "@/lib/forums/profanity";
import { checkPostRateLimit } from "@/lib/forums/rate-limit";
import { validateRichTextBody } from "@/lib/rich-text";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const { body, replyToPostId } = await request.json();

  const parsedBody = validateRichTextBody(body);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }

  if (containsProfanity(parsedBody.plain)) {
    return NextResponse.json({ error: "Post contains inappropriate language" }, { status: 400 });
  }

  const underLimit = await checkPostRateLimit(userId);
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
        authorId: userId,
        body: parsedBody.html,
        replyToPostId: replyToPostId || null,
      },
    });

    await tx.forumThread.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return newPost;
  });

  const authorName = (await db.user.findUnique({ where: { id: userId }, select: { name: true } }))?.name ?? "Someone";
  const threadTitle = thread.title.length > 50 ? thread.title.slice(0, 50) + "…" : thread.title;

  if (thread.authorId !== userId) {
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

  if (replyToPostId) {
    const parentPost = await db.forumPost.findUnique({ where: { id: replyToPostId }, select: { authorId: true } });
    if (parentPost && parentPost.authorId !== userId && parentPost.authorId !== thread.authorId) {
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
