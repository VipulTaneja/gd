import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { LeaderHub, LeaderHubHeader } from "@/components/leader/leader-hub";
import { AmenityLeaderQueue } from "@/components/facilities/my-bookings";
import { getLeaderScopes, hasAnyLeaderScope } from "@/lib/leader-scopes";
import { isAdmin } from "@/lib/rbac";
import { canManageFaq } from "@/lib/faq-auth";

export const dynamic = "force-dynamic";

export default async function LeaderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const scopes = await getLeaderScopes(session.user.id);
  const [canEditFaq, isUserAdmin] = await Promise.all([
    canManageFaq(session.user.id),
    isAdmin(session.user.id),
  ]);
  if (!hasAnyLeaderScope(scopes) && !isUserAdmin && !canEditFaq) {
    redirect("/");
  }

  const [communities, facilities, pendingQueue] = await Promise.all([
    scopes.communityLeaderIds.length > 0
      ? db.subCommunity.findMany({
          where: { id: { in: scopes.communityLeaderIds }, isArchived: false },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    scopes.amenityLeaderFacilityIds.length > 0
      ? db.facility.findMany({
          where: { id: { in: scopes.amenityLeaderFacilityIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    scopes.amenityLeaderFacilityIds.length > 0
      ? db.facilityBooking.findMany({
          where: {
            facilityId: { in: scopes.amenityLeaderFacilityIds },
            status: "PENDING_APPROVAL",
            startsAt: { gte: new Date() },
          },
          include: {
            facility: { select: { id: true, name: true } },
            user: { select: { id: true, name: true } },
          },
          orderBy: { startsAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const pendingMap = new Map<string, number>();
  for (const booking of pendingQueue) {
    pendingMap.set(booking.facilityId, (pendingMap.get(booking.facilityId) ?? 0) + 1);
  }

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <LeaderHubHeader />
        <AmenityLeaderQueue
          bookings={pendingQueue.map((b) => ({
            id: b.id,
            startsAt: b.startsAt.toISOString(),
            endsAt: b.endsAt.toISOString(),
            facility: b.facility,
            user: b.user,
          }))}
        />
        <LeaderHub
          ledUnitNumber={scopes.ledUnitNumber}
          communityLeaders={communities}
          amenityFacilities={facilities.map((f) => ({
            id: f.id,
            name: f.name,
            pendingCount: pendingMap.get(f.id) ?? 0,
          }))}
          canManageFaq={canEditFaq}
        />
      </div>
    </DashboardLayout>
  );
}
