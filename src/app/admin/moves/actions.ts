"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function approveMove(moveId: string) {
  const admin = await requireAdmin();

  const move = await db.moveRequest.findUnique({ where: { id: moveId } });
  if (!move || move.status !== "PENDING") {
    throw new Error("Invalid move request");
  }

  await db.moveRequest.update({
    where: { id: moveId },
    data: { status: "APPROVED", scheduledAt: new Date() },
  });

  await createNotification(
    move.requestedBy,
    "APPROVAL_GRANTED",
    "Move Request Approved",
    `Your ${move.type.toLowerCase().replace("_", " ")} request has been approved.`,
    "/dashboard"
  );

  revalidatePath("/admin/moves");
}

export async function rejectMove(moveId: string) {
  const admin = await requireAdmin();

  const move = await db.moveRequest.findUnique({ where: { id: moveId } });
  if (!move || move.status !== "PENDING") {
    throw new Error("Invalid move request");
  }

  await db.moveRequest.update({
    where: { id: moveId },
    data: { status: "CANCELLED" },
  });

  await createNotification(
    move.requestedBy,
    "APPROVAL_REJECTED",
    "Move Request Rejected",
    `Your ${move.type.toLowerCase().replace("_", " ")} request has been rejected. Please contact the RWA.`,
    "/dashboard"
  );

  revalidatePath("/admin/moves");
}

export async function completeMove(moveId: string, checklist: Record<string, boolean>) {
  const admin = await requireAdmin();

  const move = await db.moveRequest.findUnique({ where: { id: moveId } });
  if (!move || move.status !== "APPROVED") {
    throw new Error("Move must be approved before completion");
  }

  const allChecked = Object.values(checklist).every(Boolean);
  if (!allChecked) {
    throw new Error("All checklist items must be completed");
  }

  if (move.type === "MOVE_OUT") {
    const pendingDues = await db.due.count({
      where: { unitId: move.unitId, status: "PENDING" },
    });
    if (pendingDues > 0) {
      throw new Error("Cannot complete move-out with pending dues");
    }
  }

  await db.moveRequest.update({
    where: { id: moveId },
    data: { status: "COMPLETED", completedAt: new Date(), checklist },
  });

  if (move.type === "MOVE_OUT") {
    await db.unitMembership.updateMany({
      where: { unitId: move.unitId, endDate: null },
      data: { endDate: new Date() },
    });
  }

  revalidatePath("/admin/moves");
}
