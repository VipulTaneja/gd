import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import Link from "next/link";
import { JoinCommunityButton } from "./join-button";

export const dynamic = "force-dynamic";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

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

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const userId = session.user!.id;
  const isMember = community.memberships.some((m) => m.userId === userId);

  const hasPendingRequest = await db.communityJoinRequest.findFirst({
    where: {
      userId,
      subCommunityId: id,
      status: "PENDING",
    },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <Link href="/communities" className="text-sm text-muted-foreground hover:text-foreground">
          ← Communities
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{community.name}</h1>
            {community.description && (
              <p className="mt-1 text-muted-foreground">{community.description}</p>
            )}
          </div>
          {!isMember && !hasPendingRequest && (
            <JoinCommunityButton communityId={community.id} />
          )}
          {hasPendingRequest && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              Request Pending
            </span>
          )}
          {isMember && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              Member
            </span>
          )}
        </div>

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
                {m.user.name}
                {m.role === "ADMIN" && " ★"}
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
                  <p className="text-xs text-muted-foreground">Closes {p.closesAt.toLocaleDateString()}</p>
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
                    {e.startsAt.toLocaleDateString()} · {e.location ?? "TBD"}
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
                    <span>· {thread.lastActivityAt.toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
