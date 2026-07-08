import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage({
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
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;

  const tickets = await db.helpTicket.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">All Tickets</h1>

        <div className="flex flex-wrap gap-2">
          {[["", "All"], ["OPEN", "Open"], ["IN_PROGRESS", "In Progress"], ["RESOLVED", "Resolved"]].map(([key, label]) => (
            <Link key={key} href={key ? `/admin/tickets?status=${key}` : "/admin/tickets"}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                (params.status || "") === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Subject</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Created By</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${ticket.id}`} className="font-medium text-gold hover:underline">
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge value={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.priority}</td>
                    <td className="px-4 py-3">
                      <UserLink
                        userId={ticket.user.id}
                        name={ticket.user.name}
                        avatarUrl={ticket.user.avatarUrl}
                      />
                      <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
