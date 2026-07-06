import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type SearchResultItem,
  type SearchResultGroup,
  type GlobalSearchResponse,
  stripHtmlForSearch,
  normalizeUnitQuery,
  NAVIGATION_SHORTCUTS,
} from "@/lib/search/types";
import { buildNoticeVisibilityFilter } from "@/lib/community-leaders";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)));
  const types = searchParams.get("types")?.split(",").map((t) => t.trim());

  if (!q || q.length < 2) {
    return NextResponse.json({ query: q || "", groups: [] });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      globalRole: true,
      approvalStatus: true,
      isActive: true,
      unitMemberships: {
        where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
        select: { unit: { select: { id: true, block: true } } },
      },
      communityMemberships: {
        select: { subCommunityId: true },
      },
    },
  });

  if (!user || !user.isActive || user.approvalStatus !== "APPROVED") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole);
  const towerBlocks = [...new Set(user.unitMemberships.map((m) => m.unit.block))];
  const communityIds = user.communityMemberships.map((cm) => cm.subCommunityId);

  const unitQuery = normalizeUnitQuery(q);

  const groups: SearchResultGroup[] = [];
  const searches: Promise<SearchResultGroup | null>[] = [];

  // Users
  if (!types || types.includes("users")) {
    searches.push(
      (async () => {
        const results = await db.user.findMany({
          where: {
            name: { contains: q, mode: "insensitive" },
            isActive: true,
            approvalStatus: "APPROVED",
          },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            unitMemberships: {
              where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
              select: { unit: { select: { unitNumber: true, block: true } }, role: true },
            },
          },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((u) => ({
          id: u.id,
          type: "user",
          title: u.name,
          subtitle: u.unitMemberships[0] ? `${u.unitMemberships[0].unit.unitNumber} · ${u.unitMemberships[0].role.replace("_", " ")}` : undefined,
          href: `/users/${u.id}`,
          meta: u.unitMemberships[0]?.unit.block,
        }));

        return items.length > 0 ? { type: "user", label: "Neighbors", results: items } : null;
      })()
    );
  }

  // Units
  if (!types || types.includes("units")) {
    searches.push(
      (async () => {
        const where = unitQuery
          ? { unitNumber: { equals: unitQuery } }
          : { unitNumber: { contains: q, mode: "insensitive" as const } };

        const results = await db.unit.findMany({
          where,
          select: { id: true, unitNumber: true, block: true, floor: true },
          take: limit,
          orderBy: { unitNumber: "asc" },
        });

        const items: SearchResultItem[] = results.map((u) => ({
          id: u.id,
          type: "unit",
          title: u.unitNumber,
          subtitle: `Tower ${u.block}${u.floor ? `, Floor ${u.floor}` : ""}`,
          href: `/units/${u.unitNumber}`,
          meta: u.block,
        }));

        return items.length > 0 ? { type: "unit", label: "Units", results: items } : null;
      })()
    );
  }

  // Notices — tower + community-scoped visibility (LEAD-024)
  if (!types || types.includes("notices")) {
    searches.push(
      (async () => {
        const searchClause = {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { body: { contains: q, mode: "insensitive" as const } },
          ],
        };

        const where = isAdmin
          ? {
              AND: [
                searchClause,
                { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
              ],
            }
          : {
              AND: [
                ...(await buildNoticeVisibilityFilter(session.user.id)).AND,
                searchClause,
              ],
            };

        const results = await db.notice.findMany({
          where,
          select: {
            id: true,
            title: true,
            body: true,
            priority: true,
            targetBlock: true,
            subCommunityId: true,
            publishedAt: true,
            subCommunity: { select: { name: true } },
          },
          orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
          take: limit,
        });

        const items: SearchResultItem[] = results.map((n) => ({
          id: n.id,
          type: "notice",
          title: n.title,
          subtitle: stripHtmlForSearch(n.body).slice(0, 80) + (n.body.length > 80 ? "…" : ""),
          href: "/notices",
          meta: n.subCommunity?.name ?? (n.targetBlock ? `Tower ${n.targetBlock}` : "All towers"),
          priority: n.priority as "EMERGENCY" | "IMPORTANT" | "NORMAL",
        }));

        return items.length > 0 ? { type: "notice", label: "What's new", results: items } : null;
      })()
    );
  }

  // Events — fixed: use AND
  if (!types || types.includes("events")) {
    searches.push(
      (async () => {
        const results = await db.event.findMany({
          where: {
            AND: [
              {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { location: { contains: q, mode: "insensitive" } },
                ],
              },
              { startsAt: { gte: new Date() } },
              { OR: [{ scope: "GLOBAL" }, { subCommunityId: { in: communityIds } }] },
            ],
          },
          select: { id: true, title: true, location: true, startsAt: true },
          orderBy: { startsAt: "asc" },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((e) => ({
          id: e.id,
          type: "event",
          title: e.title,
          subtitle: e.location || undefined,
          href: `/events/${e.id}`,
          meta: e.startsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        }));

        return items.length > 0 ? { type: "event", label: "Events", results: items } : null;
      })()
    );
  }

  // Polls — fixed: use AND
  if (!types || types.includes("polls")) {
    searches.push(
      (async () => {
        const now = new Date();
        const results = await db.poll.findMany({
          where: {
            AND: [
              {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              { opensAt: { lte: now } },
              { closesAt: { gte: now } },
            ],
          },
          select: { id: true, title: true, closesAt: true },
          orderBy: { opensAt: "desc" },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((p) => ({
          id: p.id,
          type: "poll",
          title: p.title,
          href: `/polls/${p.id}`,
          meta: `Closes ${p.closesAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        }));

        return items.length > 0 ? { type: "poll", label: "Polls", results: items } : null;
      })()
    );
  }

  // Forum threads — fixed: use AND
  if (!types || types.includes("forum_threads")) {
    searches.push(
      (async () => {
        const results = await db.forumThread.findMany({
          where: {
            AND: [
              {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { body: { contains: q, mode: "insensitive" } },
                ],
              },
              { status: { not: "HIDDEN" } },
            ],
          },
          select: { id: true, title: true, forum: { select: { slug: true, name: true } } },
          orderBy: { lastActivityAt: "desc" },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((t) => ({
          id: t.id,
          type: "forum_thread",
          title: t.title,
          subtitle: t.forum.name,
          href: `/forums/${t.forum.slug}/threads/${t.id}`,
        }));

        return items.length > 0 ? { type: "forum_thread", label: "Forums", results: items } : null;
      })()
    );
  }

  // Facilities
  if (!types || types.includes("facilities")) {
    searches.push(
      (async () => {
        const results = await db.facility.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, location: true },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((f) => ({
          id: f.id,
          type: "facility",
          title: f.name,
          subtitle: f.location || undefined,
          href: `/facilities/${f.id}`,
        }));

        return items.length > 0 ? { type: "facility", label: "Amenities", results: items } : null;
      })()
    );
  }

  // Sub-communities — fixed: use AND
  if (!types || types.includes("communities")) {
    searches.push(
      (async () => {
        const results = await db.subCommunity.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              { isArchived: false },
            ],
          },
          select: { id: true, name: true, description: true },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((c) => ({
          id: c.id,
          type: "community",
          title: c.name,
          subtitle: c.description || undefined,
          href: `/communities/${c.id}`,
        }));

        return items.length > 0 ? { type: "community", label: "Communities", results: items } : null;
      })()
    );
  }

  // Tickets (own only for residents, all for admin) — fixed: use AND
  if (!types || types.includes("tickets")) {
    searches.push(
      (async () => {
        const AND: Record<string, unknown>[] = [
          {
            OR: [
              { subject: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
        ];

        if (!isAdmin) {
          AND.push({ userId: user.id });
        }

        const results = await db.helpTicket.findMany({
          where: { AND },
          select: { id: true, subject: true, status: true, priority: true, category: true },
          orderBy: { createdAt: "desc" },
          take: limit,
        });

        const items: SearchResultItem[] = results.map((t) => ({
          id: t.id,
          type: "ticket",
          title: t.subject,
          subtitle: `${t.category.replace("_", " ")} · ${t.status.replace("_", " ")}`,
          href: `/tickets/${t.id}`,
          meta: t.priority,
        }));

        return items.length > 0 ? { type: "ticket", label: "My tickets", results: items } : null;
      })()
    );
  }

  // Navigation shortcuts
  if (!types || types.includes("navigation")) {
    const qLower = q.toLowerCase();
    const matchingNav = NAVIGATION_SHORTCUTS.filter((s) =>
      s.keywords.some((kw) => qLower.includes(kw))
    ).slice(0, 3);

    if (matchingNav.length > 0) {
      groups.push({
        type: "navigation",
        label: "Quick links",
        results: matchingNav.map((n) => ({
          id: n.href,
          type: "navigation" as const,
          title: n.label,
          href: n.href,
        })),
      });
    }
  }

  const resolvedGroups = (await Promise.all(searches)).filter(Boolean) as SearchResultGroup[];

  const navGroup = groups.find((g) => g.type === "navigation");
  const finalGroups = navGroup ? [navGroup, ...resolvedGroups] : resolvedGroups;

  return NextResponse.json({
    query: q,
    groups: finalGroups,
  } satisfies GlobalSearchResponse);
}
