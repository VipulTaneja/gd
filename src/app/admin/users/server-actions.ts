"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { GlobalRole } from "@/generated/prisma/enums";
import { createNotification } from "@/lib/notifications";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function approveUser(userId: string) {
  const admin = await requireAdmin();
  await db.user.update({
    where: { id: userId },
    data: {
      approvalStatus: "APPROVED",
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });

  const { processPendingInvitesOnAccountApproval } = await import(
    "@/lib/unit-membership-requests"
  );
  await processPendingInvitesOnAccountApproval(userId);

  await createNotification(
    userId,
    "APPROVAL_GRANTED",
    "Account Approved",
    "Your account has been approved. Welcome to Gulshan Dynasty!",
    "/dashboard",
  );

  revalidatePath("/admin/users");
}

export async function rejectUser(userId: string) {
  await requireAdmin();
  await db.user.update({
    where: { id: userId },
    data: { approvalStatus: "REJECTED" },
  });
  revalidatePath("/admin/users");
}

export async function deactivateUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Cannot deactivate yourself");

  await db.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  await db.session.deleteMany({ where: { userId } });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "USER_DEACTIVATED",
      entityType: "User",
      entityId: userId,
    },
  });

  revalidatePath("/admin/users");
}

export async function changeUserRole(userId: string, role: string) {
  const admin = await requireAdmin();
  if (userId === admin.id && role !== admin.globalRole) {
    throw new Error("Cannot change your own role");
  }

  await db.user.update({
    where: { id: userId },
    data: { globalRole: role as GlobalRole },
  });

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "ROLE_ASSIGNED",
      entityType: "User",
      entityId: userId,
      metadata: { newRole: role },
    },
  });

  revalidatePath("/admin/users");
}

export async function approveClaim(userId: string, unitId: string) {
  const admin = await requireAdmin();

  if (!unitId) {
    throw new Error("No unit claimed");
  }

  await db.user.update({
    where: { id: userId },
    data: { claimStatus: "APPROVED", approvalStatus: "APPROVED", approvedBy: admin.id, approvedAt: new Date() },
  });

  await db.unitMembership.create({
    data: {
      userId,
      unitId,
      role: "OWNER",
      startDate: new Date(),
      isPrimary: true,
    },
  });

  await syncTowerCommunitiesForUser(userId);

  await createNotification(
    userId,
    "APPROVAL_GRANTED",
    "Unit Claim Approved",
    "Your unit claim has been approved. Welcome to the community!",
    "/dashboard",
  );

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "CLAIM_APPROVED",
      entityType: "User",
      entityId: userId,
      metadata: { unitId },
    },
  });

  revalidatePath("/admin/users");
}

export async function rejectClaim(userId: string) {
  const admin = await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: { claimStatus: "REJECTED", claimedUnitId: null },
  });

  await createNotification(
    userId,
    "APPROVAL_REJECTED",
    "Unit Claim Rejected",
    "Your unit claim has been rejected. Please contact the RWA for details.",
    "/dashboard",
  );

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: "CLAIM_REJECTED",
      entityType: "User",
      entityId: userId,
    },
  });

  revalidatePath("/admin/users");
}
