import { db } from "@/lib/db";
import type { UnitRole } from "@/generated/prisma/enums";

export async function hasActiveUnitRole(
  userId: string,
  unitId: string,
  roles?: UnitRole[],
): Promise<boolean> {
  const where: {
    userId: string;
    unitId: string;
    OR: Array<{ endDate: null } | { endDate: { gt: Date } }>;
    role?: { in: UnitRole[] };
  } = {
    userId,
    unitId,
    OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
  };

  if (roles && roles.length > 0) {
    where.role = { in: roles };
  }

  const count = await db.unitMembership.count({ where });
  return count > 0;
}

export async function getUserUnitMemberships(userId: string) {
  return db.unitMembership.findMany({
    where: {
      userId,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: { unit: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getUnitMembers(unitId: string) {
  return db.unitMembership.findMany({
    where: {
      unitId,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: [{ isPrimary: "desc" }, { startDate: "desc" }],
  });
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { globalRole: true },
  });
  return user?.globalRole === "SUPER_ADMIN" || user?.globalRole === "ADMIN";
}

export async function isOwner(userId: string, unitId: string): Promise<boolean> {
  return hasActiveUnitRole(userId, unitId, ["OWNER", "JOINT_OWNER"]);
}
