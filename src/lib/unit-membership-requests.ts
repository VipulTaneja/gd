import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import type { UnitRole } from "@/generated/prisma/enums";
import {
  assertUnitLeaderScope,
  validateInviteRole,
} from "@/lib/rbac-leaders";
import { hasActiveUnitRole, isAdmin, isOwner } from "@/lib/rbac";

const INVITE_EXPIRY_DAYS = 30;

async function getUnitOwnerUserIds(unitId: string): Promise<string[]> {
  const memberships = await db.unitMembership.findMany({
    where: {
      unitId,
      role: { in: ["OWNER", "JOINT_OWNER"] },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    select: { userId: true },
  });
  return memberships.map((m) => m.userId);
}

export async function inviteUnitMemberByAdmin(
  actorId: string,
  unitId: string,
  inviteeUserId: string,
  role: UnitRole,
) {
  if (!(await isAdmin(actorId))) throw new Error("Forbidden");

  const roleError = await validateInviteRole(unitId, role);
  if (roleError) throw new Error(roleError);

  const invitee = await db.user.findUnique({
    where: { id: inviteeUserId },
    select: { id: true, approvalStatus: true, isActive: true },
  });
  if (!invitee?.isActive) throw new Error("User not found or deactivated");

  if (await hasActiveUnitRole(inviteeUserId, unitId)) {
    throw new Error("User is already a member of this unit");
  }

  const existingPending = await db.unitMembershipRequest.findFirst({
    where: { unitId, userId: inviteeUserId, status: "PENDING" },
  });
  if (existingPending) throw new Error("Pending invite already exists");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const request = await db.unitMembershipRequest.create({
    data: {
      unitId,
      userId: inviteeUserId,
      requestedRole: role,
      type: "ADMIN_INVITE",
      status: "PENDING",
      invitedById: actorId,
      expiresAt,
      ownerConsent: role === "TENANT" ? "NOT_REQUIRED" : "NOT_REQUIRED",
    },
    include: { unit: { select: { unitNumber: true } } },
  });

  await logAction(actorId, "UNIT_ADMIN_INVITE_SENT", "UnitMembershipRequest", request.id, {
    unitId,
    inviteeUserId,
    role,
  });

  if (invitee.approvalStatus === "APPROVED") {
    await createNotification(
      inviteeUserId,
      "UNIT_INVITE",
      `Invitation to join ${request.unit.unitNumber}`,
      `RWA admin invited you as ${role.replace("_", " ").toLowerCase()}. Accept in your profile.`,
      "/profile",
    );
  }

  return request;
}

export async function expireStaleInvites(userId?: string) {
  await db.unitMembershipRequest.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
      ...(userId ? { userId } : {}),
    },
    data: { status: "EXPIRED", reviewedAt: new Date() },
  });
}

