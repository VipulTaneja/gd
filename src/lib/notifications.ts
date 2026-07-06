import { db } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/enums";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string,
) {
  // Deduplicate: skip if same (userId, type) within last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await db.notification.findFirst({
    where: {
      userId,
      type,
      createdAt: { gte: fiveMinAgo },
    },
  });

  if (existing) return existing;

  return db.notification.create({
    data: { userId, type, title, body: body ?? null, link: link ?? null },
  });
}

export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  body?: string,
  link?: string,
) {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  // Check existing to deduplicate
  const existing = await db.notification.findMany({
    where: {
      userId: { in: userIds },
      type,
      createdAt: { gte: fiveMinAgo },
    },
    select: { userId: true },
  });

  const existingIds = new Set(existing.map((e) => e.userId));
  const newUserIds = userIds.filter((id) => !existingIds.has(id));

  if (newUserIds.length === 0) return [];

  return db.notification.createMany({
    data: newUserIds.map((userId) => ({
      userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    })),
  });
}

export async function markAsRead(notificationId: string) {
  return db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, isRead: false },
  });
}
