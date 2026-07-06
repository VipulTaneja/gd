import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LifeBuoy } from "lucide-react";
import { nav, actions, empty, statusLabels } from "@/lib/microcopy";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const filters: [string, string][] = [
  ["", "All"],
  ["OPEN", statusLabels.OPEN],
  ["IN_PROGRESS", statusLabels.IN_PROGRESS],
  ["RESOLVED", statusLabels.RESOLVED],
  ["CLOSED", statusLabels.CLOSED],
];

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const params = await searchParams;
  const where: Record<string, unknown> = { userId: session.user!.id };
  if (params.status) where.status = params.status;

  const tickets = await db.helpTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="tickets"
          title={nav.tickets}
          subtitle="Something broken? We'll sort it out."
          action={
            <Link
              href="/tickets/new"
              className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
            >
              {actions.newTicket}
            </Link>
          }
        />

        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {filters.map(([key, label]) => (
            <Link
              key={key}
              href={key ? `/tickets?status=${key}` : "/tickets"}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-all",
                (params.status || "") === key
                  ? "bg-rose-100 text-rose-700 shadow-sm"
                  : "bg-card ring-1 ring-foreground/5 hover:bg-muted"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <SoftCard className="transition-all hover:shadow-md hover:ring-rose-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FriendlyBadge value={ticket.status} variant="status" />
                      <span className="text-xs text-muted-foreground">{ticket.category}</span>
                      <StatusBadge status={ticket.priority} />
                    </div>
                    <h3 className="mt-2 font-heading text-base font-semibold">{ticket.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {ticket.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </SoftCard>
            </Link>
          ))}
          {tickets.length === 0 && (
            <EmptyState
              icon={LifeBuoy}
              title={empty.tickets.title}
              description={empty.tickets.description}
              action={{ label: actions.newTicket, href: "/tickets/new" }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
