"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import {
  syncAllTowerCommunities,
  syncTowerCommunityMemberships,
  syncTowerCommunitiesForUser,
  isTowerCommunity,
} from "@/lib/tower-communities";
import type { Tower } from "@/lib/constants";
import { UNIT_TOWERS } from "@/lib/constants";
import { requireSuperAdmin } from "@/lib/rbac-leaders";
import {
  assertCanApproveJoinRequest,
  assertCanRemoveCommunityMember,
} from "@/lib/community-leaders";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function createCommunity(data: {
  name: string;
  description: string;
  targetBlock?: string | null;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();
    if (data.targetBlock && !UNIT_TOWERS.includes(data.targetBlock as Tower)) {
      return { error: "Invalid tower block" };
    }

    const existing = await db.subCommunity.findUnique({ where: { name: data.name } });
    if (existing) return { error: "Community with this name already exists" };

    if (data.targetBlock) {
      const towerTaken = await db.subCommunity.findUnique({
        where: { targetBlock: data.targetBlock },
      });
      if (towerTaken) {
        return { error: `Tower ${data.targetBlock} already has an auto-membership community` };
      }
    }

    const community = await db.subCommunity.create({
      data: {
        name: data.name,
        description: data.description,
        targetBlock: data.targetBlock || null,
      },
    });
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.forum.create({
      data: {
        name: `${data.name} Discussions`,
        slug,
        scope: "SUB_COMMUNITY",
        subCommunityId: community.id,
      },
    });

    if (community.targetBlock) {
      await syncTowerCommunityMemberships(community.id);
    }

    await logAction(admin.id, "COMMUNITY_CREATED", "SubCommunity", community.id, { name: data.name });
    revalidatePath("/admin/communities");
    revalidatePath("/communities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create community" };
  }
}

export async function updateCommunity(
  id: string,
  data: { name: string; description: string; targetBlock?: string | null },
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (data.targetBlock && !UNIT_TOWERS.includes(data.targetBlock as Tower)) {
      return { error: "Invalid tower block" };
    }

    if (data.targetBlock) {
      const towerTaken = await db.subCommunity.findFirst({
        where: { targetBlock: data.targetBlock, NOT: { id } },
      });
      if (towerTaken) {
        return { error: `Tower ${data.targetBlock} already has an auto-membership community` };
      }
    }

    await db.subCommunity.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(data.targetBlock !== undefined ? { targetBlock: data.targetBlock || null } : {}),
      },
    });

    const updated = await db.subCommunity.findUnique({
      where: { id },
      select: { targetBlock: true },
    });
    if (updated?.targetBlock) {
      await syncTowerCommunityMemberships(id);
    }

    await logAction(admin.id, "COMMUNITY_UPDATED", "SubCommunity", id, { name: data.name });
    revalidatePath(`/admin/communities/${id}`);
    revalidatePath("/admin/communities");
    revalidatePath("/communities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update community" };
  }
}

export async function archiveCommunity(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();
    await db.subCommunity.update({ where: { id }, data: { isArchived: true } });
    await logAction(admin.id, "COMMUNITY_ARCHIVED", "SubCommunity", id);
    revalidatePath("/admin/communities");
    revalidatePath("/communities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to archive community" };
  }
}

export async function assignCommunityAdmin(
  communityId: string,
  email: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireSuperAdmin();
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };

    await db.communityMembership.upsert({
      where: { userId_subCommunityId: { userId: user.id, subCommunityId: communityId } },
      update: { role: "ADMIN" },
      create: { userId: user.id, subCommunityId: communityId, role: "ADMIN" },
    });

    await logAction(admin.id, "COMMUNITY_ADMIN_ASSIGNED", "CommunityMembership", communityId, { email });
    revalidatePath(`/admin/communities/${communityId}`);
    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign admin" };
  }
}

export async function removeCommunityMemberForScope(
  communityId: string,
  userId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await assertCanRemoveCommunityMember(session.user.id, communityId, userId);

    await db.communityMembership.deleteMany({
      where: { subCommunityId: communityId, userId },
    });
    await logAction(
      session.user.id,
      "COMMUNITY_MEMBER_REMOVED",
      "CommunityMembership",
      communityId,
      { userId },
    );
    revalidatePath(`/admin/communities/${communityId}`);
    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove member" };
  }
}

export async function removeCommunityMember(
  communityId: string,
  userId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin();
    return removeCommunityMemberForScope(communityId, userId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove member" };
  }
}

export async function removeCommunityMemberByLeader(
  communityId: string,
  userId: string,
): Promise<{ success?: boolean; error?: string }> {
  return removeCommunityMemberForScope(communityId, userId);
}

export async function syncTowerCommunityMembers(
  communityId: string,
): Promise<{ success?: boolean; error?: string; added?: number; removed?: number }> {
  try {
    const admin = await requireAdmin();
    const community = await db.subCommunity.findUnique({
      where: { id: communityId },
      select: { targetBlock: true },
    });
    if (!community?.targetBlock) {
      return { error: "This community is not a tower auto-membership group" };
    }

    const stats = await syncTowerCommunityMemberships(communityId);
    await logAction(admin.id, "TOWER_COMMUNITY_SYNCED", "SubCommunity", communityId, stats);
    revalidatePath(`/admin/communities/${communityId}`);
    revalidatePath("/communities");
    return { success: true, ...stats };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to sync members" };
  }
}

export async function syncAllTowerCommunityMembers(): Promise<{
  success?: boolean;
  error?: string;
  results?: Array<{ name: string; added: number; removed: number }>;
}> {
  try {
    const admin = await requireAdmin();
    const results = await syncAllTowerCommunities();
    await logAction(admin.id, "ALL_TOWER_COMMUNITIES_SYNCED", "SubCommunity", "all", {
      count: results.length,
    });
    revalidatePath("/admin/communities");
    revalidatePath("/communities");
    return {
      success: true,
      results: results.map((r) => ({ name: r.name, added: r.added, removed: r.removed })),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to sync tower communities" };
  }
}

export async function handleJoinRequest(
  requestId: string,
  approve: boolean,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const request = await db.communityJoinRequest.findUnique({
      where: { id: requestId },
      include: { subCommunity: { select: { id: true, targetBlock: true } } },
    });
    if (!request) return { error: "Request not found" };
    if (request.status !== "PENDING") return { error: "Request already processed" };

    await assertCanApproveJoinRequest(session.user.id, request.subCommunityId);

    await db.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    if (approve) {
      await db.communityMembership.upsert({
        where: {
          userId_subCommunityId: {
            userId: request.userId,
            subCommunityId: request.subCommunityId,
          },
        },
        update: {},
        create: {
          userId: request.userId,
          subCommunityId: request.subCommunityId,
          role: "MEMBER",
        },
      });
      await syncTowerCommunitiesForUser(request.userId);
    }

    await logAction(
      session.user.id,
      approve ? "JOIN_REQUEST_APPROVED" : "JOIN_REQUEST_REJECTED",
      "CommunityJoinRequest",
      requestId,
    );
    revalidatePath("/admin/communities");
    revalidatePath(`/communities/${request.subCommunityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to process request" };
  }
}
