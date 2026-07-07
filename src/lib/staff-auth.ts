import { db } from "@/lib/db";
import { getUserUnitMemberships, hasActiveUnitRole, isAdmin } from "@/lib/rbac";
import { isResidentStaffRole, isSocietyStaffRole, RESIDENT_STAFF_ROLES, SOCIETY_STAFF_ROLES } from "@/lib/staff-labels";

export { isResidentStaffRole, isSocietyStaffRole, RESIDENT_STAFF_ROLES, SOCIETY_STAFF_ROLES };

export async function getApprovedUser(userId: string) {
  return db.user.findFirst({
    where: { id: userId, approvalStatus: "APPROVED", isActive: true },
    select: { id: true, name: true, email: true, globalRole: true, approvalStatus: true },
  });
}

export async function requireApprovedResident(userId: string) {
  const user = await getApprovedUser(userId);
  if (!user) return null;
  return user;
}

export async function canManageStaffAssociation(
  userId: string,
  unitId: string,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  return hasActiveUnitRole(userId, unitId);
}

export async function getCallerUnitIds(userId: string): Promise<string[]> {
  const memberships = await getUserUnitMemberships(userId);
  return memberships.map((m) => m.unitId);
}
