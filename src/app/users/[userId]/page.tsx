import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { MembershipTimeline } from "@/components/shared/membership-timeline";
import { UnitLink } from "@/components/shared/unit-link";
import { UserLink } from "@/components/shared/user-link";
import { UserProfileEdit } from "@/components/shared/user-profile-edit";
import { PhoneLink } from "@/components/shared/phone-link";
import { designationTitleLabel } from "@/lib/designation-labels";
import { AdminUserActions } from "@/components/shared/admin-user-actions";
import {
  updateUserProfile,
  updateUserRole,
  deactivateUser,
  reactivateUser,
} from "./actions";
import {
  User,
  Building2,
  Users,
  Award,
  CalendarDays,
  Ticket,
  Vote,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const layoutUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!layoutUser) redirect("/login");

  const isOwnProfile = session.user.id === userId;
  const isAdmin = isAdminRole(layoutUser.globalRole);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      globalRole: true,
      approvalStatus: true,
      isActive: true,
      organization: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      createdAt: true,
      unitMemberships: {
        where: { endDate: null },
        include: { unit: true },
        orderBy: { startDate: "desc" },
      },
      communityMemberships: {
        include: { subCommunity: true },
      },
      designations: {
        where: { endDate: null },
        orderBy: { startDate: "desc" },
      },
      _count: {
        select: {
          votes: true,
          rsvps: true,
          helpTickets: true,
          visitorPasses: true,
        },
      },
    },
  });

  if (!user) notFound();

  const allMemberships = await db.unitMembership.findMany({
    where: { userId },
    include: { unit: true },
    orderBy: { startDate: "desc" },
  });

  // Fetch co-residents (family members in same units)
  const unitIds = user.unitMemberships.map((m) => m.unitId);
  const coResidents = unitIds.length > 0
    ? await db.unitMembership.findMany({
        where: {
          unitId: { in: unitIds },
          userId: { not: userId },
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, globalRole: true } },
          unit: { select: { unitNumber: true } },
        },
        orderBy: { startDate: "desc" },
      })
    : [];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout user={layoutUser}>
    <div className="space-y-6">
      <PageHeader
        feature="directory"
        title="User Profile"
        subtitle={isOwnProfile ? "Your profile" : `Viewing ${user.name}'s profile`}
        action={
          isOwnProfile ? (
            <UserProfileEdit
              user={user}
              onUpdate={async (data) => {
                "use server";
                await updateUserProfile(userId, data);
              }}
            />
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SoftCard>
            <div className="flex items-start gap-4">
              <Avatar size="lg">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                )}
                <AvatarFallback className="bg-gold/10 text-gold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold">
                  {user.name}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <FriendlyBadge value={user.globalRole} variant="semantic" />
                  {user.approvalStatus !== "APPROVED" && (
                    <FriendlyBadge value={user.approvalStatus} variant="semantic" />
                  )}
                  {user.phone && (
                    <PhoneLink phone={user.phone} className="text-sm text-muted-foreground" />
                  )}
                </div>
                {user.organization && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user.organization}
                  </p>
                )}
              </div>
            </div>
          </SoftCard>

          {user.unitMemberships.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold" />
                Current Residence
              </h2>
              <SoftCard className="space-y-3">
                {user.unitMemberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <UnitLink unitNumber={m.unit.unitNumber} />
                      <span className="text-sm text-muted-foreground">
                        Floor {m.unit.floor}, Tower {m.unit.block}
                      </span>
                    </div>
                    <FriendlyBadge value={m.role} variant="semantic" />
                  </div>
                ))}
              </SoftCard>
            </div>
          )}

          {coResidents.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                Family / Co-Residents
              </h2>
              <SoftCard className="space-y-2">
                {coResidents.map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-3">
                      <UserLink
                        userId={cr.user.id}
                        name={cr.user.name}
                        avatarUrl={cr.user.avatarUrl}
                        showAvatar
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {cr.unit.unitNumber}
                      </span>
                      <FriendlyBadge value={cr.role} variant="semantic" />
                    </div>
                  </div>
                ))}
              </SoftCard>
            </div>
          )}

          {allMemberships.length > 0 && (
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
                  perspective="user"
                />
              </SoftCard>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isAdmin && !isOwnProfile && (
            <AdminUserActions
              globalRole={user.globalRole}
              approvalStatus={user.approvalStatus}
              isActive={user.isActive}
              onRoleChange={async (role) => {
                "use server";
                await updateUserRole(userId, role);
              }}
              onDeactivate={async () => {
                "use server";
                await deactivateUser(userId);
              }}
              onReactivate={async () => {
                "use server";
                await reactivateUser(userId);
              }}
            />
          )}

          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">Activity Summary</h2>
            <SoftCard className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Vote className="h-4 w-4" /> Votes Cast
                </span>
                <span className="font-medium">{user._count.votes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Event RSVPs
                </span>
                <span className="font-medium">{user._count.rsvps}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Ticket className="h-4 w-4" /> Help Tickets
                </span>
                <span className="font-medium">{user._count.helpTickets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> Visitor Passes
                </span>
                <span className="font-medium">
                  {user._count.visitorPasses}
                </span>
              </div>
            </SoftCard>
          </div>

          {user.communityMemberships.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                Communities
              </h2>
              <SoftCard className="space-y-2">
                {user.communityMemberships.map((cm) => (
                  <div
                    key={cm.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <span className="text-sm">{cm.subCommunity.name}</span>
                    <FriendlyBadge value={cm.role} variant="semantic" />
                  </div>
                ))}
              </SoftCard>
            </div>
          )}

          {user.designations.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" />
                RWA Designations
              </h2>
              <SoftCard className="space-y-2">
                {user.designations.map((d) => (
                  <div key={d.id} className="text-sm">
                    <p className="font-medium">{designationTitleLabel(d.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      Since {new Date(d.startDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))}
              </SoftCard>
            </div>
          )}

          {user.emergencyContactName && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">Additional Info</h2>
              <SoftCard className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Emergency Contact:
                  </span>{" "}
                  {user.emergencyContactName}
                  {user.emergencyContactPhone && (
                    <>
                      {" ("}
                      <PhoneLink phone={user.emergencyContactPhone} />
                      {")"}
                    </>
                  )}
                </div>
              </SoftCard>
            </div>
          )}

          <SoftCard className="text-xs text-muted-foreground">
            <p>
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
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
