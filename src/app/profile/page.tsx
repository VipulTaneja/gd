import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { PhoneLink } from "@/components/shared/phone-link";
import { UnitLink } from "@/components/shared/unit-link";
import { UnitInviteCard } from "@/components/profile/unit-invite-card";
import { OwnerConsentCard } from "@/components/profile/owner-consent-card";
import { MyFacilityBookings } from "@/components/facilities/my-bookings";
import {
  acceptUnitInviteAction,
  approveTenantInviteAction,
  declineUnitInviteAction,
  getOwnerConsentInvitesForUser,
  getPendingInvitesForUser,
} from "@/app/profile/invite-actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      unitMemberships: {
        where: { endDate: null },
        include: { unit: true },
      },
    },
  });

  if (!user) redirect("/login");

  const [pendingInvites, ownerConsentInvites, myBookings] = await Promise.all([
    getPendingInvitesForUser(user.id),
    getOwnerConsentInvitesForUser(user.id),
    db.facilityBooking.findMany({
      where: {
        userId: user.id,
        startsAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // eslint-disable-line react-hooks/purity -- Server Component, runs once per request
        status: { in: ["CONFIRMED", "PENDING_APPROVAL", "REJECTED"] },
      },
      include: { facility: { select: { id: true, name: true } } },
      orderBy: { startsAt: "desc" },
      take: 10,
    }),
  ]);

  const layoutUser = {
    name: user.name,
    email: user.email,
    globalRole: user.globalRole,
  };

  return (
    <DashboardLayout user={layoutUser}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          feature="profile"
          title="My Profile"
          subtitle={`${user.globalRole} · Member since ${user.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
        />

        <OwnerConsentCard
          invites={ownerConsentInvites.map((inv) => ({
            id: inv.id,
            requestedRole: inv.requestedRole,
            unit: inv.unit,
            user: inv.user,
            invitedBy: inv.invitedBy,
          }))}
          onApprove={approveTenantInviteAction}
        />

        <UnitInviteCard
          invites={pendingInvites.map((inv) => ({
            id: inv.id,
            requestedRole: inv.requestedRole,
            unit: inv.unit,
            invitedBy: inv.invitedBy,
            expiresAt: inv.expiresAt?.toISOString() ?? null,
            ownerConsent: inv.ownerConsent,
          }))}
          onAccept={acceptUnitInviteAction}
          onDecline={declineUnitInviteAction}
        />

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 pt-4 border-t sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="mt-1">
                {user.phone ? <PhoneLink phone={user.phone} /> : "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <FriendlyBadge value={user.approvalStatus} variant="status" />
              </div>
            </div>
            {user.emergencyContactName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                <p className="mt-1">{user.emergencyContactName}</p>
                {user.emergencyContactPhone && (
                  <p className="text-sm text-muted-foreground">
                    <PhoneLink phone={user.emergencyContactPhone} />
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {user.unitMemberships.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">My Unit(s)</h3>
            <div className="space-y-3">
              {user.unitMemberships.map((membership) => (
                <div key={membership.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <UnitLink unitNumber={membership.unit.unitNumber} className="font-medium" />
                    <p className="text-sm text-muted-foreground">Tower {membership.unit.block}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage pets & vehicles on your unit profile
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                    {membership.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <MyFacilityBookings
          bookings={myBookings.map((b) => ({
            id: b.id,
            startsAt: b.startsAt.toISOString(),
            endsAt: b.endsAt.toISOString(),
            status: b.status,
            rejectionReason: b.rejectionReason,
            facility: b.facility,
          }))}
        />
      </div>
    </DashboardLayout>
  );
}
