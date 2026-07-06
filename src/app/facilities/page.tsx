import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const facilities = await db.facility.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Community Amenities</h1>
        <p className="text-muted-foreground">Book your favourite spaces — pool, theatre, cricket pitch, and more.</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <Link key={f.id} href={`/facilities/${f.id}`}
              className="group rounded-xl border bg-card p-6 transition-all hover:ring-gold hover:shadow-lg">
              <h3 className="font-heading text-lg font-semibold group-hover:text-gold">{f.name}</h3>
              {f.description && <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>}
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {f.location && <p>Location: {f.location}</p>}
                <p>Slots: {f.slotMinutes} min · Capacity: {f.capacity}</p>
                <p>Book up to {f.maxAdvDays} days ahead</p>
                {f.requiresApproval && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Requires Approval
                  </span>
                )}
              </div>
            </Link>
          ))}
          {facilities.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No facilities available for booking.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
