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
import Link from "next/link";
import { Users, Calendar, MessageSquare } from "lucide-react";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import { communities as communitiesCopy, empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

async function CommunitiesGrid({ userId }: { userId: string }) {
  await syncTowerCommunitiesForUser(userId);

  const communities = await db.subCommunity.findMany({
    where: { isArchived: false },
    include: {
      _count: { select: { memberships: true, polls: true, events: true } },
      memberships: {
        where: { userId },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  if (communities.length === 0) {
    return <EmptyState icon={Users} title={empty.communities.title} description={empty.communities.description} />;
  }

  return (
    <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {communities.map((c) => {
        const isMember = c.memberships.length > 0;
        return (
          <Link
            key={c.id}
            href={`/communities/${c.id}`}
            className="group rounded-xl border bg-card p-6 transition-all hover:ring-gold hover:shadow-lg"
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
            <FriendlyBadge value={isMember ? "MEMBER" : "VIEW"} variant="semantic" className="mt-4" />
          </Link>
        );
      })}
    </StaggerChildren>
  );
}

export default async function CommunitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="communities"
          title={communitiesCopy.title}
          subtitle={communitiesCopy.subtitle}
        />

        <Suspense fallback={<CardGridSkeleton />}>
          <CommunitiesGrid userId={session.user.id} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
