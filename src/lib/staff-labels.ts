import type { StaffRole } from "@/generated/prisma/enums";

export function staffRoleLabel(role: StaffRole): string {
  const labels: Record<StaffRole, string> = {
    MAID: "Maid / housekeeping",
    NANNY: "Nanny",
    COOK: "Cook",
    DRIVER: "Driver",
    GARDENER: "Gardener",
    GUARD: "Security guard",
    FACILITY: "Facility / maintenance",
    ELECTRICIAN: "Electrician",
    PLUMBER: "Plumber",
    OTHER: "Other",
  };
  return labels[role] ?? role;
}

export function staffInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Roles managed at society level — not linked to a unit */
export const SOCIETY_STAFF_ROLES = [
  "GUARD",
  "FACILITY",
  "ELECTRICIAN",
  "PLUMBER",
] as const;

/** Roles residents may pick when associating staff with their unit */
export const RESIDENT_STAFF_ROLES = [
  "MAID",
  "NANNY",
  "COOK",
  "DRIVER",
  "GARDENER",
  "OTHER",
] as const;

export function isSocietyStaffRole(role: string): boolean {
  return (SOCIETY_STAFF_ROLES as readonly string[]).includes(role);
}

export function isResidentStaffRole(role: string): boolean {
  return (RESIDENT_STAFF_ROLES as readonly string[]).includes(role);
}
