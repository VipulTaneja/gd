import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const dynamic = "force-dynamic";

const priorityStyles: Record<string, string> = {
  EMERGENCY: "bg-red-100 text-red-800",
  IMPORTANT: "bg-amber-100 text-amber-800",
  NORMAL: "bg-gray-100 text-gray-800",
};

export default async function AdminNoticesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notices = await db.notice.findMany({
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Notices" }]} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Manage Notices</h1>
        <Link
          href="/admin/notices/new"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light transition-colors"
        >
          New Notice
        </Link>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Target</th>
                <th className="px-4 py-3 text-left font-medium">Published</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{notice.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[notice.priority]}`}>
                      {notice.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {notice.targetBlock ? `Tower ${notice.targetBlock}` : "All"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {notice.publishedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {notice.expiresAt ? notice.expiresAt.toLocaleDateString() : "Never"}
                  </td>
                </tr>
              ))}
              {notices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No notices found.
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
