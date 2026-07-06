import { db } from "@/lib/db";
import type { HubData } from "@/types/hub";

export async function getHubData(
  sessionUserId?: string
): Promise<HubData> {
  if (!sessionUserId) {
    return getGuestHubData();
  }
  return getResidentHubData(sessionUserId);
}

async function getGuestHubData(): Promise<HubData> {
  const [notices, events, polls, facilities] = await Promise.all([
    db.notice.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    db.event.findMany({
      where: { startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 2,
    }),
    db.poll.findMany({
      where: {
        opensAt: { lte: new Date() },
        closesAt: { gte: new Date() },
      },
      orderBy: { opensAt: "desc" },
      take: 1,
    }),
    db.facility.findMany({
      select: { id: true, name: true, location: true },
      take: 8,
    }),
  ]);

  return {
    user: null,
    isResident: false,
    notices,
    events,
    polls,
    facilities,
    badges: { openTickets: 0, pendingDues: 0, unreadNotifications: 0, activePolls: polls.length },
  };
}

async function getResidentHubData(userId: string): Promise<HubData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      globalRole: true,
      unitMemberships: {
        where: { endDate: null },
        include: { unit: { select: { unitNumber: true, block: true, floor: true } } },
        orderBy: { isPrimary: "desc" },
        take: 1,
      },
    },
  });

  if (!user) return getGuestHubData();

  const primaryUnit = user.unitMemberships[0]?.unit
    ? {
        ...user.unitMemberships[0].unit,
        floor: user.unitMemberships[0].unit.floor ?? 0,
      }
    : null;
  const towerBlock = primaryUnit?.block ?? null;

  const [notices, events, polls, facilities, openTickets, pendingDues, unreadNotifications, activePolls] =
    await Promise.all([
      db.notice.findMany({
        where: {
          AND: [
            { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
            towerBlock
              ? { OR: [{ targetBlock: null }, { targetBlock: towerBlock }] }
              : {},
          ],
        },
        orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
        take: 3,
      }),
      db.event.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 2,
      }),
      db.poll.findMany({
        where: {
          opensAt: { lte: new Date() },
          closesAt: { gte: new Date() },
        },
        orderBy: { opensAt: "desc" },
        take: 1,
      }),
      db.facility.findMany({
        select: { id: true, name: true, location: true },
        take: 8,
      }),
      db.helpTicket.count({
        where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      db.due.count({
        where: {
          status: "PENDING",
          unit: {
            memberships: { some: { userId, endDate: null } },
          },
        },
      }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
      db.poll.count({
        where: {
          opensAt: { lte: new Date() },
          closesAt: { gte: new Date() },
        },
      }),
    ]);

  return {
    user: {
      ...user,
      primaryUnit,
    },
    isResident: true,
    notices,
    events,
    polls,
    facilities,
    badges: {
      openTickets,
      pendingDues,
      unreadNotifications,
      activePolls,
    },
  };
}
