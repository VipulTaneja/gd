import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/rbac";
import { staffRoleLabel } from "@/lib/staff";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Staff registry</h1>
          <p className="text-sm text-muted-foreground">All staff persons and associations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/staff" className="rounded-lg border px-3 py-2 text-sm">All</Link>
          <Link href="/admin/staff?society=1" className="rounded-lg border px-3 py-2 text-sm">Society staff</Link>
          <Link href="/admin/staff?needsReview=1" className="rounded-lg border px-3 py-2 text-sm">Needs review</Link>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
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
                    <span key={a.id} className="mr-2 text-xs bg-muted rounded px-2 py-0.5">
                      {a.unit?.unitNumber ?? "Society"} · {staffRoleLabel(a.role)}
                      {a.needsReview ? " ⚠" : ""}
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
  );
}
