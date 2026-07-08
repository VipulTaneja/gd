import { db } from "@/lib/db";
import { countPublishedFaqItems } from "@/lib/faq";
import {
  buildNoticeVisibilityFilter,
  buildSubCommunityContentFilter,
} from "@/lib/community-leaders";
import { activeMembershipWhere } from "@/lib/rbac";
import { getUnreadCount } from "@/lib/notifications";
import type { HubData } from "@/types/hub";

export async function getHubData(
  sessionUserId?: string
): Promise<HubData> {
  if (!sessionUserId) {
    return getGuestHubData();
  }
  return getResidentHubData(sessionUserId);
}

async function getPublicHubSlice(
  noticeFilter: object,
  eventScopeFilter: object,
  pollScopeFilter: object,
) {
  const [notices, events, polls, facilities, forumThreads, publishedFaqCount] = await Promise.all([
    db.notice.findMany({
      where: noticeFilter,
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      take: 3,
    }),
    db.event.findMany({
      where: { startsAt: { gte: new Date() }, ...eventScopeFilter },
      orderBy: { startsAt: "asc" },
      take: 2,
    }),
    db.poll.findMany({
      where: {
        opensAt: { lte: new Date() },
        closesAt: { gte: new Date() },
        ...pollScopeFilter,
      },
      orderBy: { opensAt: "desc" },
      take: 1,
    }),
    db.facility.findMany({
      select: { id: true, name: true, location: true },
      take: 8,
    }),
    db.forumThread.findMany({
      where: { status: { not: "HIDDEN" } },
      orderBy: { lastActivityAt: "desc" },
      take: 3,
      include: { forum: { select: { slug: true } }, _count: { select: { posts: true } } },
    }),
    countPublishedFaqItems(),
  ]);

  return {
    notices,
    events,
    polls,
    facilities,
    forumThreads: forumThreads.map((t) => ({
      id: t.id,
      title: t.title,
      forumSlug: t.forum.slug,
      lastActivityAt: t.lastActivityAt,
      _count: t._count,
    })),
    publishedFaqCount,
  };
}

async function getGuestHubData(): Promise<HubData> {
  const { notices, events, polls, facilities, forumThreads, publishedFaqCount } =
    await getPublicHubSlice(
      { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      {},
      {},
    );

  return {
    user: null,
    isResident: false,
    notices,
    events,
    polls,
    forumThreads,
    facilities,
    badges: { openTickets: 0, pendingDues: 0, unreadNotifications: 0, activePolls: polls.length },
    showFaqShortcut: publishedFaqCount > 0,
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
        where: activeMembershipWhere(),
        include: { unit: { select: { unitNumber: true, block: true, floor: true } } },
        orderBy: { isPrimary: "desc" },
        take: 1,
      },
    },
  });

  if (!user) return getGuestHubData();

  const primaryUnit = user.unitMemberships[0]?.unit ?? null;

  const [noticeFilter, scopeFilter] = await Promise.all([
    buildNoticeVisibilityFilter(userId),
    buildSubCommunityContentFilter(userId),
  ]);

  const [
    { notices, events, polls, facilities, forumThreads, publishedFaqCount },
    openTickets,
    pendingDues,
    unreadNotifications,
    activePolls,
  ] = await Promise.all([
    getPublicHubSlice(noticeFilter, scopeFilter, scopeFilter),
    db.helpTicket.count({
      where: { userId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    db.due.count({
      where: {
        status: "PENDING",
        unit: {
          memberships: { some: { userId, ...activeMembershipWhere() } },
        },
      },
    }),
    getUnreadCount(userId),
    db.poll.count({
      where: {
        opensAt: { lte: new Date() },
        closesAt: { gte: new Date() },
        ...scopeFilter,
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
    forumThreads,
    facilities,
    badges: {
      openTickets,
      pendingDues,
      unreadNotifications,
      activePolls,
    },
    showFaqShortcut: publishedFaqCount > 0,
  };
}
