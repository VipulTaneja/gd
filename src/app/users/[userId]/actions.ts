"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import type { GlobalRole } from "@/generated/prisma/enums";

export async function updateUserProfile(userId: string, data: {
  name?: string;
  phone?: string;
  organization?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  vehiclePlates?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const isOwnProfile = session.user.id === userId;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
  );

  if (!isOwnProfile && !isAdmin) {
    throw new Error("Forbidden");
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.organization !== undefined && {
        organization: data.organization || null,
      }),
      ...(data.emergencyContactName !== undefined && {
        emergencyContactName: data.emergencyContactName || null,
      }),
      ...(data.emergencyContactPhone !== undefined && {
        emergencyContactPhone: data.emergencyContactPhone || null,
      }),
      ...(data.vehiclePlates !== undefined && {
        vehiclePlates: data.vehiclePlates,
      }),
    },
  });

  await logAction(
    session.user.id,
    "USER_PROFILE_UPDATED",
    "User",
    userId,
    { fields: Object.keys(data) }
  );

  return updated;
}

export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
  );
  if (!isAdmin) throw new Error("Forbidden");

  const updated = await db.user.update({
    where: { id: userId },
    data: { globalRole: role as GlobalRole },
  });

  await logAction(
    session.user.id,
    "USER_ROLE_CHANGED",
    "User",
    userId,
    { newRole: role }
  );

  return updated;
}

export async function deactivateUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
  );
  if (!isAdmin) throw new Error("Forbidden");

  const updated = await db.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  await logAction(session.user.id, "USER_DEACTIVATED", "User", userId);

  return updated;
}

export async function reactivateUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
  );
  if (!isAdmin) throw new Error("Forbidden");

  const updated = await db.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  await logAction(session.user.id, "USER_REACTIVATED", "User", userId);

  return updated;
}
