"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { isAdminRole } from "@/lib/rbac";
import type { UnitRole } from "@/generated/prisma/enums";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isAdminRole(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function assignMember(
  unitId: string,
  data: {
    email: string;
    role: string;
    startDate: string;
    endDate?: string;
    isPrimary: boolean;
  },
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const targetUser = await db.user.findUnique({ where: { email: data.email } });
    if (!targetUser) {
      return { error: "User not found with this email" };
    }

    const existingMembership = await db.unitMembership.findFirst({
      where: {
        userId: targetUser.id,
        unitId,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });

    if (existingMembership) {
      return { error: "User already has an active membership in this unit" };
    }

    await db.unitMembership.create({
      data: {
        userId: targetUser.id,
        unitId,
        role: data.role as UnitRole,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isPrimary: data.isPrimary,
      },
    });

    await syncTowerCommunitiesForUser(targetUser.id);

    await logAction(admin.id, "MEMBER_ASSIGNED", "UnitMembership", unitId, { targetUser: data.email, role: data.role });

    revalidatePath(`/admin/units/${unitId}`);
    revalidatePath("/admin/units");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign member" };
  }
}

export async function transferOwnership(
  unitId: string,
  newOwnerEmail: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const newOwner = await db.user.findUnique({ where: { email: newOwnerEmail } });
    if (!newOwner) {
      return { error: "User not found with this email" };
    }

    const currentOwners = await db.unitMembership.findMany({
      where: {
        unitId,
        role: { in: ["OWNER", "JOINT_OWNER"] },
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });

    if (currentOwners.length === 0) {
      return { error: "No current owner found for this unit" };
    }

    await db.$transaction(async (tx) => {
      // Close existing owner memberships
      for (const owner of currentOwners) {
        await tx.unitMembership.update({
          where: { id: owner.id },
          data: { endDate: new Date() },
        });
      }

      // Create new owner membership
      await tx.unitMembership.create({
        data: {
          userId: newOwner.id,
          unitId,
          role: "OWNER",
          startDate: new Date(),
          isPrimary: true,
        },
      });
    });

    await syncTowerCommunitiesForUser(newOwner.id);
    for (const owner of currentOwners) {
      await syncTowerCommunitiesForUser(owner.userId);
    }

    await logAction(admin.id, "OWNERSHIP_TRANSFERRED", "Unit", unitId, { newOwner: newOwnerEmail });

    revalidatePath(`/admin/units/${unitId}`);
    revalidatePath("/admin/units");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to transfer ownership" };
  }
}
