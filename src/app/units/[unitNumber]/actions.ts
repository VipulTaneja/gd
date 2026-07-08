"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { isAdminRole } from "@/lib/rbac";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import {
  requireUnitAssetAccess,
  type PetInput,
  type VehicleInput,
} from "@/lib/unit-assets";
import type { UnitRole, PetGender, PetType, VehicleType } from "@/generated/prisma/enums";

export async function assignResident(unitNumber: string, data: {
  userId: string;
  role: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = isAdminRole(
    (session.user as { globalRole?: string }).globalRole
  );
  if (!isAdmin) throw new Error("Forbidden");

  const unit = await db.unit.findUnique({ where: { unitNumber } });
  if (!unit) throw new Error("Unit not found");

  const user = await db.user.findFirst({
    where: {
      OR: [
        { id: data.userId },
        { email: data.userId },
      ],
    },
  });
  if (!user) throw new Error("User not found");

  const membership = await db.unitMembership.create({
    data: {
      userId: user.id,
      unitId: unit.id,
      role: data.role as UnitRole,
      startDate: new Date(),
      isPrimary: data.role === "OWNER",
    },
  });

  await syncTowerCommunitiesForUser(user.id);

  await logAction(
    session.user.id,
    "RESIDENT_ASSIGNED",
    "UnitMembership",
    membership.id,
    { unitNumber, userId: user.id, role: data.role }
  );

  return membership;
}

export async function generateDue(unitNumber: string, data: {
  label: string;
  amount: number;
  dueDate: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = isAdminRole(
    (session.user as { globalRole?: string }).globalRole
  );
  if (!isAdmin) throw new Error("Forbidden");

  const unit = await db.unit.findUnique({ where: { unitNumber } });
  if (!unit) throw new Error("Unit not found");

  const due = await db.due.create({
    data: {
      unitId: unit.id,
      label: data.label,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
    },
  });

  await logAction(
    session.user.id,
    "DUE_GENERATED",
    "Due",
    due.id,
    { unitNumber, label: data.label, amount: data.amount }
  );

  return due;
}

export async function createPet(
  unitNumber: string,
  data: PetInput,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!data.name.trim()) return { error: "Pet name is required" };
    if (!session.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;

    await db.pet.create({
      data: {
        userId,
        unitId: unit.id,
        name: data.name.trim(),
        petType: data.petType as PetType,
        breed: data.breed?.trim() || null,
        color: data.color?.trim() || null,
        ageYears: data.ageYears ?? null,
        gender: (data.gender ?? "UNKNOWN") as PetGender,
        vaccinationExpiry: data.vaccinationExpiry ? new Date(data.vaccinationExpiry) : null,
        notes: data.notes?.trim() || null,
      },
    });

    await logAction(userId, "PET_REGISTERED", "Pet", unit.id, { unitNumber, name: data.name });
    revalidatePath(`/units/${unitNumber}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to register pet" };
  }
}

export async function updatePet(
  unitNumber: string,
  petId: string,
  data: PetInput,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!session.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;
    const pet = await db.pet.findFirst({ where: { id: petId, unitId: unit.id } });
    if (!pet) return { error: "Pet not found" };
    if (!data.name.trim()) return { error: "Pet name is required" };

    await db.pet.update({
      where: { id: petId },
      data: {
        name: data.name.trim(),
        petType: data.petType as PetType,
        breed: data.breed?.trim() || null,
        color: data.color?.trim() || null,
        ageYears: data.ageYears ?? null,
        gender: (data.gender ?? "UNKNOWN") as PetGender,
        vaccinationExpiry: data.vaccinationExpiry ? new Date(data.vaccinationExpiry) : null,
        notes: data.notes?.trim() || null,
      },
    });

    await logAction(userId, "PET_UPDATED", "Pet", petId, { unitNumber });
    revalidatePath(`/units/${unitNumber}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update pet" };
  }
}

export async function deletePet(
  unitNumber: string,
  petId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!session.user?.id) return { error: "Unauthorized" };
    const pet = await db.pet.findFirst({ where: { id: petId, unitId: unit.id } });
    if (!pet) return { error: "Pet not found" };

    await db.pet.delete({ where: { id: petId } });
    await logAction(session.user.id, "PET_REMOVED", "Pet", petId, { unitNumber });
    revalidatePath(`/units/${unitNumber}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove pet" };
  }
}

export async function createVehicle(
  unitNumber: string,
  data: VehicleInput,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!session.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;
    const reg = data.registrationNumber.trim().toUpperCase();
    if (!reg) return { error: "Registration number is required" };

    await db.vehicle.create({
      data: {
        unitId: unit.id,
        registeredByUserId: userId,
        vehicleType: data.vehicleType as VehicleType,
        registrationNumber: reg,
        make: data.make?.trim() || null,
        model: data.model?.trim() || null,
        color: data.color?.trim() || null,
      },
    });

    await logAction(userId, "VEHICLE_REGISTERED", "Vehicle", unit.id, { unitNumber, reg });
    revalidatePath(`/units/${unitNumber}`);
    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to register vehicle" };
  }
}

export async function updateVehicle(
  unitNumber: string,
  vehicleId: string,
  data: VehicleInput,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!session.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;
    const vehicle = await db.vehicle.findFirst({ where: { id: vehicleId, unitId: unit.id } });
    if (!vehicle) return { error: "Vehicle not found" };

    const reg = data.registrationNumber.trim().toUpperCase();
    if (!reg) return { error: "Registration number is required" };

    await db.vehicle.update({
      where: { id: vehicleId },
      data: {
        vehicleType: data.vehicleType as VehicleType,
        registrationNumber: reg,
        make: data.make?.trim() || null,
        model: data.model?.trim() || null,
        color: data.color?.trim() || null,
      },
    });

    await logAction(userId, "VEHICLE_UPDATED", "Vehicle", vehicleId, { unitNumber });
    revalidatePath(`/units/${unitNumber}`);
    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update vehicle" };
  }
}

export async function deleteVehicle(
  unitNumber: string,
  vehicleId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { session, unit } = await requireUnitAssetAccess(unitNumber);
    if (!session.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;
    const vehicle = await db.vehicle.findFirst({ where: { id: vehicleId, unitId: unit.id } });
    if (!vehicle) return { error: "Vehicle not found" };

    await db.vehicle.delete({ where: { id: vehicleId } });
    await logAction(userId, "VEHICLE_REMOVED", "Vehicle", vehicleId, { unitNumber });
    revalidatePath(`/units/${unitNumber}`);
    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove vehicle" };
  }
}
