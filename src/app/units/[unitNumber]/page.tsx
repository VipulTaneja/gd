import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { UserLink } from "@/components/shared/user-link";
import { MembershipTimeline } from "@/components/shared/membership-timeline";
import { AdminUnitActions } from "@/components/shared/admin-unit-actions";
import { UnitHouseholdStaff } from "@/components/units/unit-household-staff";
import { UnitPetsSection } from "@/components/units/unit-pets-section";
import { UnitVehiclesSection } from "@/components/units/unit-vehicles-section";
import { UnitLeaderPanel } from "@/components/units/unit-leader-panel";
import { towerBalloonStyles } from "@/lib/directory-layout";
import { assignResident, generateDue } from "./actions";
import {
  cancelUnitInviteAction,
  getPendingInvitesForUnit,
  inviteUnitMemberAction,
  searchUsersForInvite,
} from "./leader-actions";
import { hasActiveUnitRole } from "@/lib/rbac";
import { isUnitLeader } from "@/lib/rbac-leaders";
import {
  Building2,
  Users,
  CreditCard,
  Ticket,
  DoorOpen,
  CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UnitProfilePage({
  params,
}: {
  params: Promise<{ unitNumber: string }>;
}) {
  const { unitNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const layoutUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!layoutUser) redirect("/login");

  const isAdminUser = isAdminRole(layoutUser.globalRole);

  const unit = await db.unit.findUnique({
    where: { unitNumber },
    include: {
      leader: { select: { id: true, name: true } },
      memberships: {
        where: { endDate: null },
        include: { user: true },
        orderBy: [{ isPrimary: "desc" }, { startDate: "asc" }],
      },
      dues: {
        orderBy: { dueDate: "desc" },
        take: 5,
      },
      visitorPasses: {
        where: { status: "ACTIVE" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      pets: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { name: "asc" },
      },
      vehicles: {
        include: { registeredByUser: { select: { id: true, name: true } } },
        orderBy: { registrationNumber: "asc" },
      },
    },
  });

  if (!unit) notFound();

  const isMember = await hasActiveUnitRole(session.user.id, unit.id);
  const isLeader = await isUnitLeader(session.user.id, unit.id);
  const canViewSensitive = isAdminUser || isMember;
  const canEditAssets = isAdminUser || isMember;

  const pendingInvites =
    isLeader || isAdminUser
      ? await getPendingInvitesForUnit(unit.id, session.user.id)
      : [];

  const allMemberships = canViewSensitive
    ? await db.unitMembership.findMany({
        where: { unitId: unit.id },
        include: { user: true },
        orderBy: { startDate: "desc" },
      })
    : [];

  const openTickets = canViewSensitive
    ? await db.helpTicket.findMany({
        where: {
          unitId: unit.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const pendingDues = unit.dues.filter((d) => d.status === "PENDING");
  const totalPending = pendingDues.reduce(
    (sum, d) => sum + Number(d.amount),
    0
  );

  const tower = unit.unitNumber.charAt(0);

  return (
    <DashboardLayout user={layoutUser}>
    <div className="space-y-6">
      <PageHeader
        feature="directory"
        title="Unit Profile"
        subtitle={`Details for unit ${unitNumber}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SoftCard>
            <div className="flex items-start gap-4">
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-xl border text-xl font-bold ${
                  towerBalloonStyles[tower]?.floorBadge ?? "bg-muted"
                }`}
              >
                {tower}
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold">
                  {unit.unitNumber}
                </h2>
                {unit.leader && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Unit leader:{" "}
                    <UserLink userId={unit.leader.id} name={unit.leader.name} />
                  </p>
                )}
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> Tower {unit.block}
                  </span>
                  <span>Floor {unit.floor}</span>
                  <span>{unit.unitType}</span>
                  {unit.areaSqFt && <span>{unit.areaSqFt} sq ft</span>}
                  <span>{unit.parkingSlots} parking</span>
                </div>
              </div>
            </div>
          </SoftCard>

          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              Current Residents ({unit.memberships.length})
            </h2>
            <SoftCard className="space-y-2">
              {unit.memberships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No residents assigned
                </p>
              ) : (
                unit.memberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <UserLink
                      userId={m.user.id}
                      name={m.user.name}
                      avatarUrl={m.user.avatarUrl}
                      showAvatar
                    />
                    <div className="flex items-center gap-2">
                      <FriendlyBadge value={m.role} variant="semantic" />
                      {m.isPrimary && (
                        <FriendlyBadge value="PRIMARY" variant="semantic" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </SoftCard>
          </div>

          {isLeader && (
            <UnitLeaderPanel
              unitId={unit.id}
              unitNumber={unitNumber}
              pendingInvites={pendingInvites.map((inv) => ({
                id: inv.id,
                requestedRole: inv.requestedRole,
                user: inv.user,
                createdAt: inv.createdAt.toISOString(),
              }))}
              onSearch={async (q) => searchUsersForInvite(unit.id, q)}
              onInvite={async (userId, role) =>
                inviteUnitMemberAction(unit.id, userId, role)
              }
              onCancel={cancelUnitInviteAction}
            />
          )}

          {canViewSensitive && (
          <>
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              Membership History
            </h2>
            <SoftCard>
              <MembershipTimeline
                memberships={allMemberships.map((m) => ({
                  ...m,
                  startDate: m.startDate.toISOString(),
                  endDate: m.endDate?.toISOString() ?? null,
                }))}
                perspective="unit"
              />
            </SoftCard>
          </div>

          <UnitHouseholdStaff unitId={unit.id} />

          <UnitPetsSection
            unitNumber={unitNumber}
            canEdit={canEditAssets}
            pets={unit.pets.map((p) => ({
              id: p.id,
              name: p.name,
              petType: p.petType,
              breed: p.breed,
              color: p.color,
              ageYears: p.ageYears,
              gender: p.gender,
              vaccinationExpiry: p.vaccinationExpiry?.toISOString() ?? null,
              notes: p.notes,
              user: p.user,
            }))}
          />

          <UnitVehiclesSection
            unitNumber={unitNumber}
            canEdit={canEditAssets}
            vehicles={unit.vehicles.map((v) => ({
              id: v.id,
              vehicleType: v.vehicleType,
              registrationNumber: v.registrationNumber,
              make: v.make,
              model: v.model,
              color: v.color,
              registeredByUser: v.registeredByUser,
            }))}
          />
          </>
          )}

          {!canViewSensitive && (
            <SoftCard className="text-sm text-muted-foreground">
              Dues, pets, vehicles, and tickets are visible to unit members only.
            </SoftCard>
          )}
        </div>

        <div className="space-y-6">
          {isAdminUser && (
            <AdminUnitActions
              onAssignResident={async (data) => {
                "use server";
                await assignResident(unitNumber, data);
              }}
              onGenerateDue={async (data) => {
                "use server";
                await generateDue(unitNumber, data);
              }}
            />
          )}

          {canViewSensitive && (
          <>
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold" />
              Dues Summary
            </h2>
            <SoftCard>
              {pendingDues.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-center py-3">
                    <p className="text-2xl font-heading font-bold text-gold">
                      ₹{totalPending.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pendingDues.length} pending due{pendingDues.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {pendingDues.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-sm rounded-lg border p-2"
                    >
                      <span>{d.label}</span>
                      <span className="font-medium">
                        ₹{Number(d.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending dues
                </p>
              )}
            </SoftCard>
          </div>

          {openTickets.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-gold" />
                Open Tickets ({openTickets.length})
              </h2>
              <SoftCard className="space-y-2">
                {openTickets.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border p-2 text-sm"
                  >
                    <p className="font-medium">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <FriendlyBadge value={t.status} variant="status" />
                      <span>
                        by{" "}
                        <UserLink userId={t.user.id} name={t.user.name} />
                      </span>
                    </div>
                  </div>
                ))}
              </SoftCard>
            </div>
          )}

          {unit.visitorPasses.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-gold" />
                Active Visitor Passes
              </h2>
              <SoftCard className="space-y-2">
                {unit.visitorPasses.map((vp) => (
                  <div
                    key={vp.id}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{vp.visitorName}</p>
                      <p className="text-xs text-muted-foreground">
                        by{" "}
                        <UserLink userId={vp.user.id} name={vp.user.name} />
                      </p>
                    </div>
                    <FriendlyBadge value="ACTIVE" variant="status" />
                  </div>
                ))}
              </SoftCard>
            </div>
          )}
          </>
          )}

          <SoftCard className="text-xs text-muted-foreground">
            <p>
              Created{" "}
              {new Date(unit.createdAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
