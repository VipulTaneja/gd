import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { actions, empty } from "@/lib/microcopy";
import { RichTextPreview } from "@/components/shared/rich-text-preview";
import { isAdmin } from "@/lib/rbac";
import { getLeaderScopes } from "@/lib/leader-scopes";

export const dynamic = "force-dynamic";

export default async function PollsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const [admin, leaderScopes] = await Promise.all([
    isAdmin(session.user.id),
    getLeaderScopes(session.user.id),
  ]);
  const canStartPoll = admin || leaderScopes.communityLeaderIds.length > 0;

  const params = await searchParams;
  const now = new Date();

  const where = params.tab === "closed"
    ? { closesAt: { lt: now } }
    : params.tab === "upcoming"
    ? { opensAt: { gt: now } }
    : { opensAt: { lte: now }, closesAt: { gte: now } };

  const polls = await db.poll.findMany({
    where,
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const userVotes =
    polls.length === 0
      ? []
      : await db.vote.findMany({
          where: {
            userId: session.user.id,
            pollId: { in: polls.map((p) => p.id) },
          },
          select: {
            pollId: true,
            optionId: true,
            option: { select: { label: true } },
          },
        });

  const myVotesByPoll = new Map<string, { optionId: string; label: string }[]>();
  for (const vote of userVotes) {
    const choices = myVotesByPoll.get(vote.pollId) ?? [];
    choices.push({ optionId: vote.optionId, label: vote.option.label });
    myVotesByPoll.set(vote.pollId, choices);
  }

  const getStatus = (poll: { opensAt: Date; closesAt: Date }) => {
    if (poll.opensAt > now) return "upcoming";
    if (poll.closesAt < now) return "closed";
    return "active";
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="polls"
          title="Polls"
          subtitle="Vote on community decisions"
          action={
            canStartPoll ? (
              <Link href="/polls/new"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light sm:w-auto">
                {actions.newPoll}
              </Link>
            ) : undefined
          }
        />

        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {[["active", "Active"], ["upcoming", "Upcoming"], ["closed", "Closed"]].map(([key, label]) => (
            <Link key={key} href={`/polls?tab=${key}`}
              className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                (params.tab || "active") === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        {polls.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title={empty.polls.title}
            description={empty.polls.description}
            action={canStartPoll ? { label: actions.newPoll, href: "/polls/new" } : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => {
              const status = getStatus(poll);
              const totalVotes = poll._count.votes;
              const myVotes = myVotesByPoll.get(poll.id) ?? [];
              const hasVoted = myVotes.length > 0;
              const myChoiceIds = new Set(myVotes.map((v) => v.optionId));
              return (
                <Link key={poll.id} href={`/polls/${poll.id}`}
                  className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-all hover:ring-2 hover:ring-gold hover:shadow-lg">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <FriendlyBadge value={status === "active" ? "OPEN" : status === "closed" ? "CLOSED" : "PENDING"} variant="status" />
                    <div className="flex flex-wrap justify-end gap-1">
                      {hasVoted && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Voted
                        </span>
                      )}
                      {poll.isResolution && (
                        <FriendlyBadge value="RESOLUTION" variant="semantic" />
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-base font-semibold group-hover:text-gold">{poll.title}</h3>
                  {poll.description && (
                    <RichTextPreview content={poll.description} className="mt-1 line-clamp-2" />
                  )}
                  {(status === "active" || hasVoted) && poll.options.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {poll.options.slice(0, 3).map((opt) => {
                        const pct = totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0;
                        const isMine = myChoiceIds.has(opt.id);
                        return (
                          <div key={opt.id}>
                            <div className="mb-0.5 flex justify-between gap-2 text-xs text-muted-foreground">
                              <span className={isMine ? "font-medium text-gold-dark" : ""}>
                                {opt.label}
                                {isMine && (
                                  <span className="ml-1.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
                                    You
                                  </span>
                                )}
                              </span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                    <span>{poll.options.length} options</span>
                    <span>{poll.closesAt.toLocaleDateString("en-IN")}</span>
                  </div>
                  {hasVoted ? (
                    <p className="mt-auto pt-3 text-xs font-medium text-emerald-800">
                      You voted: {myVotes.map((v) => v.label).join(", ")}
                    </p>
                  ) : status === "active" ? (
                    <span className="mt-auto pt-3 inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold-dark self-start">
                      Cast your vote →
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
