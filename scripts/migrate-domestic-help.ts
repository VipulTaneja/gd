/**
 * STAFF-011: Migrate DomesticHelp rows to StaffPerson + StaffAssociation
 * Run: npx tsx scripts/migrate-domestic-help.ts
 */
import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

config({ path: ".env.local", override: false });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const HELP_TYPE_MAP: Record<string, string> = {
  MAID: "MAID",
  HOUSEKEEPING: "MAID",
  COOK: "COOK",
  DRIVER: "DRIVER",
  GUARD: "GUARD",
  GARDENER: "GARDENER",
  OTHER: "OTHER",
};

const SOCIETY_ROLES = new Set(["GUARD", "FACILITY", "ELECTRICIAN", "PLUMBER"]);

async function main() {
  const helps = await db.domesticHelp.findMany({
    where: { status: "ACTIVE" },
    include: { unit: true },
  });

  let migrated = 0;
  for (const help of helps) {
    const phone = (help.phone ?? `unknown-${help.id}`).replace(/\D/g, "").slice(-10) || `9${help.id.slice(0, 9)}`;
    const roleKey = (HELP_TYPE_MAP[help.helpType.toUpperCase()] ?? "OTHER");
    const role = roleKey as "MAID" | "COOK" | "DRIVER" | "GUARD" | "GARDENER" | "OTHER";

    let person = await db.staffPerson.findUnique({ where: { phone } });
    if (!person) {
      person = await db.staffPerson.create({
        data: {
          name: help.name,
          phone,
          photoUrl: help.photoUrl,
        },
      });
    }

    const exists = await db.staffAssociation.findFirst({
      where: {
        staffPersonId: person.id,
        unitId: help.unitId,
        status: "ACTIVE",
      },
    });
    if (exists) continue;

    await db.staffAssociation.create({
      data: {
        staffPersonId: person.id,
        scope: SOCIETY_ROLES.has(role) ? "SOCIETY" : "UNIT",
        unitId: SOCIETY_ROLES.has(role) ? null : help.unitId,
        role,
        recurrenceDays: help.recurrenceDays.length ? help.recurrenceDays : ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        registeredById: help.createdById,
        startDate: help.validFrom,
        endDate: help.validUntil,
        status: help.status === "REVOKED" ? "ENDED" : "ACTIVE",
      },
    });
    migrated++;
  }

  console.log(`Migrated ${migrated} domestic help associations`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
