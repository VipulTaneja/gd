import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PollForm } from "@/components/polls/poll-form";
import { PageHeader } from "@/components/shared/page-header";
import { ContentScopeChooser } from "@/components/shared/content-scope-chooser";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import { getLeaderScopes } from "@/lib/leader-scopes";

export const dynamic = "force-dynamic";

export default async function NewPollPage({
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
  if (!canCreate) redirect("/polls");

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
          feature="polls"
          title="Start a poll"
          subtitle="Pick society-wide, or link it to a community."
          backHref="/polls"
          backLabel="Back to polls"
          societyHref="/polls/new?scope=society"
          societyTitle="Society-wide"
          societyDescription="Visible to all residents"
          communityHref={(id) => `/polls/new?communityId=${id}`}
          communityDescription="Visible to community members"
          communities={communities.map((c) => ({
            ...c,
            suggested: c.id === suggestedId,
          }))}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/polls/new" className="text-sm text-muted-foreground hover:text-foreground">
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
          feature="polls"
          title={community ? `Poll for ${community.name}` : "Start a poll"}
          subtitle={
            community
              ? "This poll will be visible to community members."
              : "Create a society-wide poll for residents."
          }
        />
        <div className="rounded-xl border bg-card p-6">
          <PollForm communityId={community?.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
