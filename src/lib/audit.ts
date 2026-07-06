import { db } from "@/lib/db";

export async function logAction(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  return db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata: metadata as unknown as import("@prisma/client/runtime/client").InputJsonValue ?? undefined,
    },
  });
}
