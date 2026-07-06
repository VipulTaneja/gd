import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasActiveUnitRole, isAdmin } from "@/lib/rbac";
import type { PetGender, PetType, VehicleType } from "@/generated/prisma/enums";

export async function requireUnitAssetAccess(unitNumber: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const unit = await db.unit.findUnique({ where: { unitNumber } });
  if (!unit) throw new Error("Unit not found");

  const admin = await isAdmin(session.user.id);
  const member = await hasActiveUnitRole(session.user.id, unit.id);
  if (!admin && !member) throw new Error("Forbidden");

  return { session, unit, canEdit: admin || member };
}

export type PetInput = {
  name: string;
  petType: PetType;
  breed?: string;
  color?: string;
  ageYears?: number | null;
  gender?: PetGender;
  vaccinationExpiry?: string | null;
  notes?: string;
};

export type VehicleInput = {
  vehicleType: VehicleType;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
};
