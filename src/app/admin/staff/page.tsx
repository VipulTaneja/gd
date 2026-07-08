import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/rbac";
import { staffRoleLabel } from "@/lib/staff";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ society?: string; needsReview?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await isAdmin(session.user.id))) redirect("/");

  const params = await searchParams;
  const societyOnly = params.society === "1";
  const needsReviewOnly = params.needsReview === "1";

  const people = await db.staffPerson.findMany({
    include: {
      associations: {
        where: needsReviewOnly ? { needsReview: true } : undefined,
        include: { unit: { select: { unitNumber: true } } },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { name: "asc" },
  });

  const filtered = people.filter((p) => {
    if (needsReviewOnly && p.associations.length === 0) return false;
    if (societyOnly) {
      return p.associations.some((a) => a.scope === "SOCIETY");
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Staff registry" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Staff registry</h1>
          <p className="text-sm text-muted-foreground">All staff persons and associations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/staff"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              !societyOnly && !needsReviewOnly ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/staff?society=1"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              societyOnly ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            Society staff
          </Link>
          <Link
            href="/admin/staff?needsReview=1"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              needsReviewOnly ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            Needs review
          </Link>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No staff found.
          </div>
        )}
        {filtered.map((person) => (
          <div key={person.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-muted-foreground">{person.phone}</p>
              </div>
              <Link href={`/admin/staff/${person.id}`} className="text-sm text-gold hover:underline shrink-0">
                View
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {person.associations.slice(0, 3).map((a) => (
                <span key={a.id} className="inline-flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5">
                  {a.unit?.unitNumber ?? "Society"} · {staffRoleLabel(a.role)}
                  {a.needsReview && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      Needs review
                    </span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{person._count.reviews} review{person._count.reviews === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Associations</th>
                <th className="p-3 text-left">Reviews</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr key={person.id} className="border-t">
                  <td className="p-3 font-medium">{person.name}</td>
                  <td className="p-3">{person.phone}</td>
                  <td className="p-3">
                    {person.associations.slice(0, 3).map((a) => (
                      <span key={a.id} className="mr-2 inline-flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5">
                        {a.unit?.unitNumber ?? "Society"} · {staffRoleLabel(a.role)}
                        {a.needsReview && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            Needs review
                          </span>
                        )}
                      </span>
                    ))}
                  </td>
                  <td className="p-3">{person._count.reviews}</td>
                  <td className="p-3">
                    <Link href={`/admin/staff/${person.id}`} className="text-gold hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
