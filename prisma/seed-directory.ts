import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";
import path from "path";
import { randomBytes } from "crypto";

function cuid(): string {
  const cId = "c" + randomBytes(10).toString("base64url").slice(0, 24);
  return cId;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface ResidentRow {
  T: string;
  Unit: string;
  Status: string;
  Owner: string;
  Name: string;
  "Organization Name": string;
  Email: string;
  "Phone 1": string;
  "Rented To": string;
  "Legal Owner": string;
}

function cleanPhone(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+]/g, "").trim();
  if (!cleaned || cleaned === "91" || cleaned.length < 5) return null;
  return cleaned.startsWith("+") ? cleaned : cleaned.startsWith("91") && cleaned.length > 10 ? cleaned : cleaned;
}

function cleanEmail(email: string): string | null {
  if (!email) return null;
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || !cleaned.includes("@")) return null;
  return cleaned;
}

function normalizeUnitNumber(tower: string, unit: string): string {
  const unitNum = unit.toString().padStart(4, "0");
  return `${tower}-${unitNum}`;
}

/** URL-safe slug for synthetic email local parts */
function slugifyForEmail(text: string, maxLen = 48): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (slug || "resident").slice(0, maxLen);
}

function placeholderEmail(unitNumber: string, name: string): string {
  return `noemail-${unitNumber.toLowerCase()}-${slugifyForEmail(name)}@gulshandynasty.local`;
}

function resolveUserIdentity(
  unitNumber: string,
  name: string,
  email: string | null,
  phone: string | null,
): { userKey: string; email: string; usedPlaceholder: boolean } {
  if (email) {
    return { userKey: email, email, usedPlaceholder: false };
  }
  if (phone) {
    return {
      userKey: phone,
      email: `noemail-${phone.replace(/[^0-9+]/g, "")}@gulshandynasty.local`,
      usedPlaceholder: false,
    };
  }
  const synthetic = placeholderEmail(unitNumber, name);
  return {
    userKey: `placeholder:${unitNumber}:${slugifyForEmail(name)}`,
    email: synthetic,
    usedPlaceholder: true,
  };
}

