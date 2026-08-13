import { Suspense } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { StaggerChildren } from "@/components/shared/animated";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { FilterPillRow } from "@/components/shared/filter-pill-row";
import Link from "next/link";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import { communities as communitiesCopy, empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

type MembershipFilter = "all" | "leader" | "member" | "none";

const FILTERS: { key: MembershipFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "leader", label: "Leader" },
  { key: "member", label: "Member" },
  { key: "none", label: "Browse" },
];

function parseFilter(value: string | undefined): MembershipFilter {
  if (value === "leader" || value === "member" || value === "none") return value;
  return "all";
}

function membershipBadge(role: string | undefined): "LEADER" | "MEMBER" | "VIEW" {
  if (!role) return "VIEW";
  return role === "ADMIN" ? "LEADER" : "MEMBER";
}

async function CommunitiesGrid({
  userId,
  filter,
}: {
  userId: string;
  filter: MembershipFilter;
}) {
  await syncTowerCommunitiesForUser(userId);

  const communities = await db.subCommunity.findMany({
    where: { isArchived: false },
    include: {
      _count: { select: { memberships: true, polls: true, events: true } },
      memberships: {
        where: { userId },
        select: { id: true, role: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const filtered = communities.filter((c) => {
    const role = c.memberships[0]?.role;
    if (filter === "leader") return role === "ADMIN";
    if (filter === "member") return role === "MEMBER";
    if (filter === "none") return !role;
    return true;
  });

  if (filtered.length === 0) {
    const emptyCopy =
      filter === "leader"
        ? empty.communitiesLeader
        : filter === "member"
          ? empty.communitiesMember
          : filter === "none"
            ? empty.communitiesBrowse
            : empty.communities;
    return <EmptyState icon={Users} title={emptyCopy.title} description={emptyCopy.description} />;
  }

  return (
    <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((c) => {
        const badgeValue = membershipBadge(c.memberships[0]?.role);
        return (
          <Link
            key={c.id}
            href={`/communities/${c.id}`}
            className="group flex h-full flex-col rounded-xl border bg-card p-6 transition-all hover:ring-2 hover:ring-gold hover:shadow-lg"
          >
            <h3 className="font-heading text-lg font-semibold group-hover:text-gold">
              {c.name}
            </h3>
            {c.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {c._count.memberships}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {c._count.polls}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {c._count.events}
              </span>
            </div>
            <FriendlyBadge value={badgeValue} variant="semantic" className="mt-4" />
          </Link>
        );
      })}
    </StaggerChildren>
  );
}

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const params = await searchParams;
  const filter = parseFilter(params.filter);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="communities"
          title={communitiesCopy.title}
          subtitle={communitiesCopy.subtitle}
        />

        <FilterPillRow>
          {FILTERS.map(({ key, label }) => (
            <Link
              key={key}
              href={key === "all" ? "/communities" : `/communities?filter=${key}`}
              className={`inline-flex h-11 shrink-0 snap-start items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-input hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          ))}
        </FilterPillRow>

        <Suspense key={filter} fallback={<CardGridSkeleton />}>
          <CommunitiesGrid userId={session.user.id} filter={filter} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
