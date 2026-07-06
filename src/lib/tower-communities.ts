import { db } from "@/lib/db";
import { UNIT_TOWERS, type Tower } from "@/lib/constants";
import type { PrismaClient } from "@/generated/prisma/client";

type DbClient = Pick<
  PrismaClient,
  "subCommunity" | "unitMembership" | "communityMembership" | "user"
>;

const activeUnitMembershipWhere = {
  OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
};

export const TOWER_COMMUNITY_NAMES: Record<Tower, string> = {
  A: "Tower A Residents",
  B: "Tower B Residents",
  C: "Tower C Residents",
};

export const TOWER_COMMUNITY_DESCRIPTIONS: Record<Tower, string> = {
  A: "Official group for all Tower A residents — maintenance updates, shared concerns, and social events.",
  B: "Official group for all Tower B residents — stay connected with your tower neighbours.",
  C: "Official group for all Tower C residents — announcements and community discussions.",
};

export async function getResidentUserIdsForTower(
  block: string,
  client: DbClient = db,
): Promise<string[]> {
  const memberships = await client.unitMembership.findMany({
    where: {
      ...activeUnitMembershipWhere,
      unit: { block },
      user: { isActive: true, approvalStatus: "APPROVED" },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  return memberships.map((m) => m.userId);
}

export async function syncTowerCommunityMemberships(
  subCommunityId: string,
  client: DbClient = db,
): Promise<{ added: number; removed: number }> {
  const community = await client.subCommunity.findUnique({
    where: { id: subCommunityId },
    select: { id: true, targetBlock: true },
  });

  if (!community?.targetBlock) {
    return { added: 0, removed: 0 };
  }

  const eligibleUserIds = await getResidentUserIdsForTower(community.targetBlock, client);
  const eligibleSet = new Set(eligibleUserIds);

  const existing = await client.communityMembership.findMany({
    where: { subCommunityId },
    select: { userId: true, role: true },
  });
  const existingUserIds = new Set(existing.map((e) => e.userId));

  const toAdd = eligibleUserIds.filter((id) => !existingUserIds.has(id));
  const toRemove = existing
    .filter((e) => e.role === "MEMBER" && !eligibleSet.has(e.userId))
    .map((e) => e.userId);

  if (toAdd.length > 0) {
    await client.communityMembership.createMany({
      data: toAdd.map((userId) => ({
        userId,
        subCommunityId,
        role: "MEMBER" as const,
      })),
      skipDuplicates: true,
    });
  }

  if (toRemove.length > 0) {
    await client.communityMembership.deleteMany({
      where: {
        subCommunityId,
        userId: { in: toRemove },
        role: "MEMBER",
      },
    });
  }

  return { added: toAdd.length, removed: toRemove.length };
}

export async function syncTowerCommunitiesForUser(
  userId: string,
  client: DbClient = db,
): Promise<void> {
  const userMemberships = await client.unitMembership.findMany({
    where: {
      userId,
      ...activeUnitMembershipWhere,
    },
    select: { unit: { select: { block: true } } },
  });

  const blocks = [...new Set(userMemberships.map((m) => m.unit.block))];

  const towerCommunities = await client.subCommunity.findMany({
    where: { targetBlock: { not: null }, isArchived: false },
    select: { id: true, targetBlock: true },
  });

  for (const community of towerCommunities) {
    const block = community.targetBlock;
    if (!block) continue;

    if (blocks.includes(block)) {
      await client.communityMembership.upsert({
        where: {
          userId_subCommunityId: { userId, subCommunityId: community.id },
        },
        update: {},
        create: { userId, subCommunityId: community.id, role: "MEMBER" },
      });
    } else {
      await client.communityMembership.deleteMany({
        where: { userId, subCommunityId: community.id, role: "MEMBER" },
      });
    }
  }
}

export async function syncAllTowerCommunities(
  client: DbClient = db,
): Promise<Array<{ id: string; name: string; targetBlock: string | null; added: number; removed: number }>> {
  const communities = await client.subCommunity.findMany({
    where: { targetBlock: { not: null }, isArchived: false },
    select: { id: true, name: true, targetBlock: true },
  });

  const results = [];
  for (const community of communities) {
    const stats = await syncTowerCommunityMemberships(community.id, client);
    results.push({ ...community, ...stats });
  }
  return results;
}

export async function ensureTowerCommunitiesExist(client: DbClient = db): Promise<void> {
  for (const block of UNIT_TOWERS) {
    await client.subCommunity.upsert({
      where: { name: TOWER_COMMUNITY_NAMES[block] },
      update: {
        targetBlock: block,
        description: TOWER_COMMUNITY_DESCRIPTIONS[block],
      },
      create: {
        name: TOWER_COMMUNITY_NAMES[block],
        description: TOWER_COMMUNITY_DESCRIPTIONS[block],
        targetBlock: block,
      },
    });
  }
}

export function isTowerCommunity(community: { targetBlock: string | null }): boolean {
  return community.targetBlock != null;
}