async function main() {
  console.log("🏢 Seeding Gulshan Dynasty Directory...\n");

  const filePath = path.join(process.cwd(), "Gulshan Dynasty Directory.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<ResidentRow>(sheet);

  console.log(`📊 Found ${data.length} rows in Excel file\n`);

  // Phase 1: Collect all unique users and units
  const usersMap = new Map<string, { name: string; email: string; phone: string | null; organization: string | null }>();
  const unitsMap = new Map<string, { unitNumber: string; block: string; floor: number }>();
  const membershipsList: Array<{ userKey: string; unitNumber: string; role: string; isPrimary: boolean }> = [];

  let skippedCount = 0;
  let placeholderCount = 0;

  for (const row of data) {
    const tower = row.T?.toString().trim();
    const unitNum = row.Unit?.toString().trim();
    const name = row.Name?.toString().trim();
    const email = cleanEmail(row.Email);
    const phone = cleanPhone(row["Phone 1"]);
    const orgName = row["Organization Name"]?.toString().trim() || null;
    const roleStr = row.Owner?.toString().trim().toUpperCase() || "OWNER";
    const legalOwner = row["Legal Owner"]?.toString().trim() || null;

    if (!tower || !unitNum || !name) {
      skippedCount++;
      continue;
    }

    const unitNumber = normalizeUnitNumber(tower, unitNum);
    const identity = resolveUserIdentity(unitNumber, name, email, phone);
    if (identity.usedPlaceholder) placeholderCount++;

    const userKey = identity.userKey;

    if (!usersMap.has(userKey)) {
      usersMap.set(userKey, {
        name,
        email: identity.email,
        phone,
        organization: orgName,
      });
    }

    if (!unitsMap.has(unitNumber)) {
      unitsMap.set(unitNumber, {
        unitNumber,
        block: tower,
        floor: parseInt(unitNum.substring(0, 2)) || 1,
      });
    }

    let membershipRole = "OWNER";
    if (roleStr === "TENANT") membershipRole = "TENANT";
    else if (roleStr === "JOINT_OWNER") membershipRole = "JOINT_OWNER";
    else if (legalOwner && legalOwner !== name) membershipRole = "OWNER_FAMILY";

    membershipsList.push({
      userKey,
      unitNumber,
      role: membershipRole,
      isPrimary: roleStr === "OWNER" && !legalOwner,
    });
  }

  console.log(`📋 Collected: ${usersMap.size} users, ${unitsMap.size} units, ${membershipsList.length} memberships\n`);

  // Phase 2: Bulk insert users using raw SQL
  console.log("👤 Creating users...");
  const userEntries = Array.from(usersMap.entries());

  // Batch users in groups of 50
  for (let i = 0; i < userEntries.length; i += 50) {
    const batch = userEntries.slice(i, i + 50);
    const values = batch.map(([, u]) => {
      const id = cuid();
      return `('${id}', '${u.email.replace(/'/g, "''")}', '${u.name.replace(/'/g, "''")}', ${u.phone ? `'${u.phone}'` : "NULL"}, ${u.organization ? `'${u.organization.replace(/'/g, "''")}'` : "NULL"}, 'RESIDENT', 'APPROVED', true, now(), now())`;
    }).join(",\n    ");

    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, email, name, phone, organization, "globalRole", "approvalStatus", "isActive", "createdAt", "updatedAt")
      VALUES ${values}
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        "updatedAt" = now()
    `);
    process.stdout.write(`   ${Math.min(i + 50, userEntries.length)}/${userEntries.length}\r`);
  }
  console.log(`\n   ✅ ${userEntries.length} users created/updated`);

  // Phase 3: Bulk insert units using raw SQL
  console.log("\n🏠 Creating units...");
  const unitEntries = Array.from(unitsMap.entries());

  for (let i = 0; i < unitEntries.length; i += 50) {
    const batch = unitEntries.slice(i, i + 50);
    const values = batch.map(([, u]) => {
      const id = cuid();
      return `('${id}', '${u.unitNumber}', '${u.block}', ${u.floor}, 'APARTMENT', now())`;
    }).join(",\n    ");

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Unit" (id, "unitNumber", block, floor, "unitType", "createdAt")
      VALUES ${values}
      ON CONFLICT ("unitNumber") DO NOTHING
    `);
    process.stdout.write(`   ${Math.min(i + 50, unitEntries.length)}/${unitEntries.length}\r`);
  }
  console.log(`\n   ✅ ${unitEntries.length} units created`);

  // Phase 4: Bulk insert memberships using raw SQL
  console.log("\n🔗 Creating memberships...");

  // Get user and unit IDs
  const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
  const userIdMap = new Map(allUsers.map(u => [u.email, u.id]));

  const allUnits = await prisma.unit.findMany({ select: { id: true, unitNumber: true } });
  const unitIdMap = new Map(allUnits.map(u => [u.unitNumber, u.id]));

  // Get existing memberships
  const existingMemberships = await prisma.unitMembership.findMany({
    select: { userId: true, unitId: true, role: true }
  });
  const existingSet = new Set(
    existingMemberships.map(m => `${m.userId}-${m.unitId}-${m.role}`)
  );

  let membershipCount = 0;
  const membershipBatch: Array<{ userId: string; unitId: string; role: string; isPrimary: boolean }> = [];

  for (const m of membershipsList) {
    const user = usersMap.get(m.userKey);
    const userId = user ? userIdMap.get(user.email) : null;
    const unitId = unitIdMap.get(m.unitNumber);

    if (!userId || !unitId) continue;

    const key = `${userId}-${unitId}-${m.role}`;
    if (existingSet.has(key)) continue;

    membershipBatch.push({ userId, unitId, role: m.role, isPrimary: m.isPrimary });
    existingSet.add(key);
  }

  // Batch insert memberships
  for (let i = 0; i < membershipBatch.length; i += 50) {
    const batch = membershipBatch.slice(i, i + 50);
    const values = batch.map(m => {
      const id = cuid();
      return `('${id}', '${m.userId}', '${m.unitId}', '${m.role}', '2024-01-01T00:00:00.000Z', ${m.isPrimary}, now(), now())`;
    }).join(",\n    ");

    await prisma.$executeRawUnsafe(`
      INSERT INTO "UnitMembership" (id, "userId", "unitId", role, "startDate", "isPrimary", "createdAt", "updatedAt")
      VALUES ${values}
      ON CONFLICT ("userId", "unitId", role, "startDate") DO NOTHING
    `);
    membershipCount += batch.length;
    process.stdout.write(`   ${Math.min(i + 50, membershipBatch.length)}/${membershipBatch.length}\r`);
  }
  console.log(`\n   ✅ ${membershipCount} memberships created`);

  console.log("\n📊 Summary:");
  console.log(`   Users: ${userEntries.length}`);
  console.log(`   Units: ${unitEntries.length}`);
  console.log(`   Memberships: ${membershipCount}`);
  console.log(`   Rows skipped (missing T/Unit/Name): ${skippedCount}`);
  console.log(`   Placeholder emails (no contact in sheet): ${placeholderCount}`);
  console.log("\n🎉 Directory seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
