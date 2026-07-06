"use server";

import { revalidatePath } from "next/cache";
import {
  acceptUnitInvite,
  declineUnitInvite,
  expireStaleInvites,
  grantOwnerConsentForTenantInvite,
} from "@/lib/unit-membership-requests";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/rbac";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getPendingInvitesForUser(userId: string) {
  await expireStaleInvites(userId);
  return db.unitMembershipRequest.findMany({
    where: {
      userId,
      status: "PENDING",
      type: { in: ["LEADER_INVITE", "ADMIN_INVITE"] },
      OR: [
        { ownerConsent: { in: ["NOT_REQUIRED", "GRANTED"] } },
        { requestedRole: { not: "TENANT" } },
      ],
    },
    include: {
      unit: { select: { unitNumber: true } },
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnerConsentInvitesForUser(userId: string) {
  const memberships = await db.unitMembership.findMany({
    where: {
      userId,
      role: { in: ["OWNER", "JOINT_OWNER"] },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    select: { unitId: true },
  });
  const unitIds = memberships.map((m) => m.unitId);
  if (unitIds.length === 0) return [];

  return db.unitMembershipRequest.findMany({
    where: {
      unitId: { in: unitIds },
      status: "PENDING",
      requestedRole: "TENANT",
      ownerConsent: "PENDING",
    },
    include: {
      unit: { select: { unitNumber: true } },
      user: { select: { id: true, name: true } },
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptUnitInviteAction(requestId: string) {
  const userId = await requireUserId();
  await acceptUnitInvite(userId, requestId);
  revalidatePath("/profile");
  revalidatePath("/units");
}

export async function declineUnitInviteAction(requestId: string) {
  const userId = await requireUserId();
  await declineUnitInvite(userId, requestId);
  revalidatePath("/profile");
}

export async function approveTenantInviteAction(requestId: string) {
  const userId = await requireUserId();
  await grantOwnerConsentForTenantInvite(userId, requestId);
  revalidatePath("/profile");
}
