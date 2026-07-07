import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  canManageStaffAssociation,
  getCallerUnitIds,
  requireApprovedResident,
  isResidentStaffRole,
  isSocietyStaffRole,
} from "@/lib/staff-auth";
import {
  createStaffWithAssociation,
  getAllActiveStaff,
  getStaffReviewAggregates,
} from "@/lib/staff";
import type { StaffRole } from "@/generated/prisma/enums";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const associations = await getAllActiveStaff();
  const aggregates = await getStaffReviewAggregates(
    [...new Set(associations.map((a) => a.staffPersonId))],
  );

  const callerUnitIds = await getCallerUnitIds(session.user.id);
  const callerUnitIdSet = new Set(callerUnitIds);
  const myStaffPersonIds = new Set(
    associations
      .filter((a) => a.unitId && callerUnitIdSet.has(a.unitId))
      .map((a) => a.staffPersonId),
  );

  const staff = await Promise.all(
    associations.map(async (a) => {
      const isMyUnit = a.unitId ? callerUnitIdSet.has(a.unitId) : false;
      const canManage =
        isMyUnit && a.unitId
          ? await canManageStaffAssociation(session.user.id, a.unitId)
          : false;
      const canAddToMyUnit =
        a.scope === "UNIT" &&
        !isSocietyStaffRole(a.role) &&
        !isMyUnit &&
        callerUnitIds.length > 0 &&
        !myStaffPersonIds.has(a.staffPersonId) &&
        isResidentStaffRole(a.role);

      return {
        associationId: a.id,
        staffPersonId: a.staffPerson.id,
        name: a.staffPerson.name,
        role: a.role,
        scope: a.scope,
        unitId: a.unitId,
        unitNumber: a.unit?.unitNumber ?? null,
        recurrenceDays: a.recurrenceDays,
        avgRating: aggregates.get(a.staffPersonId)?.avgRating ?? null,
        reviewCount: aggregates.get(a.staffPersonId)?.reviewCount ?? 0,
        isMyUnit,
        canManage,
        canAddToMyUnit,
      };
    }),
  );

  return NextResponse.json({ staff, callerUnitIds });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const body = await request.json();
  const { name, phone, role, unitId, recurrenceDays, startDate } = body;

  if (!name || !phone || !role || !unitId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isResidentStaffRole(role)) {
    return NextResponse.json({ error: "Invalid role for resident association" }, { status: 400 });
  }

  const canManage = await canManageStaffAssociation(session.user.id, unitId);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { person, association } = await createStaffWithAssociation({
      name,
      phone,
      role: role as StaffRole,
      scope: "UNIT",
      unitId,
      recurrenceDays: recurrenceDays ?? ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
      registeredById: session.user.id,
      startDate: startDate ? new Date(startDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      staffPersonId: person.id,
      associationId: association.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create staff" },
      { status: 400 },
    );
  }
}
