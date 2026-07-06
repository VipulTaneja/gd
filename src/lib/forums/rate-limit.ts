import { db } from "@/lib/db";

const MAX_THREADS_PER_DAY = 10;
const MAX_POSTS_PER_DAY = 50;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function checkThreadRateLimit(userId: string): Promise<boolean> {
  const today = startOfDay(new Date());
  const count = await db.forumThread.count({
    where: {
      authorId: userId,
      createdAt: { gte: today },
    },
  });
  return count < MAX_THREADS_PER_DAY;
}

export async function checkPostRateLimit(userId: string): Promise<boolean> {
  const today = startOfDay(new Date());
  const count = await db.forumPost.count({
    where: {
      authorId: userId,
      createdAt: { gte: today },
    },
  });
  return count < MAX_POSTS_PER_DAY;
}
