import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EventForm } from "@/components/events/event-form";
import { PageHeader } from "@/components/shared/page-header";
import { ContentScopeChooser } from "@/components/shared/content-scope-chooser";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import { getLeaderScopes } from "@/lib/leader-scopes";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ communityId?: string; scope?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const communityId = params.communityId;
  const societyWide = params.scope === "society";
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const [admin, scopes] = await Promise.all([isAdmin(userId), getLeaderScopes(userId)]);
  const ledIds = scopes.communityLeaderIds;
  const canCreate = admin || ledIds.length > 0;
  if (!canCreate) redirect("/events");

  let community: { id: string; name: string } | null = null;

  if (communityId) {
    community = await db.subCommunity.findUnique({
      where: { id: communityId, isArchived: false },
      select: { id: true, name: true },
    });
    if (!community) notFound();

    const canCreate = admin || (await isCommunityLeader(userId, communityId));
    if (!canCreate) redirect(`/communities/${communityId}`);
  } else if (!societyWide) {
    const communities = admin
      ? await db.subCommunity.findMany({
          where: { isArchived: false },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : await db.subCommunity.findMany({
          where: { id: { in: ledIds }, isArchived: false },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });

    const suggestedId = ledIds.length === 1 ? ledIds[0] : null;

    return (
      <DashboardLayout user={user}>
        <ContentScopeChooser
          feature="events"
          title="Plan an event"
          subtitle="Pick society-wide, or link it to a community."
          backHref="/events"
          backLabel="Back to events"
          societyHref="/events/new?scope=society"
          societyTitle="Society-wide"
          societyDescription="Visible to all residents"
          communityHref={(id) => `/events/new?communityId=${id}`}
          communityDescription="Visible to community members"
          communities={communities.map((c) => ({
            ...c,
            suggested: c.id === suggestedId,
          }))}
        />
      </DashboardLayout>
    );
  }

  const facilities = await db.facility.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/events/new"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Change scope
        </Link>
        {community && (
          <Link
            href={`/communities/${community.id}`}
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            {community.name}
          </Link>
        )}
        <PageHeader
          feature="events"
          title={community ? `Event for ${community.name}` : "Plan an event"}
          subtitle={
            community
              ? "This event will be visible to community members."
              : "Create a society-wide event for residents."
          }
        />
        <div className="rounded-xl border bg-card p-6">
          <EventForm communityId={community?.id} facilities={facilities} />
        </div>
      </div>
    </DashboardLayout>
  );
}
