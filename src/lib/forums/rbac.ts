import type { Forum } from "@/generated/prisma/client";
import { db } from "@/lib/db";

type ForumWithCommunity = Forum & { subCommunityId: string | null };

interface UserContext {
  id: string;
  globalRole: string;
  approvalStatus: string;
  isActive: boolean;
}

export function canReadForum(
  forum: ForumWithCommunity,
  user: UserContext,
): boolean {
  if (forum.isArchived) return false;
  if (user.globalRole === "SUPER_ADMIN" || user.globalRole === "ADMIN") return true;
  if (!user.isActive) return false;
  if (user.approvalStatus !== "APPROVED") return false;
  if (forum.scope === "GLOBAL") return true;
  if (forum.scope === "SUB_COMMUNITY" && forum.subCommunityId) return true;
  return false;
}

export async function canPost(
  forum: ForumWithCommunity,
  user: UserContext,
): Promise<boolean> {
  if (forum.isReadOnly) return false;
  if (user.globalRole === "SUPER_ADMIN" || user.globalRole === "ADMIN") return true;
  if (!user.isActive) return false;
  if (user.approvalStatus !== "APPROVED") return false;
  if (forum.scope === "GLOBAL") return true;
  if (forum.scope === "SUB_COMMUNITY" && forum.subCommunityId) {
    const membership = await db.communityMembership.findUnique({
      where: { userId_subCommunityId: { userId: user.id, subCommunityId: forum.subCommunityId } },
    });
    return !!membership;
  }
  return false;
}

export async function canModerate(
  forum: ForumWithCommunity,
  user: UserContext,
): Promise<boolean> {
  if (user.globalRole === "SUPER_ADMIN" || user.globalRole === "ADMIN") return true;
  if (forum.scope === "SUB_COMMUNITY" && forum.subCommunityId) {
    const membership = await db.communityMembership.findUnique({
      where: { userId_subCommunityId: { userId: user.id, subCommunityId: forum.subCommunityId } },
    });
    return membership?.role === "ADMIN";
  }
  return false;
}