export async function inviteUnitMemberByLeader(
  actorId: string,
  unitId: string,
  inviteeUserId: string,
  role: UnitRole,
) {
  await assertUnitLeaderScope(actorId, unitId);

  if (actorId === inviteeUserId) {
    throw new Error("Cannot invite yourself");
  }

  const roleError = await validateInviteRole(unitId, role);
  if (roleError) throw new Error(roleError);

  const invitee = await db.user.findUnique({
    where: { id: inviteeUserId },
    select: { id: true, approvalStatus: true, isActive: true, name: true },
  });
  if (!invitee?.isActive) throw new Error("User not found or deactivated");
  if (invitee.approvalStatus !== "APPROVED") {
    throw new Error("User account must be approved before inviting");
  }

  if (await hasActiveUnitRole(inviteeUserId, unitId)) {
    throw new Error("User is already a member of this unit");
  }

  const existingPending = await db.unitMembershipRequest.findFirst({
    where: { unitId, userId: inviteeUserId, status: "PENDING" },
  });
  if (existingPending) throw new Error("Pending invite already exists");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const request = await db.unitMembershipRequest.create({
    data: {
      unitId,
      userId: inviteeUserId,
      requestedRole: role,
      type: "LEADER_INVITE",
      status: "PENDING",
      invitedById: actorId,
      expiresAt,
      ownerConsent: role === "TENANT" ? "PENDING" : "NOT_REQUIRED",
    },
    include: { unit: { select: { unitNumber: true } } },
  });

  await logAction(actorId, "UNIT_INVITE_SENT", "UnitMembershipRequest", request.id, {
    unitId,
    inviteeUserId,
    role,
  });

  await createNotification(
    inviteeUserId,
    "UNIT_INVITE",
    `Invitation to join ${request.unit.unitNumber}`,
    role === "TENANT"
      ? `You've been invited as tenant. The unit owner must approve before you can accept — we'll notify you.`
      : `You've been invited as ${role.replace("_", " ").toLowerCase()}. Accept or decline in your profile.`,
    "/profile",
  );

  if (role === "TENANT") {
    const ownerIds = await getUnitOwnerUserIds(unitId);
    await Promise.all(
      ownerIds.map((ownerId) =>
        createNotification(
          ownerId,
          "GENERAL",
          `Tenant invite pending approval — ${request.unit.unitNumber}`,
          `A unit leader invited a tenant. Review and approve on your profile before they can accept.`,
          "/profile",
        ),
      ),
    );
  }

  return request;
}

export async function acceptUnitInvite(userId: string, requestId: string) {
  await expireStaleInvites(userId);

  const request = await db.unitMembershipRequest.findUnique({
    where: { id: requestId },
    include: { unit: true },
  });
  if (!request || request.userId !== userId) throw new Error("Invite not found");
  if (request.status !== "PENDING") throw new Error("Invite is no longer pending");
  if (request.expiresAt && request.expiresAt < new Date()) {
    await db.unitMembershipRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED", reviewedAt: new Date() },
    });
    throw new Error("Invite has expired");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { approvalStatus: true, isActive: true },
  });
  if (!user?.isActive || user.approvalStatus !== "APPROVED") {
    throw new Error("Account must be approved");
  }

  if (await hasActiveUnitRole(userId, request.unitId)) {
    throw new Error("Already a member of this unit");
  }

  if (request.requestedRole === "TENANT" && request.ownerConsent === "PENDING") {
    throw new Error("Unit owner must approve this tenant invite before you can accept");
  }
  if (request.requestedRole === "TENANT" && request.ownerConsent === "REVOKED") {
    throw new Error("This tenant invite was not approved by the unit owner");
  }

  const roleError = await validateInviteRole(request.unitId, request.requestedRole);
  if (roleError) throw new Error(roleError);

  await db.$transaction(async (tx) => {
    await tx.unitMembershipRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", reviewedAt: new Date() },
    });
    await tx.unitMembership.create({
      data: {
        userId,
        unitId: request.unitId,
        role: request.requestedRole,
        startDate: new Date(),
      },
    });
  });

  await syncTowerCommunitiesForUser(userId);
  await logAction(userId, "UNIT_INVITE_ACCEPTED", "UnitMembershipRequest", requestId, {
    unitId: request.unitId,
    role: request.requestedRole,
  });

  if (request.invitedById) {
    await createNotification(
      request.invitedById,
      "UNIT_INVITE_ACCEPTED",
      `${request.unit.unitNumber}: invite accepted`,
      `A resident accepted your unit invitation.`,
      `/units/${request.unit.unitNumber}`,
    );
  }

  return request;
}

