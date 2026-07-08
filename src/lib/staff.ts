import { db } from "@/lib/db";
import type { StaffAssociationStatus, StaffRole, StaffScope } from "@/generated/prisma/enums";
import { staffInitials, staffRoleLabel, isSocietyStaffRole } from "@/lib/staff-labels";
import { canManageStaffAssociation, getCallerUnitIds, isResidentStaffRole } from "@/lib/staff-auth";
import { getReviewAggregate, getReviewAggregates } from "@/lib/review-aggregates";

export { staffInitials, staffRoleLabel };

export const MAX_ACTIVE_UNIT_ASSOCIATIONS = 5;

const activeAssociationWhere = {
  status: "ACTIVE" as StaffAssociationStatus,
  OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
};

export async function getStaffReviewAggregate(staffPersonId: string) {
  return getReviewAggregate(db.staffReview, "staffPersonId", staffPersonId);
}

export async function getStaffReviewAggregates(staffPersonIds: string[]) {
  return getReviewAggregates(db.staffReview, "staffPersonId", staffPersonIds);
}

export async function listStaffReviews(staffPersonId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [reviews, total] = await Promise.all([
    db.staffReview.findMany({
      where: { staffPersonId, isHidden: false },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.staffReview.count({ where: { staffPersonId, isHidden: false } }),
  ]);
  return { reviews, total, page, pageSize };
}

export async function searchStaffPersons(query: string) {
  const trimmed = query.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length >= 10) {
    return db.staffPerson.findMany({
      where: { phone: digits.slice(-10) },
      include: {
        associations: {
          where: activeAssociationWhere,
          include: { unit: { select: { unitNumber: true } } },
        },
      },
      take: 10,
    });
  }

  if (trimmed.length < 2) return [];

  return db.staffPerson.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    include: {
      associations: {
        where: activeAssociationWhere,
        include: { unit: { select: { unitNumber: true } } },
      },
    },
    take: 20,
  });
}

export async function getStaffProfile(staffPersonId: string) {
  return db.staffPerson.findUnique({
    where: { id: staffPersonId },
    include: {
      associations: {
        include: { unit: { select: { unitNumber: true, block: true } } },
        orderBy: { startDate: "desc" },
      },
    },
  });
}

export async function countActiveUnitAssociations(staffPersonId: string) {
  return db.staffAssociation.count({
    where: {
      staffPersonId,
      scope: "UNIT",
      ...activeAssociationWhere,
    },
  });
}

export async function createStaffWithAssociation(input: {
  name: string;
  phone: string;
  role: StaffRole;
  scope: StaffScope;
  unitId: string | null;
  recurrenceDays: string[];
  registeredById: string;
  startDate?: Date;
}) {
  const phone = input.phone.replace(/\D/g, "").slice(-10);
  if (phone.length < 10) throw new Error("Phone must be at least 10 digits");

  if (isSocietyStaffRole(input.role)) {
    if (input.scope !== "SOCIETY" || input.unitId) {
      throw new Error("This role is society-wide and cannot be linked to a unit");
    }
  } else if (input.scope === "UNIT" && !input.unitId) {
    throw new Error("Unit is required for this staff role");
  }

  const existingPerson = await db.staffPerson.findUnique({ where: { phone } });
  if (existingPerson) {
    const activeCount = await countActiveUnitAssociations(existingPerson.id);
    if (activeCount >= MAX_ACTIVE_UNIT_ASSOCIATIONS) {
      throw new Error("This staff person has reached the maximum number of unit associations");
    }
  }

  return db.$transaction(async (tx) => {
    let person = await tx.staffPerson.findUnique({ where: { phone } });
    if (!person) {
      person = await tx.staffPerson.create({
        data: { name: input.name.trim(), phone },
      });
    }

    if (input.scope === "UNIT" && input.unitId) {
      const existing = await tx.staffAssociation.findFirst({
        where: {
          staffPersonId: person.id,
          unitId: input.unitId,
          ...activeAssociationWhere,
        },
      });
      if (existing) throw new Error("Staff is already associated with this unit");
    }

    const association = await tx.staffAssociation.create({
      data: {
        staffPersonId: person.id,
        scope: input.scope,
        unitId: input.unitId,
        role: input.role,
        recurrenceDays: input.recurrenceDays,
        registeredById: input.registeredById,
        startDate: input.startDate ?? new Date(),
        status: "ACTIVE",
      },
      include: { unit: { select: { unitNumber: true } } },
    });

    return { person, association };
  });
}

export async function addStaffAssociation(input: {
  staffPersonId: string;
  role: StaffRole;
  unitId: string;
  recurrenceDays: string[];
  registeredById: string;
  startDate?: Date;
}) {
  if (isSocietyStaffRole(input.role)) {
    throw new Error("This role is society-wide and cannot be linked to a unit");
  }

  const activeCount = await countActiveUnitAssociations(input.staffPersonId);
  if (activeCount >= MAX_ACTIVE_UNIT_ASSOCIATIONS) {
    throw new Error("Maximum unit associations reached for this staff person");
  }

  const existing = await db.staffAssociation.findFirst({
    where: {
      staffPersonId: input.staffPersonId,
      unitId: input.unitId,
      ...activeAssociationWhere,
    },
  });
  if (existing) throw new Error("Staff is already associated with this unit");

  return db.staffAssociation.create({
    data: {
      staffPersonId: input.staffPersonId,
      scope: "UNIT",
      unitId: input.unitId,
      role: input.role,
      recurrenceDays: input.recurrenceDays,
      registeredById: input.registeredById,
      startDate: input.startDate ?? new Date(),
      status: "ACTIVE",
    },
    include: { unit: { select: { unitNumber: true } } },
  });
}

export async function endStaffAssociation(associationId: string) {
  return db.staffAssociation.update({
    where: { id: associationId },
    data: { status: "ENDED", endDate: new Date() },
  });
}

export async function getStaffForUnits(unitIds: string[]) {
  if (unitIds.length === 0) return [];

  return db.staffAssociation.findMany({
    where: {
      unitId: { in: unitIds },
      ...activeAssociationWhere,
    },
    include: {
      staffPerson: true,
      unit: { select: { unitNumber: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAllActiveStaff() {
  return db.staffAssociation.findMany({
    where: activeAssociationWhere,
    include: {
      staffPerson: true,
      unit: { select: { unitNumber: true } },
    },
    orderBy: [{ staffPerson: { name: "asc" } }, { updatedAt: "desc" }],
  });
}

export async function getStaffListForCaller(userId: string) {
  const associations = await getAllActiveStaff();
  const aggregates = await getStaffReviewAggregates(
    [...new Set(associations.map((a) => a.staffPersonId))],
  );

  const callerUnitIds = await getCallerUnitIds(userId);
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
          ? await canManageStaffAssociation(userId, a.unitId)
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

  return { staff, callerUnitIds };
}
