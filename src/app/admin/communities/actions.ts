"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit";

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
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const existing = await db.subCommunity.findUnique({ where: { name: data.name } });
    if (existing) return { error: "Community with this name already exists" };

    const community = await db.subCommunity.create({ data });
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.forum.create({
      data: {
        name: `${data.name} Discussions`,
        slug,
        scope: "SUB_COMMUNITY",
        subCommunityId: community.id,
      },
    });
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
  data: { name: string; description: string },
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    await db.subCommunity.update({ where: { id }, data });
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
    const admin = await requireAdmin();
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
    const admin = await requireAdmin();
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };

    await db.communityMembership.upsert({
      where: { userId_subCommunityId: { userId: user.id, subCommunityId: communityId } },
      update: { role: "ADMIN" },
      create: { userId: user.id, subCommunityId: communityId, role: "ADMIN" },
    });

    await logAction(admin.id, "COMMUNITY_ADMIN_ASSIGNED", "CommunityMembership", communityId, { email });
    revalidatePath(`/admin/communities/${communityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign admin" };
  }
}

export async function removeCommunityMember(
  communityId: string,
  userId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    await db.communityMembership.deleteMany({
      where: { subCommunityId: communityId, userId },
    });
    await logAction(admin.id, "COMMUNITY_MEMBER_REMOVED", "CommunityMembership", communityId, { userId });
    revalidatePath(`/admin/communities/${communityId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove member" };
  }
}

export async function handleJoinRequest(
  requestId: string,
  approve: boolean,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const request = await db.communityJoinRequest.findUnique({ where: { id: requestId } });
    if (!request) return { error: "Request not found" };

    await db.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "APPROVED" : "REJECTED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    if (approve) {
      await db.communityMembership.create({
        data: {
          userId: request.userId,
          subCommunityId: request.subCommunityId,
          role: "MEMBER",
        },
      });
    }

    await logAction(
      admin.id,
      approve ? "JOIN_REQUEST_APPROVED" : "JOIN_REQUEST_REJECTED",
      "CommunityJoinRequest",
      requestId,
    );
    revalidatePath("/admin/communities");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to process request" };
  }
}
