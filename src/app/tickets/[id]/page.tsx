import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { getSLADeadline, getSLAStatus } from "@/lib/tickets";
import { RichTextContent } from "@/components/shared/rich-text-content";
import { CommentForm } from "./comment-form";
import { StatusButtons } from "./status-buttons";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const ticket = await db.helpTicket.findUnique({
    where: { id },
    include: {
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const isOwner = ticket.userId === session.user!.id;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole);

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Breadcrumb items={[{ label: "Tickets", href: "/tickets" }, { label: ticket.subject }]} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[ticket.status]}`}>
                {ticket.status.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-muted-foreground">{ticket.category}</span>
              <span className="text-xs text-muted-foreground">Priority: {ticket.priority}</span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-bold">{ticket.subject}</h1>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <RichTextContent content={ticket.description} />
          <p className="mt-4 text-xs text-muted-foreground">
            Created {ticket.createdAt.toLocaleString()}
            {ticket.resolvedAt && ` · Resolved ${ticket.resolvedAt.toLocaleString()}`}
          </p>
          {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                getSLAStatus(ticket.createdAt, ticket.priority) === "breached"
                  ? "bg-red-100 text-red-800"
                  : getSLAStatus(ticket.createdAt, ticket.priority) === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {getSLAStatus(ticket.createdAt, ticket.priority) === "breached"
                  ? "SLA Breached"
                  : `SLA: ${getSLADeadline(ticket.createdAt, ticket.priority).toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        {(isOwner || isAdmin) && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Actions</h2>
            <StatusButtons ticketId={ticket.id} currentStatus={ticket.status} />
          </div>
        )}

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">
            Comments ({ticket.comments.length})
          </h2>
          <div className="space-y-4">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserLink
                    userId={comment.author.id}
                    name={comment.author.name}
                    avatarUrl={comment.author.avatarUrl}
                    showAvatar
                  />
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleString()}
                  </span>
                </div>
                <RichTextContent content={comment.body} />
              </div>
            ))}
            {ticket.comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            )}
          </div>
          <div className="mt-4">
            <CommentForm ticketId={ticket.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
