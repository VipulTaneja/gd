import { db } from "@/lib/db";

interface QuorumDashboardProps {
  pollId: string;
}

export async function QuorumDashboard({ pollId }: QuorumDashboardProps) {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: { _count: { select: { votes: true } } },
  });

  if (!poll) return null;

  const totalEligible = await db.unitMembership.count({
    where: {
      endDate: null,
      ...(poll.eligibility === "OWNERS_ONLY" ? { role: { in: ["OWNER", "JOINT_OWNER"] } } : {}),
    },
  });

  const votedCount = poll._count.votes;
  const percentage = totalEligible > 0 ? Math.round((votedCount / totalEligible) * 100) : 0;
  const quorumMet = poll.quorumPercentage ? percentage >= poll.quorumPercentage : true;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Quorum Status</h4>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          quorumMet ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
        }`}>
          {quorumMet ? "Quorum Met" : "Quorum Not Met"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Votes cast</span>
          <span className="font-medium">{votedCount}/{totalEligible}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${quorumMet ? "bg-green-500" : "bg-amber-500"}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage}% participation</span>
          {poll.quorumPercentage && <span>Required: {poll.quorumPercentage}%</span>}
        </div>
      </div>
    </div>
  );
}
