import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import Link from "next/link";
import { AssignMemberForm } from "./assign-form";
import { InviteMemberForm } from "./invite-member-form";
import { TransferOwnershipButton } from "./transfer-button";
import { EditMembershipButton } from "./edit-membership-button";
import { AssignUnitLeaderForm } from "./assign-leader-form";

export const dynamic = "force-dynamic";

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const unit = await db.unit.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      memberships: {
        orderBy: [{ endDate: "asc" }, { startDate: "desc" }],
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!unit) notFound();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });

  if (!user) redirect("/login");

  const isSuperAdmin = user.globalRole === "SUPER_ADMIN";

  const activeMemberships = unit.memberships.filter(
    (m) => !m.endDate || m.endDate > new Date(),
  );
  const pastMemberships = unit.memberships.filter(
    (m) => m.endDate && m.endDate <= new Date(),
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/units" className="text-sm text-muted-foreground hover:text-foreground">
            ← Units
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{unit.unitNumber}</h1>
            <p className="text-muted-foreground">
              Tower {unit.block} · Floor {unit.floor} · {unit.unitType} · {unit.areaSqFt} sq ft
            </p>
          </div>
          <TransferOwnershipButton unitId={unit.id} />
        </div>

        {isSuperAdmin && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Unit Leader</h2>
            <AssignUnitLeaderForm
              unitId={unit.id}
              currentLeader={unit.leader}
              members={activeMemberships.map((m) => m.user)}
            />
          </div>
        )}

        {/* Active Members */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Active Residents</h2>
          {activeMemberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active residents</p>
          ) : (
            <div className="space-y-3">
              {activeMemberships.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <UserLink userId={m.user.id} name={m.user.name} className="font-medium" />
                    <p className="text-xs text-muted-foreground">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {m.role.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Since {m.startDate.toLocaleDateString()}
                    </span>
                    {m.isPrimary && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Primary
                      </span>
                    )}
                    <EditMembershipButton
                      membershipId={m.id}
                      unitId={unit.id}
                      currentRole={m.role}
                      currentIsPrimary={m.isPrimary}
                      currentEndDate={m.endDate?.toISOString() ?? null}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parking Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Parking</h2>
          <p className="text-sm text-muted-foreground">
            {unit.parkingSlots} parking slot(s) assigned to this unit
          </p>
        </div>

        {/* Assign New Member */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Assign Resident</h2>
          <AssignMemberForm unitId={unit.id} />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Invite via audit trail</h2>
          <InviteMemberForm unitId={unit.id} />
        </div>

        {/* Past Memberships */}
        {pastMemberships.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Membership History</h2>
            <div className="space-y-2">
              {pastMemberships.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3 opacity-60">
                  <div>
                    <UserLink userId={m.user.id} name={m.user.name} className="font-medium" />
                    <p className="text-xs text-muted-foreground">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{m.role.replace("_", " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.startDate.toLocaleDateString()} — {m.endDate?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
