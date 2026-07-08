import { db } from "@/lib/db";

/** Admin, Super Admin, or active committee designation — shared editor permission. */
export async function canManageCommunityContent(userId: string): Promise<boolean> {
  const user = await db.user.findFirst({
    where: { id: userId, isActive: true, approvalStatus: "APPROVED" },
    select: { globalRole: true },
  });
  if (!user) return false;
  if (user.globalRole === "SUPER_ADMIN" || user.globalRole === "ADMIN") return true;

  const designation = await db.designation.findFirst({
    where: {
      userId,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  return !!designation;
}

/** @deprecated Use canManageCommunityContent */
export const canManageFaq = canManageCommunityContent;

export async function requireFaqEditor(userId: string) {
  const allowed = await canManageCommunityContent(userId);
  if (!allowed) {
    throw new Error("Forbidden");
  }
}
