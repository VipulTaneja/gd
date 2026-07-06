"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/rbac-leaders";
import { assignUnitLeader } from "@/lib/unit-membership-requests";

export async function setUnitLeader(unitId: string, leaderUserId: string | null) {
  const admin = await requireSuperAdmin();
  await assignUnitLeader(admin.id, unitId, leaderUserId);
  revalidatePath(`/admin/units/${unitId}`);
  revalidatePath("/admin/units");
}
