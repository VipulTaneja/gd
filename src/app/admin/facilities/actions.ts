"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { requireAdminUser, requireSuperAdmin } from "@/lib/rbac-leaders";

export async function updateFacility(
  id: string,
  data: {
    name: string;
    description?: string;
    location?: string;
    slotMinutes: number;
    maxAdvDays: number;
    capacity: number;
    maxBookingsPerUser: number;
    minCancelMinutes: number;
    requiresApproval: boolean;
  },
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdminUser();

    if (!data.name.trim()) return { error: "Name is required" };
    if (data.slotMinutes < 15 || data.capacity < 1) {
      return { error: "Invalid slot or capacity settings" };
    }

    const existing = await db.facility.findFirst({
      where: { name: data.name.trim(), NOT: { id } },
    });
    if (existing) return { error: "Another facility with this name already exists" };

    await db.facility.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        location: data.location?.trim() || null,
        slotMinutes: data.slotMinutes,
        maxAdvDays: data.maxAdvDays,
        capacity: data.capacity,
        maxBookingsPerUser: data.maxBookingsPerUser,
        minCancelMinutes: data.minCancelMinutes,
        requiresApproval: data.requiresApproval,
      },
    });

    await logAction(admin.id, "FACILITY_UPDATED", "Facility", id, { name: data.name });
    revalidatePath(`/admin/facilities/${id}`);
    revalidatePath("/admin/facilities");
    revalidatePath(`/facilities/${id}`);
    revalidatePath("/facilities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update facility" };
  }
}

export async function assignAmenityLeader(
  facilityId: string,
  email: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();

    const user = await db.user.findUnique({ where: { email: email.trim() } });
    if (!user) return { error: "User not found" };
    if (!user.isActive || user.approvalStatus !== "APPROVED") {
      return { error: "User must be an approved active account" };
    }

    const facility = await db.facility.findUnique({ where: { id: facilityId } });
    if (!facility) return { error: "Facility not found" };

    await db.facilityLeader.upsert({
      where: { facilityId_userId: { facilityId, userId: user.id } },
      update: { assignedById: admin.id, assignedAt: new Date() },
      create: { facilityId, userId: user.id, assignedById: admin.id },
    });

    await db.facility.update({
      where: { id: facilityId },
      data: { requiresApproval: true },
    });

    await logAction(admin.id, "AMENITY_LEADER_ASSIGNED", "FacilityLeader", facilityId, {
      userId: user.id,
      email: user.email,
    });
    revalidatePath(`/admin/facilities/${facilityId}`);
    revalidatePath(`/facilities/${facilityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign leader" };
  }
}

export async function removeAmenityLeader(
  facilityId: string,
  userId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();

    const deleted = await db.facilityLeader.deleteMany({
      where: { facilityId, userId },
    });
    if (deleted.count === 0) return { error: "Leader not found" };

    const remaining = await db.facilityLeader.count({ where: { facilityId } });
    if (remaining === 0) {
      await db.facility.update({
        where: { id: facilityId },
        data: { requiresApproval: false },
      });
    }

    await logAction(admin.id, "AMENITY_LEADER_REMOVED", "FacilityLeader", facilityId, { userId });
    revalidatePath(`/admin/facilities/${facilityId}`);
    revalidatePath(`/facilities/${facilityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove leader" };
  }
}
