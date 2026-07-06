import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
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
    where: { pollId: id, userId: session.user!.id },
  });
  const hasVoted = existingVotes.length > 0;

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold">{poll.title}</h1>
            {poll.description && <p className="mt-1 text-muted-foreground">{poll.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {poll.isAnonymous && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Anonymous</span>
            )}
            {poll.isResolution && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">Resolution</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
            <span>Eligibility: {poll.eligibility.replace(/_/g, " ")}</span>
            <span>Max choices: {poll.maxChoices}</span>
            <span>{poll._count.votes} vote{poll._count.votes !== 1 ? "s" : ""}</span>
          </div>

          {hasVoted || isClosed ? (
            <PollResults poll={poll} />
          ) : isActive ? (
            <VoteForm pollId={poll.id} options={poll.options} maxChoices={poll.maxChoices} />
          ) : (
            <p className="text-center text-muted-foreground py-4">Poll has not started yet.</p>
          )}
        </div>

        {poll.isResolution && poll.quorumPercentage && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-2">Quorum</h2>
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
