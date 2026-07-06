import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ensureTowerCommunitiesExist,
  syncAllTowerCommunities,
} from "../src/lib/tower-communities";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Ensuring tower communities exist...");
  await ensureTowerCommunitiesExist(prisma);

  console.log("Syncing tower community memberships...");
  const results = await syncAllTowerCommunities(prisma);
  for (const result of results) {
    console.log(`  ${result.name}: +${result.added} added, -${result.removed} removed`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
