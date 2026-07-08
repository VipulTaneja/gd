import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkFaqWriteRateLimit, rateLimitResponse } from "@/lib/faq-rate-limit";

/**
 * Admin, Super Admin, or active committee designation — shared editor permission.
 *
 * Unlike `isAdmin()` from `@/lib/rbac`, this function also requires the user
 * to have `isActive: true` and `approvalStatus: APPROVED` in the database.
 * Inactive or unapproved users are denied even if they hold an admin role.
 */
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

export async function guardFaqEditorRoute() {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  try {
    await requireFaqEditor(session.user.id);
  } catch {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const rl = checkFaqWriteRateLimit(session.user.id);
  if (!rl.ok) {
    return { error: rateLimitResponse(rl.retryAfterMs) };
  }
  return { userId: session.user.id };
}
