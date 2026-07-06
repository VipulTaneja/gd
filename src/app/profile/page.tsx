import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

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

  const layoutUser = {
    name: user.name,
    email: user.email,
    globalRole: user.globalRole,
  };

  return (
    <DashboardLayout user={layoutUser}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          feature="directory"
          title="My Profile"
          subtitle={`${user.globalRole} · Member since ${user.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
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
              <p className="mt-1">{user.phone ?? "Not provided"}</p>
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
                  <p className="text-sm text-muted-foreground">{user.emergencyContactPhone}</p>
                )}
              </div>
            )}
            {user.vehiclePlates.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vehicles</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.vehiclePlates.map((plate) => (
                    <span key={plate} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {plate}
                    </span>
                  ))}
                </div>
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
                    <p className="font-medium">{membership.unit.unitNumber}</p>
                    <p className="text-sm text-muted-foreground">Tower {membership.unit.block}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
                    {membership.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
