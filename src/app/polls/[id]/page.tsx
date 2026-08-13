import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { RichTextContent } from "@/components/shared/rich-text-content";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { VoteForm } from "./vote-form";
import { PollResults } from "./poll-results";

export const dynamic = "force-dynamic";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const poll = await db.poll.findUnique({
    where: { id },
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { votes: true } },
    },
  });

  if (!poll) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const now = new Date();
  const isActive = poll.opensAt <= now && poll.closesAt >= now;
  const isClosed = poll.closesAt < now;

  const existingVotes = await db.vote.findMany({
    where: { pollId: id, userId: session.user.id },
    select: { optionId: true },
  });
  const hasVoted = existingVotes.length > 0;
  const votedOptionIds = existingVotes.map((v) => v.optionId);

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Breadcrumb items={[{ label: "Polls", href: "/polls" }, { label: poll.title }]} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold">{poll.title}</h1>
            {poll.description && (
              <RichTextContent content={poll.description} className="mt-1 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {poll.isAnonymous && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Anonymous
              </span>
            )}
            {poll.isResolution && (
              <FriendlyBadge value="RESOLUTION" variant="semantic" />
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Eligibility: {poll.eligibility.replace(/_/g, " ")}</span>
            <span>Max choices: {poll.maxChoices}</span>
            <span>
              {poll._count.votes} vote{poll._count.votes !== 1 ? "s" : ""}
            </span>
          </div>

          {hasVoted && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Your vote is already recorded
              {votedOptionIds.length > 0 && (
                <>
                  {" "}
                  —{" "}
                  <span className="font-medium">
                    {poll.options
                      .filter((o) => votedOptionIds.includes(o.id))
                      .map((o) => o.label)
                      .join(", ")}
                  </span>
                </>
              )}
              . Votes can’t be changed once submitted.
            </div>
          )}

          {hasVoted || isClosed ? (
            <PollResults poll={poll} highlightedOptionIds={votedOptionIds} />
          ) : isActive ? (
            <VoteForm pollId={poll.id} options={poll.options} maxChoices={poll.maxChoices} />
          ) : (
            <p className="py-4 text-center text-muted-foreground">Poll has not started yet.</p>
          )}
        </div>

        {poll.isResolution && poll.quorumPercentage && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading mb-2 text-lg font-semibold">Quorum</h2>
            <p className="text-sm text-muted-foreground">
              Required: {poll.quorumPercentage}% participation
            </p>
            <p className="text-sm text-muted-foreground">
              Current: {poll._count.votes} votes cast
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
