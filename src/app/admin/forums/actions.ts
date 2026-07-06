"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function hidePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const post = await db.forumPost.update({
    where: { id: postId },
    data: { isHidden: true },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_POST_HIDE",
      entityType: "ForumPost",
      entityId: postId,
      metadata: { threadId: post.threadId },
    },
  });

  return post;
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const post = await db.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");

  await db.forumPost.delete({ where: { id: postId } });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_POST_DELETE",
      entityType: "ForumPost",
      entityId: postId,
      metadata: { threadId: post.threadId },
    },
  });

  return { success: true };
}

export async function lockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const thread = await db.forumThread.update({
    where: { id: threadId },
    data: { status: "LOCKED" },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_THREAD_LOCK",
      entityType: "ForumThread",
      entityId: threadId,
      metadata: { title: thread.title },
    },
  });

  return thread;
}

export async function unlockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const thread = await db.forumThread.update({
    where: { id: threadId },
    data: { status: "OPEN" },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_THREAD_UNLOCK",
      entityType: "ForumThread",
      entityId: threadId,
      metadata: { title: thread.title },
    },
  });

  return thread;
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

  await db.auditLog.create({
    data: {
      userId,
      action: thread.isPinned ? "FORUM_THREAD_PIN" : "FORUM_THREAD_UNPIN",
      entityType: "ForumThread",
      entityId: threadId,
      metadata: { title: thread.title },
    },
  });

  return thread;
}

export async function resolveReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const report = await db.forumReport.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedById: userId, resolvedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_REPORT_RESOLVE",
      entityType: "ForumReport",
      entityId: reportId,
      metadata: { postId: report.postId },
    },
  });

  return report;
}

export async function dismissReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const report = await db.forumReport.update({
    where: { id: reportId },
    data: { status: "DISMISSED", resolvedById: userId, resolvedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "FORUM_REPORT_DISMISS",
      entityType: "ForumReport",
      entityId: reportId,
      metadata: { postId: report.postId },
    },
  });

  return report;
}
