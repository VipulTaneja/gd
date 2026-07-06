import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UnitRole } from "@/generated/prisma/enums";
import { hasActiveUnitRole, isAdmin } from "@/lib/rbac";

const BOOKABLE_ROLES: UnitRole[] = ["OWNER", "JOINT_OWNER", "TENANT"];
const LEADER_INVITE_ROLES: UnitRole[] = ["TENANT", "OWNER_FAMILY", "TENANT_FAMILY"];

export { BOOKABLE_ROLES, LEADER_INVITE_ROLES };

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      globalRole: true,
      approvalStatus: true,
      isActive: true,
      name: true,
      email: true,
    },
  });
  if (!user?.isActive) return null;
  return user;
}

export async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user || user.globalRole !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user || !(await isAdmin(user.id))) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { globalRole: true },
  });
  return user?.globalRole === "SUPER_ADMIN";
}

export async function isUnitLeader(userId: string, unitId: string): Promise<boolean> {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: { leaderUserId: true },
  });
  return unit?.leaderUserId === userId;
}

export async function getLedUnitId(userId: string): Promise<string | null> {
  const unit = await db.unit.findFirst({
    where: { leaderUserId: userId },
    select: { id: true },
  });
  return unit?.id ?? null;
}

export async function assertUnitLeaderScope(userId: string, unitId: string) {
  if (await isAdmin(userId)) return;
  if (!(await isUnitLeader(userId, unitId))) {
    throw new Error("Forbidden");
  }
}

export async function isCommunityLeader(
  userId: string,
  subCommunityId: string,
): Promise<boolean> {
  const membership = await db.communityMembership.findUnique({
    where: { userId_subCommunityId: { userId, subCommunityId } },
    select: { role: true },
  });
  return membership?.role === "ADMIN";
}

export async function assertCommunityLeaderScope(userId: string, subCommunityId: string) {
  if (await isAdmin(userId)) return;
  if (!(await isCommunityLeader(userId, subCommunityId))) {
    throw new Error("Forbidden");
  }
}

export async function isAmenityLeader(userId: string, facilityId: string): Promise<boolean> {
  const leader = await db.facilityLeader.findUnique({
    where: { facilityId_userId: { facilityId, userId } },
  });
  return !!leader;
}

export async function canApproveFacilityBooking(
  userId: string,
  facilityId: string,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  return isAmenityLeader(userId, facilityId);
}

export async function canBookFacility(userId: string): Promise<boolean> {
  if (await isAdmin(userId)) {
    const memberships = await db.unitMembership.findMany({
      where: {
        userId,
        role: { in: BOOKABLE_ROLES },
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      take: 1,
    });
    return memberships.length > 0;
  }
  const count = await db.unitMembership.count({
    where: {
      userId,
      role: { in: BOOKABLE_ROLES },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  return count > 0;
}

export async function unitHasActiveTenant(unitId: string): Promise<boolean> {
  const count = await db.unitMembership.count({
    where: {
      unitId,
      role: "TENANT",
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  return count > 0;
}

export async function unitHasOwnerAnchor(unitId: string): Promise<boolean> {
  const count = await db.unitMembership.count({
    where: {
      unitId,
      role: { in: ["OWNER", "JOINT_OWNER"] },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  return count > 0;
}

export async function validateInviteRole(unitId: string, role: UnitRole): Promise<string | null> {
  if (!LEADER_INVITE_ROLES.includes(role)) {
    return "This role can only be assigned by RWA admin";
  }
  if (role === "TENANT" && (await unitHasActiveTenant(unitId))) {
    return "Unit already has an active tenant";
  }
  if (role === "TENANT_FAMILY" && !(await unitHasActiveTenant(unitId))) {
    return "Unit must have an active tenant before inviting tenant family";
  }
  if (role === "OWNER_FAMILY" && !(await unitHasOwnerAnchor(unitId))) {
    return "Unit must have an active owner before inviting owner family";
  }
  return null;
}

export async function canViewUnitSensitive(userId: string, unitId: string): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  return hasActiveUnitRole(userId, unitId);
}

export async function canViewUnitNamesOnly(): Promise<boolean> {
  return true;
}
