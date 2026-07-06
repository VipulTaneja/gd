import { db } from "@/lib/db";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const facilities = await db.facility.findMany({
    include: {
      _count: { select: { leaders: true, bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Facilities" }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold">Facilities</h1>
        <Link
          href="/admin/facilities/analytics"
          className="inline-flex h-9 min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted sm:min-h-9"
        >
          View analytics
        </Link>
      </div>

      <div className="md:hidden space-y-3">
        {facilities.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No facilities found.
          </div>
        )}
        {facilities.map((f) => (
          <Link
            key={f.id}
            href={`/admin/facilities/${f.id}`}
            className="block rounded-xl border bg-card p-4 hover:bg-muted/30"
          >
            <p className="font-medium text-gold">{f.name}</p>
            {f.location && <p className="text-sm text-muted-foreground">{f.location}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{f._count.leaders} leader{f._count.leaders !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{f._count.bookings} booking{f._count.bookings !== 1 ? "s" : ""}</span>
              {f.requiresApproval && (
                <>
                  <span>·</span>
                  <span className="text-amber-700">Approval required</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Capacity</th>
                <th className="px-4 py-3 text-left font-medium">Leaders</th>
                <th className="px-4 py-3 text-left font-medium">Approval</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/facilities/${f.id}`} className="font-medium text-gold hover:underline">
                      {f.name}
                    </Link>
                    {f.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{f.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{f.location ?? "—"}</td>
                  <td className="px-4 py-3">{f.capacity}</td>
                  <td className="px-4 py-3">{f._count.leaders}</td>
                  <td className="px-4 py-3">
                    {f.requiresApproval ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Required
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Auto-confirm</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/facilities/${f.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-xs font-medium hover:bg-muted"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {facilities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No facilities found.
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
