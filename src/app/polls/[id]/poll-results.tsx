"use client";

interface PollOption {
  id: string;
  label: string;
  _count: { votes: number };
}

interface Poll {
  id: string;
  isResolution: boolean;
  quorumPercentage: number | null;
  _count: { votes: number };
  options: PollOption[];
}

export function PollResults({
  poll,
}: {
  poll: Poll;
}) {
  const totalVotes = poll._count.votes;
  const maxVotes = Math.max(...poll.options.map((o) => o._count.votes), 1);

  return (
    <div className="space-y-3">
      {poll.options.map((opt) => {
        const pct = totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0;
        const barWidth = totalVotes > 0 ? (opt._count.votes / maxVotes) * 100 : 0;
        return (
          <div key={opt.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{opt.label}</span>
              <span className="text-muted-foreground">
                {opt._count.votes} vote{opt._count.votes !== 1 ? "s" : ""} ({pct}%)
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}

      {poll.isResolution && poll.quorumPercentage && (
        <div className="mt-4 rounded-lg border p-3 text-sm">
          <p className="font-medium">
            Quorum: {totalVotes} votes cast
          </p>
          <p className="text-muted-foreground">
            {poll.quorumPercentage}% participation required
          </p>
        </div>
      )}
    </div>
  );
}
