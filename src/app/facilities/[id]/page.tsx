import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { BookingGrid } from "./booking-grid";
import { PendingBookings } from "@/components/facilities/pending-bookings";

export const dynamic = "force-dynamic";

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const facility = await db.facility.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { startsAt: { gte: new Date() }, status: { not: "CANCELLED" } },
        orderBy: { startsAt: "asc" },
      },
      blackouts: {
        where: { endsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
      },
    },
  });

  if (!facility) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole);

  const membership = await db.unitMembership.findFirst({
    where: { userId: session.user!.id, OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    select: { unitId: true },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <Link href="/facilities" className="text-sm text-muted-foreground hover:text-foreground">← Facilities</Link>

        <div>
          <h1 className="font-heading text-2xl font-bold">{facility.name}</h1>
          {facility.description && <p className="mt-1 text-muted-foreground">{facility.description}</p>}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {facility.location && <span>Location: {facility.location}</span>}
            <span>Slots: {facility.slotMinutes} min</span>
            <span>Capacity: {facility.capacity}</span>
            <span>Book up to {facility.maxAdvDays} days ahead</span>
          </div>
        </div>

        {facility.blackouts.length > 0 && (
          <div className="rounded-xl border bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Maintenance periods:</p>
            {facility.blackouts.map((b) => (
              <p key={b.id} className="text-xs text-amber-700">
                {b.startsAt.toLocaleDateString()} — {b.endsAt.toLocaleDateString()}: {b.reason}
              </p>
            ))}
          </div>
        )}

        <BookingGrid
          facilityId={facility.id}
          slotMinutes={facility.slotMinutes}
          maxAdvDays={facility.maxAdvDays}
          capacity={facility.capacity}
          existingBookings={facility.bookings.map((b) => ({
            id: b.id,
            startsAt: b.startsAt.toISOString(),
            endsAt: b.endsAt.toISOString(),
            status: b.status,
          }))}
          blackouts={facility.blackouts.map((b) => ({
            startsAt: b.startsAt.toISOString(),
            endsAt: b.endsAt.toISOString(),
          }))}
          userUnitId={membership?.unitId || null}
        />

        {isAdmin && facility.requiresApproval && (
          <PendingBookings facilityId={facility.id} />
        )}
      </div>
    </DashboardLayout>
  );
}
