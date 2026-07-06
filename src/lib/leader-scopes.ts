import { db } from "@/lib/db";

export interface LeaderScopes {
  ledUnitId: string | null;
  ledUnitNumber: string | null;
  communityLeaderIds: string[];
  amenityLeaderFacilityIds: string[];
}

export async function getLeaderScopes(userId: string): Promise<LeaderScopes> {
  const [ledUnit, communityLeaders, amenityLeaders] = await Promise.all([
    db.unit.findFirst({
      where: { leaderUserId: userId },
      select: { id: true, unitNumber: true },
    }),
    db.communityMembership.findMany({
      where: { userId, role: "ADMIN" },
      select: { subCommunityId: true },
    }),
    db.facilityLeader.findMany({
      where: { userId },
      select: { facilityId: true },
    }),
  ]);

  return {
    ledUnitId: ledUnit?.id ?? null,
    ledUnitNumber: ledUnit?.unitNumber ?? null,
    communityLeaderIds: communityLeaders.map((c) => c.subCommunityId),
    amenityLeaderFacilityIds: amenityLeaders.map((a) => a.facilityId),
  };
}

export function hasAnyLeaderScope(scopes: LeaderScopes): boolean {
  return (
    !!scopes.ledUnitId ||
    scopes.communityLeaderIds.length > 0 ||
    scopes.amenityLeaderFacilityIds.length > 0
  );
}
