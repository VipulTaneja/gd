"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function hidePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const post = await db.forumPost.update({
    where: { id: postId },
    data: { isHidden: true },
  });

  await logAction(userId, "FORUM_POST_HIDE", "ForumPost", postId, { threadId: post.threadId });
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const post = await db.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  await db.forumPost.delete({ where: { id: postId } });

  await logAction(userId, "FORUM_POST_DELETE", "ForumPost", postId, { threadId: post.threadId });
}

export async function lockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const thread = await db.forumThread.update({
    where: { id: threadId },
    data: { status: "LOCKED" },
  });

  await logAction(userId, "FORUM_THREAD_LOCK", "ForumThread", threadId, { title: thread.title });
}

export async function unlockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const thread = await db.forumThread.update({
    where: { id: threadId },
    data: { status: "OPEN" },
  });

  await logAction(userId, "FORUM_THREAD_UNLOCK", "ForumThread", threadId, { title: thread.title });
}

export async function pinThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existing = await db.forumThread.findUnique({ where: { id: threadId } });
  if (!existing) throw new Error("Thread not found");

  const thread = await db.forumThread.update({
    where: { id: threadId },
    data: { isPinned: !existing.isPinned },
  });

  await logAction(userId, thread.isPinned ? "FORUM_THREAD_PIN" : "FORUM_THREAD_UNPIN", "ForumThread", threadId, { title: thread.title });
}

export async function resolveReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const report = await db.forumReport.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedById: userId, resolvedAt: new Date() },
  });

  await logAction(userId, "FORUM_REPORT_RESOLVE", "ForumReport", reportId, { postId: report.postId });
}

export async function dismissReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const report = await db.forumReport.update({
    where: { id: reportId },
    data: { status: "DISMISSED", resolvedById: userId, resolvedAt: new Date() },
  });

  await logAction(userId, "FORUM_REPORT_DISMISS", "ForumReport", reportId, { postId: report.postId });
}
