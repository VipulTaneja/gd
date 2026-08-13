import { db } from "@/lib/db";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import { isTowerCommunity } from "@/lib/tower-communities";

export async function getUserCommunityIds(userId: string): Promise<string[]> {
  const memberships = await db.communityMembership.findMany({
    where: { userId },
    select: { subCommunityId: true },
  });
  return memberships.map((m) => m.subCommunityId);
}

export async function getUserTowerBlock(userId: string): Promise<string | null> {
  const membership = await db.unitMembership.findFirst({
    where: {
      userId,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    select: { unit: { select: { block: true } } },
  });
  return membership?.unit.block ?? null;
}

export async function canApproveJoinRequest(
  userId: string,
  subCommunityId: string,
): Promise<boolean> {
  const community = await db.subCommunity.findUnique({
    where: { id: subCommunityId },
    select: { targetBlock: true, isArchived: true },
  });
  if (!community || community.isArchived) return false;
  if (isTowerCommunity(community)) {
    return isAdmin(userId);
  }
  if (await isAdmin(userId)) return true;
  return isCommunityLeader(userId, subCommunityId);
}

export async function assertCanApproveJoinRequest(userId: string, subCommunityId: string) {
  if (!(await canApproveJoinRequest(userId, subCommunityId))) {
    throw new Error("Forbidden");
  }
}

export async function canCreateScopedNotice(
  userId: string,
  subCommunityId: string,
  priority: string,
): Promise<boolean> {
  if (priority === "EMERGENCY") return isAdmin(userId);
  if (!(await isAdmin(userId))) {
    return isCommunityLeader(userId, subCommunityId);
  }
  return true;
}

export async function canCreateGlobalNotice(userId: string): Promise<boolean> {
  return isAdmin(userId);
}

export async function canCreateScopedEventOrPoll(
  userId: string,
  subCommunityId: string,
): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  return isCommunityLeader(userId, subCommunityId);
}

export async function canCreateGlobalEventOrPoll(userId: string): Promise<boolean> {
  if (await isAdmin(userId)) return true;
  // Community leaders may also post society-wide events/polls (chosen explicitly).
  const leader = await db.communityMembership.findFirst({
    where: { userId, role: "ADMIN" },
    select: { id: true },
  });
  return !!leader;
}

export async function getCommunityLeaderUserIds(subCommunityId: string): Promise<string[]> {
  const leaders = await db.communityMembership.findMany({
    where: { subCommunityId, role: "ADMIN" },
    select: { userId: true },
  });
  return leaders.map((l) => l.userId);
}

export async function getCommunityMemberUserIds(subCommunityId: string): Promise<string[]> {
  const members = await db.communityMembership.findMany({
    where: { subCommunityId },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

export async function buildNoticeVisibilityFilter(userId: string) {
  const [communityIds, userTower] = await Promise.all([
    getUserCommunityIds(userId),
    getUserTowerBlock(userId),
  ]);

  return {
    AND: [
      { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      {
        OR: [
          { subCommunityId: null, targetBlock: null },
          ...(userTower ? [{ subCommunityId: null, targetBlock: userTower }] : []),
          ...(communityIds.length > 0
            ? [{ subCommunityId: { in: communityIds } }]
            : []),
        ],
      },
    ],
  };
}

export async function buildSubCommunityContentFilter(userId: string) {
  const communityIds = await getUserCommunityIds(userId);

  return {
    OR: [
      { scope: "GLOBAL" as const, subCommunityId: null },
      ...(communityIds.length > 0
        ? [{ scope: "SUB_COMMUNITY" as const, subCommunityId: { in: communityIds } }]
        : []),
    ],
  };
}

export async function assertCanRemoveCommunityMember(
  actorId: string,
  communityId: string,
  targetUserId: string,
): Promise<{ role: "ADMIN" | "MEMBER" }> {
  const community = await db.subCommunity.findUnique({
    where: { id: communityId },
    select: { targetBlock: true },
  });
  if (!community) throw new Error("Community not found");

  const membership = await db.communityMembership.findUnique({
    where: { userId_subCommunityId: { userId: targetUserId, subCommunityId: communityId } },
    select: { role: true },
  });
  if (!membership) throw new Error("Member not found");

  if (await isAdmin(actorId)) {
    if (isTowerCommunity(community) && membership.role === "MEMBER") {
      throw new Error("Tower residents are auto-enrolled. Remove their unit membership instead.");
    }
    return { role: membership.role };
  }

  if (isTowerCommunity(community)) {
    throw new Error("Forbidden");
  }

  if (!(await isCommunityLeader(actorId, communityId))) {
    throw new Error("Forbidden");
  }

  if (membership.role !== "MEMBER") {
    throw new Error("Community leaders can only remove regular members");
  }

  return { role: membership.role };
}
