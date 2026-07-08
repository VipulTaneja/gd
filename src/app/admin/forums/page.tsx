import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserLink } from "@/components/shared/user-link";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import Link from "next/link";
import { hidePost, deletePost, resolveReport, dismissReport } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminForumsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status || "OPEN";

  const reports = await db.forumReport.findMany({
    where: { status: statusFilter as "OPEN" | "RESOLVED" | "DISMISSED" },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      post: {
        select: {
          id: true,
          body: true,
          thread: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Forum Reports</h1>

      <div className="flex flex-wrap gap-2">
        {[["OPEN", "Open"], ["RESOLVED", "Resolved"], ["DISMISSED", "Dismissed"]].map(
          ([key, label]) => (
            <Link
              key={key}
              href={`/admin/forums?status=${key}`}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                statusFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "border border-input hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          )
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Reporter</th>
                <th className="px-4 py-3 text-left font-medium">Post Excerpt</th>
                <th className="px-4 py-3 text-left font-medium">Thread</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <UserLink
                      userId={report.reporter.id}
                      name={report.reporter.name}
                      avatarUrl={report.reporter.avatarUrl}
                    />
                    <p className="text-xs text-muted-foreground">
                      {report.reporter.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[250px]">
                    <p className="truncate text-muted-foreground">
                      {report.post.body.slice(0, 150)}
                      {report.post.body.length > 150 && "..."}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/forums/${report.post.thread.id}`}
                      className="font-medium text-gold hover:underline"
                    >
                      {report.post.thread.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="truncate">{report.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge value={report.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {report.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "OPEN" && (
                      <div className="flex gap-1">
                        <form action={resolveReport.bind(null, report.id)}>
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        </form>
                        <form action={dismissReport.bind(null, report.id)}>
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-xs font-medium hover:bg-muted"
                          >
                            Dismiss
                          </button>
                        </form>
                        <form action={hidePost.bind(null, report.post.id)}>
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-600 px-3 text-xs font-medium text-white hover:bg-amber-700"
                          >
                            Hide
                          </button>
                        </form>
                        <form action={deletePost.bind(null, report.post.id)}>
                          <button
                            type="submit"
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
