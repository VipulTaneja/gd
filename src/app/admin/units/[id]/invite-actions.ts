"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import type { UnitRole } from "@/generated/prisma/enums";
import { inviteUnitMemberByAdmin } from "@/lib/unit-membership-requests";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdminRole(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function inviteMemberViaRequest(
  unitId: string,
  data: { email: string; role: string },
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const targetUser = await db.user.findUnique({ where: { email: data.email } });
    if (!targetUser) {
      return { error: "User not found with this email" };
    }

    await inviteUnitMemberByAdmin(admin.id, unitId, targetUser.id, data.role as UnitRole);

    revalidatePath(`/admin/units/${unitId}`);
    revalidatePath("/admin/units");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to send invite" };
  }
}
