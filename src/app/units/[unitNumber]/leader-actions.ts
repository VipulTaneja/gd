"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  inviteUnitMemberByLeader,
  cancelUnitInvite,
} from "@/lib/unit-membership-requests";
import { assertUnitLeaderScope } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import type { UnitRole } from "@/generated/prisma/enums";

const INVITE_SEARCH_LIMIT = 20;
const INVITE_SEARCH_WINDOW_MS = 60_000;

async function requireActor() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function searchUsersForInvite(unitId: string, query: string) {
  const actorId = await requireActor();
  await assertUnitLeaderScope(actorId, unitId);

  const rl = checkRateLimit(`invite-search:${actorId}`, INVITE_SEARCH_LIMIT, INVITE_SEARCH_WINDOW_MS);
  if (!rl.ok) throw new Error("Too many searches. Please wait a moment.");

  if (query.length < 2) return [];

  const users = await db.user.findMany({
    where: {
      isActive: true,
      approvalStatus: "APPROVED",
      name: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      unitMemberships: {
        where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
        select: { unit: { select: { unitNumber: true } } },
      },
    },
    take: 10,
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    unitNumber: u.unitMemberships[0]?.unit.unitNumber ?? null,
    unitCount: u.unitMemberships.length,
  }));
}

export async function inviteUnitMemberAction(
  unitId: string,
  userId: string,
  role: UnitRole,
) {
  const actorId = await requireActor();
  await inviteUnitMemberByLeader(actorId, unitId, userId, role);
  const unit = await db.unit.findUnique({ where: { id: unitId }, select: { unitNumber: true } });
  if (unit) revalidatePath(`/units/${unit.unitNumber}`);
}

export async function cancelUnitInviteAction(requestId: string) {
  const actorId = await requireActor();
  const request = await db.unitMembershipRequest.findUnique({
    where: { id: requestId },
    include: { unit: { select: { unitNumber: true } } },
  });
  await cancelUnitInvite(actorId, requestId);
  if (request?.unit) revalidatePath(`/units/${request.unit.unitNumber}`);
}

export async function getPendingInvitesForUnit(unitId: string, actorId: string) {
  if (!(await isAdmin(actorId))) {
    await assertUnitLeaderScope(actorId, unitId);
  }
  return db.unitMembershipRequest.findMany({
    where: { unitId, status: "PENDING", type: "LEADER_INVITE" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}
