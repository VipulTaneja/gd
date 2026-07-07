/**
 * Seed StaffPerson + StaffAssociation — 5 staff per StaffRole type (50 total).
 * Also ensures dev unit memberships so residents can see staff on /staff.
 *
 * Run: npm run db:seed:staff
 */
import "dotenv/config";
import { config } from "dotenv";
import {
  PrismaClient,
  type StaffRole,
  type StaffScope,
  type UnitRole,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local", override: false });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_PHONE_PREFIX = "91000";

/** Dev residents from seed.ts — must have unit memberships to see staff in the Help tab. */
const DEV_RESIDENTS: { email: string; unitNumber: string; role: UnitRole }[] = [
  { email: "noemail-919891777078@gulshandynasty.local", unitNumber: "C-1702", role: "OWNER" },
  { email: "admin+dev-setup-secret@gulshandynasty.com", unitNumber: "C-1702", role: "OWNER" },
  { email: "rajesh@example.com", unitNumber: "A-0101", role: "OWNER" },
  { email: "priya@example.com", unitNumber: "A-0101", role: "OWNER" },
  { email: "amit@example.com", unitNumber: "B-1201", role: "OWNER" },
  { email: "noemail-919811278448@gulshandynasty.local", unitNumber: "C-0301", role: "OWNER" },
  { email: "noemail-919560928800@gulshandynasty.local", unitNumber: "A-2502", role: "OWNER" },
  { email: "noemail-919811111372@gulshandynasty.local", unitNumber: "C-0201", role: "OWNER" },
];

const UNIT_DEMO_ROLES: StaffRole[] = [
  "MAID",
  "NANNY",
  "COOK",
  "DRIVER",
  "GARDENER",
  "OTHER",
];

type RoleSeed = {
  role: StaffRole;
  scope: StaffScope;
  recurrenceDays: string[];
  names: [string, string, string, string, string];
};

const ROLE_SEEDS: RoleSeed[] = [
  {
    role: "MAID",
    scope: "UNIT",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"],
    names: ["Kamla Devi", "Sushila Bai", "Geeta Sharma", "Phoolwati", "Radha Kumari"],
  },
  {
    role: "NANNY",
    scope: "UNIT",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    names: ["Priya Nanny", "Anjali Devi", "Meena Rani", "Savitri Bai", "Kavita Singh"],
  },
  {
    role: "COOK",
    scope: "UNIT",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"],
    names: ["Sunita Bai", "Ram Pyari", "Lakshmi Devi", "Usha Rani", "Manju Devi"],
  },
  {
    role: "DRIVER",
    scope: "UNIT",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
    names: ["Rakesh Yadav", "Suresh Kumar", "Mohan Lal", "Vijay Singh", "Ashok Prasad"],
  },
  {
    role: "GARDENER",
    scope: "UNIT",
    recurrenceDays: ["TUE", "SAT"],
    names: ["Shivprasad", "Surjeet Maali", "Gopal Singh", "Bharat Lal", "Ram Kishan"],
  },
  {
    role: "GUARD",
    scope: "SOCIETY",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    names: ["Suraj Singh", "Ramesh Guard", "Vikram Pal", "Sunil Yadav", "Ajay Kumar"],
  },
  {
    role: "FACILITY",
    scope: "SOCIETY",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"],
    names: ["Chetan Sirohi", "Vikas Gupta", "Raju Maintenance", "Sanjay Facility", "Pradeep Mehta"],
  },
  {
    role: "ELECTRICIAN",
    scope: "SOCIETY",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"],
    names: ["Rajesh Electrician", "Amit Vij", "Sunil Wireman", "Pawan Kumar", "Dinesh Electrical"],
  },
  {
    role: "PLUMBER",
    scope: "SOCIETY",
    recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"],
    names: ["Ravi Plumber", "Sanjay Pipefit", "Mukesh Nal", "Harish Plumber", "Ganesh Pipe"],
  },
  {
    role: "OTHER",
    scope: "UNIT",
    recurrenceDays: ["MON", "WED", "FRI"],
    names: ["Ram Avatar Cleaner", "Sher Bahadur", "Parmeshwar", "Satyaveer", "Gaurang Das"],
  },
];

function seedPhone(roleIndex: number, personIndex: number): string {
  const suffix = String(roleIndex * 100 + personIndex).padStart(6, "0");
  return `9100${suffix}`;
}

function roleSpec(role: StaffRole): RoleSeed {
  const spec = ROLE_SEEDS.find((r) => r.role === role);
  if (!spec) throw new Error(`Missing role spec: ${role}`);
  return spec;
}

const SOCIETY_STAFF_ROLES: StaffRole[] = ["GUARD", "FACILITY", "ELECTRICIAN", "PLUMBER"];

/** Fix existing DB rows: society roles must not be unit-scoped. */
async function migrateSocietyStaffAssociations(): Promise<number> {
  const wrong = await prisma.staffAssociation.findMany({
    where: {
      role: { in: SOCIETY_STAFF_ROLES },
      status: "ACTIVE",
      OR: [{ scope: "UNIT" }, { unitId: { not: null } }],
    },
  });

  let fixed = 0;
  for (const assoc of wrong) {
    const societyExists = await prisma.staffAssociation.findFirst({
      where: {
        staffPersonId: assoc.staffPersonId,
        role: assoc.role,
        scope: "SOCIETY",
        status: "ACTIVE",
        id: { not: assoc.id },
      },
    });

    if (societyExists) {
      await prisma.staffAssociation.update({
        where: { id: assoc.id },
        data: { status: "ENDED", endDate: new Date() },
      });
    } else {
      await prisma.staffAssociation.update({
        where: { id: assoc.id },
        data: { scope: "SOCIETY", unitId: null },
      });
    }
    fixed++;
  }

  return fixed;
}

async function ensureDevMemberships(): Promise<number> {
  let created = 0;
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  for (const { email, unitNumber, role } of DEV_RESIDENTS) {
    const user = await prisma.user.findUnique({ where: { email } });
    const unit = await prisma.unit.findUnique({ where: { unitNumber } });
    if (!user || !unit) continue;

    const existing = await prisma.unitMembership.findFirst({
      where: {
        userId: user.id,
        unitId: unit.id,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
    });
    if (existing) continue;

    await prisma.unitMembership.create({
      data: {
        userId: user.id,
        unitId: unit.id,
        role,
        startDate,
        isPrimary: true,
      },
    });
    created++;
  }

  return created;
}

async function ensureDevUnitStaff(registrarId: string): Promise<number> {
  const devUnits = await prisma.unit.findMany({
    where: { unitNumber: { in: DEV_RESIDENTS.map((r) => r.unitNumber) } },
    orderBy: { unitNumber: "asc" },
  });

  let added = 0;

  for (let unitIdx = 0; unitIdx < devUnits.length; unitIdx++) {
    const unit = devUnits[unitIdx];
    const personIdx = (unitIdx % 5) + 1;

    for (const role of UNIT_DEMO_ROLES) {
      const roleIdx = ROLE_SEEDS.findIndex((r) => r.role === role);
      const phone = seedPhone(roleIdx + 1, personIdx);
      const person = await prisma.staffPerson.findUnique({ where: { phone } });
      if (!person) continue;

      const existing = await prisma.staffAssociation.findFirst({
        where: {
          staffPersonId: person.id,
          unitId: unit.id,
          status: "ACTIVE",
        },
      });
      if (existing) continue;

      const spec = roleSpec(role);
      await prisma.staffAssociation.create({
        data: {
          staffPersonId: person.id,
          scope: "UNIT",
          unitId: unit.id,
          role,
          recurrenceDays: spec.recurrenceDays,
          registeredById: registrarId,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
        },
      });
      added++;
    }
  }

  return added;
}

async function main() {
  console.log("🌱 Seeding staff registry (5 per role)...\n");

  const registrar = await prisma.user.findFirst({
    where: { approvalStatus: "APPROVED", isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!registrar) {
    console.error("❌ No approved user found. Run npm run db:seed:dev first.");
    process.exit(1);
  }

  const membershipsAdded = await ensureDevMemberships();
  console.log(
    membershipsAdded > 0
      ? `   ✅ ${membershipsAdded} dev unit memberships created`
      : "   ✅ Dev unit memberships already present",
  );

  const societyFixed = await migrateSocietyStaffAssociations();
  console.log(
    societyFixed > 0
      ? `   ✅ ${societyFixed} society-role associations corrected`
      : "   ✅ Society-role associations already correct",
  );

  const devUnits = await prisma.unit.findMany({
    where: { unitNumber: { in: DEV_RESIDENTS.map((r) => r.unitNumber) } },
    orderBy: { unitNumber: "asc" },
  });
  if (devUnits.length === 0) {
    console.error("❌ Dev units not found. Run npm run db:seed:dev first.");
    process.exit(1);
  }

  const existing = await prisma.staffPerson.count({
    where: { phone: { startsWith: SEED_PHONE_PREFIX } },
  });

  let created = 0;
  let associations = 0;
  let reviews = 0;

  if (existing < 50) {
    const reviewers = await prisma.user.findMany({
      where: { approvalStatus: "APPROVED", isActive: true },
      take: 8,
      select: { id: true },
    });

    let unitCursor = 0;

    for (let roleIdx = 0; roleIdx < ROLE_SEEDS.length; roleIdx++) {
      const spec = ROLE_SEEDS[roleIdx];

      for (let personIdx = 1; personIdx <= 5; personIdx++) {
        const phone = seedPhone(roleIdx + 1, personIdx);
        const name = spec.names[personIdx - 1];

        let person = await prisma.staffPerson.findUnique({ where: { phone } });
        if (!person) {
          person = await prisma.staffPerson.create({
            data: { name, phone },
          });
          created++;
        }

        const hasAssociation = await prisma.staffAssociation.findFirst({
          where: { staffPersonId: person.id, role: spec.role },
        });
        if (hasAssociation) continue;

        const unit =
          spec.scope === "UNIT" ? devUnits[unitCursor % devUnits.length] : null;
        if (spec.scope === "UNIT") unitCursor++;

        await prisma.staffAssociation.create({
          data: {
            staffPersonId: person.id,
            scope: spec.scope,
            unitId: unit?.id ?? null,
            role: spec.role,
            recurrenceDays: spec.recurrenceDays,
            registeredById: registrar.id,
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            status: "ACTIVE",
          },
        });
        associations++;

        if (personIdx <= 2 && reviewers.length > 0) {
          const reviewer = reviewers[(roleIdx + personIdx) % reviewers.length];
          const existingReview = await prisma.staffReview.findUnique({
            where: {
              staffPersonId_authorId: { staffPersonId: person.id, authorId: reviewer.id },
            },
          });
          if (!existingReview) {
            await prisma.staffReview.create({
              data: {
                staffPersonId: person.id,
                authorId: reviewer.id,
                rating: 3 + (personIdx % 3),
                comment:
                  personIdx === 1
                    ? "Reliable and punctual. Would recommend."
                    : "Good work overall.",
              },
            });
            reviews++;
          }
        }
      }

      console.log(`   ✅ ${spec.role}: 5 staff`);
    }
  } else {
    console.log(`   ⏭️  ${existing} seed staff persons already exist`);
  }

  const devStaffAdded = await ensureDevUnitStaff(registrar.id);
  console.log(
    devStaffAdded > 0
      ? `   ✅ ${devStaffAdded} staff linked to dev resident units`
      : "   ✅ Dev unit staff links already present",
  );

  const vipul = await prisma.user.findUnique({
    where: { email: DEV_RESIDENTS[0].email },
    include: {
      unitMemberships: {
        where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
        include: { unit: true },
      },
    },
  });
  const devAdmin = await prisma.user.findUnique({
    where: { email: "admin+dev-setup-secret@gulshandynasty.com" },
    include: {
      unitMemberships: {
        where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
        include: { unit: true },
      },
    },
  });
  const vipulUnitIds = vipul?.unitMemberships.map((m) => m.unitId) ?? [];
  const adminUnitIds = devAdmin?.unitMemberships.map((m) => m.unitId) ?? [];
  const visibleToVipul = await prisma.staffAssociation.count({
    where: { unitId: { in: vipulUnitIds }, status: "ACTIVE" },
  });
  const visibleToDevAdmin = await prisma.staffAssociation.count({
    where: { unitId: { in: adminUnitIds }, status: "ACTIVE" },
  });

  console.log(`\n🎉 Staff seed complete:`);
  if (created > 0) console.log(`   ${created} new StaffPerson records`);
  if (associations > 0) console.log(`   ${associations} associations created`);
  if (reviews > 0) console.log(`   ${reviews} sample reviews added`);
  console.log(`   Vipul (C-1702) can see ${visibleToVipul} staff in Regular help`);
  console.log(`   Dev Super Admin login can see ${visibleToDevAdmin} staff in Regular help`);
  console.log(`   Use Regular help at /staff — not Admin → Staff registry`);
  console.log(`   Registrar: ${registrar.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
