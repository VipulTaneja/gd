import { Suspense } from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import Link from "next/link";
import { JoinCommunityButton } from "./join-button";
import { isTowerCommunity, syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { CommunityLeaderPanel } from "@/components/communities/community-leader-panel";

export const dynamic = "force-dynamic";

async function CommunityDetail({ id, userId }: { id: string; userId: string }) {
  await syncTowerCommunitiesForUser(userId);

  const community = await db.subCommunity.findUnique({
    where: { id, isArchived: false },
    include: {
      memberships: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "desc" },
      },
      polls: {
        where: { closesAt: { gte: new Date() } },
        orderBy: { opensAt: "desc" },
        take: 5,
      },
      events: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 5,
      },
      forums: {
        where: { isArchived: false },
        take: 1,
        include: {
          threads: {
            where: { status: { not: "HIDDEN" } },
            orderBy: { lastActivityAt: "desc" },
            take: 10,
            include: {
              author: { select: { id: true, name: true } },
              _count: { select: { posts: true } },
            },
          },
        },
      },
    },
  });

  if (!community) notFound();

  const isMember = community.memberships.some((m) => m.userId === userId);
  const isTower = isTowerCommunity(community);

  const [isLeader, hasPendingRequest] = await Promise.all([
    isCommunityLeader(userId, id),
    isTower
      ? Promise.resolve(false)
      : db.communityJoinRequest
          .findFirst({
            where: { userId, subCommunityId: id, status: "PENDING" },
          })
          .then(Boolean),
  ]);

  const pendingJoinRequests = isLeader && !isTower
    ? await db.communityJoinRequest.findMany({
        where: { subCommunityId: id, status: "PENDING" },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <Link href="/communities" className="text-sm text-muted-foreground hover:text-foreground">
        ← Teams and Communities
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{community.name}</h1>
          {community.description && (
            <p className="mt-1 text-muted-foreground">{community.description}</p>
          )}
          {isTower && (
            <p className="mt-2 text-sm text-muted-foreground">
              All active Tower {community.targetBlock} residents are automatically members.
            </p>
          )}
        </div>
        {!isMember && !hasPendingRequest && !isTower && (
          <JoinCommunityButton communityId={community.id} />
        )}
        {!isMember && isTower && (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            Tower {community.targetBlock} residents only
          </span>
        )}
        {hasPendingRequest && <FriendlyBadge value="PENDING" variant="semantic" />}
        {isMember && <FriendlyBadge value="MEMBER" variant="semantic" />}
      </div>

      {isLeader && (
        <CommunityLeaderPanel
          communityId={community.id}
          communityName={community.name}
          isTower={isTower}
          pendingRequests={pendingJoinRequests}
        />
      )}

      {/* Members */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">
          Members ({community.memberships.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {community.memberships.map((m) => (
            <span
              key={m.id}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                m.role === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <UserLink userId={m.userId} name={m.user.name} className="hover:text-inherit" />
              {m.role === "ADMIN" && (
                <span>
                  {" "}
                  <span aria-hidden="true">★</span>
                  <span className="sr-only">Admin</span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Polls */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Active Polls</h2>
        {community.polls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active polls</p>
        ) : (
          <div className="space-y-2">
            {community.polls.map((p) => (
              <Link key={p.id} href={`/polls/${p.id}`} className="block rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">Closes {p.closesAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Events */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Upcoming Events</h2>
        {community.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events</p>
        ) : (
          <div className="space-y-2">
            {community.events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium text-sm">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.startsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {e.location ?? "TBD"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Discussions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Discussions</h2>
        {community.forums.length === 0 || community.forums[0].threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discussions yet</p>
        ) : (
          <div className="space-y-2">
            {community.forums[0].threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/forums/${community.forums[0].slug}/threads/${thread.id}`}
                className="block rounded-lg border p-3 hover:bg-muted/50"
              >
                <p className="font-medium text-sm">{thread.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <UserLink userId={thread.author.id} name={thread.author.name} />
                  <span>· {thread._count.posts} {thread._count.posts === 1 ? "reply" : "replies"}</span>
                  <span>· {thread.lastActivityAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardLayout user={user}>
      <Suspense fallback={<CardGridSkeleton cards={4} cols={2} />}>
        <CommunityDetail id={id} userId={session.user.id} />
      </Suspense>
    </DashboardLayout>
  );
}