export async function declineUnitInvite(userId: string, requestId: string) {
  const request = await db.unitMembershipRequest.findUnique({
    where: { id: requestId },
    include: { unit: { select: { unitNumber: true } }, user: { select: { name: true } } },
  });
  if (!request || request.userId !== userId) throw new Error("Invite not found");
  if (request.status !== "PENDING") throw new Error("Invite is no longer pending");

  await db.unitMembershipRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  await logAction(userId, "UNIT_INVITE_DECLINED", "UnitMembershipRequest", requestId);

  if (request.invitedById) {
    await createNotification(
      request.invitedById,
      "GENERAL",
      `${request.unit.unitNumber}: invite declined`,
      `${request.user.name} declined your unit invitation.`,
      `/units/${request.unit.unitNumber}`,
    );
  }
}

export async function grantOwnerConsentForTenantInvite(ownerId: string, requestId: string) {
  const request = await db.unitMembershipRequest.findUnique({
    where: { id: requestId },
    include: { unit: true, user: { select: { id: true, name: true } } },
  });
  if (!request || request.status !== "PENDING" || request.requestedRole !== "TENANT") {
    throw new Error("Invite not found");
  }
  if (!(await isOwner(ownerId, request.unitId))) {
    throw new Error("Only unit owners can approve tenant invites");
  }

  await db.unitMembershipRequest.update({
    where: { id: requestId },
    data: { ownerConsent: "GRANTED" },
  });

  await logAction(ownerId, "TENANT_INVITE_OWNER_CONSENT", "UnitMembershipRequest", requestId);

  await createNotification(
    request.userId,
    "UNIT_INVITE",
    `Tenant invite approved — ${request.unit.unitNumber}`,
    `The unit owner approved your invitation. You can now accept in your profile.`,
    "/profile",
  );
}

export async function processPendingInvitesOnAccountApproval(userId: string) {
  const pending = await db.unitMembershipRequest.findMany({
    where: {
      userId,
      status: "PENDING",
      type: { in: ["LEADER_INVITE", "ADMIN_INVITE"] },
    },
    include: { unit: { select: { unitNumber: true } } },
  });

  for (const req of pending) {
    await createNotification(
      userId,
      "UNIT_INVITE",
      `Invitation to join ${req.unit.unitNumber}`,
      `Your account is now approved. Accept or decline this unit invitation in your profile.`,
      "/profile",
    );
  }
}

export async function cancelUnitInvite(actorId: string, requestId: string) {
  const request = await db.unitMembershipRequest.findUnique({
    where: { id: requestId },
    include: { unit: true },
  });
  if (!request || request.status !== "PENDING") throw new Error("Invite not found");

  const admin = await isAdmin(actorId);
  if (!admin) {
    await assertUnitLeaderScope(actorId, request.unitId);
  }

  await db.unitMembershipRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED", reviewedAt: new Date() },
  });
  await logAction(actorId, "UNIT_INVITE_CANCELLED", "UnitMembershipRequest", requestId);
}

export async function assignUnitLeader(
  actorId: string,
  unitId: string,
  leaderUserId: string | null,
) {
  const leader = leaderUserId
    ? await db.user.findUnique({
        where: { id: leaderUserId },
        select: { id: true, approvalStatus: true, isActive: true },
      })
    : null;

  if (leaderUserId) {
    if (!leader?.isActive || leader.approvalStatus !== "APPROVED") {
      throw new Error("Leader must be an approved active user");
    }
    if (!(await hasActiveUnitRole(leaderUserId, unitId))) {
      throw new Error("Leader must have active membership in this unit");
    }
    const existingLed = await db.unit.findFirst({
      where: { leaderUserId, NOT: { id: unitId } },
      select: { unitNumber: true },
    });
    if (existingLed) {
      throw new Error(`User already leads unit ${existingLed.unitNumber}`);
    }
  }

  await db.unit.update({
    where: { id: unitId },
    data: {
      leaderUserId,
      leaderAssignedAt: leaderUserId ? new Date() : null,
      leaderAssignedById: leaderUserId ? actorId : null,
    },
  });

  await logAction(actorId, leaderUserId ? "UNIT_LEADER_ASSIGNED" : "UNIT_LEADER_REMOVED", "Unit", unitId, {
    leaderUserId,
  });
}
