import crypto from "crypto";
import { db } from "@/lib/db";

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function todayWindow() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(8, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(20, 0, 0, 0);
  return { today, startOfDay, endOfDay };
}

export async function generateStaffPasses(): Promise<number> {
  const dayName = DAY_NAMES[new Date().getDay()];
  const { startOfDay, endOfDay } = todayWindow();

  const staffWithSchedule = await db.staffPerson.findMany({
    where: {
      associations: {
        some: {
          status: "ACTIVE",
          recurrenceDays: { has: dayName },
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
      },
    },
    include: {
      associations: {
        where: {
          status: "ACTIVE",
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
        orderBy: { startDate: "asc" },
      },
    },
  });

  let created = 0;

  for (const person of staffWithSchedule) {
    const scheduledToday = person.associations.some((a) => a.recurrenceDays.includes(dayName));
    if (!scheduledToday) continue;

    const existing = await db.visitorPass.findFirst({
      where: {
        staffPersonId: person.id,
        visitorType: "DAILY_HELP",
        validFrom: { lte: endOfDay },
        validUntil: { gte: startOfDay },
        status: "ACTIVE",
      },
    });
    if (existing) continue;

    const oldestAssoc = person.associations[0];
    if (!oldestAssoc) continue;

    await db.visitorPass.create({
      data: {
        userId: oldestAssoc.registeredById,
        unitId: oldestAssoc.unitId,
        staffPersonId: person.id,
        visitorName: person.name,
        visitorPhone: person.phone,
        visitorType: "DAILY_HELP",
        otp: generateOtp(),
        validFrom: startOfDay,
        validUntil: endOfDay,
        isRecurring: true,
        recurrenceDays: [dayName],
      },
    });
    created++;
  }

  return created;
}

export async function getTodayStaffPasses() {
  const { startOfDay, endOfDay } = todayWindow();

  const passes = await db.visitorPass.findMany({
    where: {
      visitorType: "DAILY_HELP",
      status: "ACTIVE",
      validFrom: { lte: endOfDay },
      validUntil: { gte: startOfDay },
    },
    include: {
      unit: { select: { unitNumber: true, block: true } },
      staffPerson: {
        include: {
          associations: {
            where: {
              status: "ACTIVE",
              OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
            },
            include: { unit: { select: { unitNumber: true, block: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return passes;
}

export async function resolveStaffDestinationUnits(staffPersonId: string) {
  return db.staffAssociation.findMany({
    where: {
      staffPersonId,
      status: "ACTIVE",
      scope: "UNIT",
      unitId: { not: null },
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: { unit: { select: { unitNumber: true, block: true } } },
  });
}
