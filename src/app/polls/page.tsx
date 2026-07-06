import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Clock, CheckCircle, BarChart3 } from "lucide-react";

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

  const getStatus = (poll: { opensAt: Date; closesAt: Date }) => {
    if (poll.opensAt > now) return "upcoming";
    if (poll.closesAt < now) return "closed";
    return "active";
  };

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    upcoming: "bg-blue-100 text-blue-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold">Polls</h1>
          <Link href="/polls/new"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light w-full sm:w-auto">
            Create Poll
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {[["active", "Active"], ["upcoming", "Upcoming"], ["closed", "Closed"]].map(([key, label]) => (
            <Link key={key} href={`/polls?tab=${key}`}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                (params.tab || "active") === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => {
            const status = getStatus(poll);
            const totalVotes = poll._count.votes;
            return (
              <Link key={poll.id} href={`/polls/${poll.id}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:ring-gold hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
                    {status === "active" ? <Clock className="mr-1 h-3 w-3" /> :
                     status === "closed" ? <CheckCircle className="mr-1 h-3 w-3" /> :
                     <BarChart3 className="mr-1 h-3 w-3" />}
                    {status}
                  </span>
                  {poll.isResolution && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      Resolution
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-base font-semibold group-hover:text-gold">{poll.title}</h3>
                {poll.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{poll.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                  <span>{poll.options.length} options</span>
                  <span>{poll.closesAt.toLocaleDateString()}</span>
                </div>
                {poll.isAnonymous && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Anonymous
                  </span>
                )}
              </Link>
            );
          })}
          {polls.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No {params.tab || "active"} polls.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
