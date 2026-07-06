import { db } from "@/lib/db";

export async function generateRecurringPasses() {
  const today = new Date();
  const dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][today.getDay()];

  const activeHelps = await db.domesticHelp.findMany({
    where: {
      status: "ACTIVE",
      recurrenceDays: { has: dayName },
    },
    include: { unit: true },
  });

  let created = 0;

  for (const help of activeHelps) {
    const existingPass = await db.visitorPass.findFirst({
      where: {
        userId: help.userId,
        unitId: help.unitId,
        visitorName: help.name,
        visitorType: "DAILY_HELP",
        validFrom: { lte: today },
        validUntil: { gte: today },
        status: "ACTIVE",
      },
    });

    if (existingPass) continue;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const startOfDay = new Date(today);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(20, 0, 0, 0);

    await db.visitorPass.create({
      data: {
        userId: help.userId,
        unitId: help.unitId,
        visitorName: help.name,
        visitorPhone: help.phone,
        visitorType: "DAILY_HELP",
        otp,
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
