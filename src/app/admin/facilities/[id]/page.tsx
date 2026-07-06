import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { UserLink } from "@/components/shared/user-link";
import { FacilityEditForm } from "../facility-edit-form";
import { AssignLeaderForm } from "../assign-leader-form";
import { RemoveLeaderButton } from "../remove-leader-button";

export const dynamic = "force-dynamic";

export default async function AdminFacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [facility, currentUser] = await Promise.all([
    db.facility.findUnique({
      where: { id },
      include: {
        leaders: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true } },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { globalRole: true },
    }),
  ]);

  if (!facility) notFound();

  const isSuperAdmin = currentUser?.globalRole === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Facilities", href: "/admin/facilities" },
          { label: facility.name },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{facility.name}</h1>
          {facility.description && (
            <p className="text-muted-foreground">{facility.description}</p>
          )}
        </div>
        <Link
          href={`/facilities/${facility.id}`}
          className="inline-flex h-9 min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted sm:min-h-9"
        >
          View resident page
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Facility settings</h2>
        <FacilityEditForm facility={facility} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">
          Amenity leaders ({facility.leaders.length})
        </h2>

        {isSuperAdmin ? (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              Super Admin only — assign approved residents as amenity leaders for this facility.
            </p>
            <AssignLeaderForm facilityId={facility.id} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Only Super Admin can assign or remove amenity leaders.
          </p>
        )}

        <div className="space-y-2">
          {facility.leaders.map((leader) => (
            <div
              key={leader.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <UserLink userId={leader.user.id} name={leader.user.name} className="font-medium" />
                <p className="text-xs text-muted-foreground">{leader.user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned {leader.assignedAt.toLocaleDateString()}
                  {leader.assignedBy && (
                    <> by <UserLink userId={leader.assignedBy.id} name={leader.assignedBy.name} /></>
                  )}
                </p>
              </div>
              {isSuperAdmin && (
                <RemoveLeaderButton
                  facilityId={facility.id}
                  userId={leader.user.id}
                  userName={leader.user.name}
                />
              )}
            </div>
          ))}
          {facility.leaders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No amenity leaders assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
