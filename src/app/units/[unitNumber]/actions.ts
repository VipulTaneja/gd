"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import type { UnitRole } from "@/generated/prisma/enums";

export async function assignResident(unitNumber: string, data: {
  userId: string;
  role: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
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

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as { globalRole?: string }).globalRole ?? ""
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
