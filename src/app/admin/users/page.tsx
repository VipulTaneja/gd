import { db } from "@/lib/db";
import { UserLink } from "@/components/shared/user-link";
import { UnitLink } from "@/components/shared/unit-link";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { ApproveUserButton, RejectUserButton, DeactivateUserButton, ChangeRoleSelect, ApproveClaimButton, RejectClaimButton, EditUserButton } from "./actions";

export const dynamic = "force-dynamic";

async function getUsers(filter?: string) {
  const where = filter === "pending" ? { approvalStatus: "PENDING" as const } : {};
  return db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      globalRole: true,
      approvalStatus: true,
      isActive: true,
      phone: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      createdAt: true,
      unitMemberships: {
        select: { unit: true },
        where: { endDate: null },
      },
    },
  });
}

async function getPendingClaims() {
  const users = await db.user.findMany({
    where: { claimStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const unitIds = users
    .map((user) => user.claimedUnitId)
    .filter((id): id is string => Boolean(id));

  const units =
    unitIds.length > 0
      ? await db.unit.findMany({ where: { id: { in: unitIds } } })
      : [];

  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  return users.map((user) => ({
    ...user,
    claimedUnit: user.claimedUnitId ? unitById.get(user.claimedUnitId) : null,
  }));
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const isClaimsView = params.filter === "claims";

  const [users, claims] = await Promise.all([
    isClaimsView ? [] : getUsers(params.filter),
    isClaimsView ? getPendingClaims() : [],
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <a
            href="/admin/users"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              !params.filter ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            All
          </a>
          <a
            href="/admin/users?filter=pending"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              params.filter === "pending" ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            Pending
          </a>
          <a
            href="/admin/users?filter=claims"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              params.filter === "claims" ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            Claims
          </a>
        </div>
      </div>

      {isClaimsView ? (
        <>
          <div className="md:hidden space-y-3">
            {claims.length === 0 && (
              <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
                No pending claims.
              </div>
            )}
            {claims.map((user) => (
              <div key={user.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <UserLink userId={user.id} name={user.name} />
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <FriendlyBadge value={user.claimStatus ?? "PENDING"} variant="semantic" />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Claimed Unit: </span>
                  {user.claimedUnit?.unitNumber ?? "—"}
                </div>
                <div className="flex justify-end gap-2">
                  <ApproveClaimButton userId={user.id} unitId={user.claimedUnitId ?? ""} />
                  <RejectClaimButton userId={user.id} />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Claimed Unit</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <UserLink userId={user.id} name={user.name} />
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.claimedUnit?.unitNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <FriendlyBadge value={user.claimStatus ?? "PENDING"} variant="semantic" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <ApproveClaimButton userId={user.id} unitId={user.claimedUnitId ?? ""} />
                          <RejectClaimButton userId={user.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        No pending claims.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {users.length === 0 && (
              <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
                No users found.
              </div>
            )}
            {users.map((user) => (
              <div key={user.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <UserLink
                      userId={user.id}
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                    />
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <FriendlyBadge value={user.approvalStatus} variant="semantic" />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role: </span>
                    {user.globalRole}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unit: </span>
                    {user.unitMemberships[0]?.unit.unitNumber ? (
                      <UnitLink unitNumber={user.unitMemberships[0].unit.unitNumber} />
                    ) : "—"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Joined: </span>
                    {user.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {user.approvalStatus === "PENDING" && (
                    <>
                      <ApproveUserButton userId={user.id} />
                      <RejectUserButton userId={user.id} />
                    </>
                  )}
                  {user.isActive && user.approvalStatus !== "PENDING" && (
                    <>
                      <EditUserButton
                        userId={user.id}
                        currentName={user.name}
                        currentPhone={user.phone ?? ""}
                        currentEmergencyName={user.emergencyContactName ?? ""}
                        currentEmergencyPhone={user.emergencyContactPhone ?? ""}
                      />
                      <DeactivateUserButton userId={user.id} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Unit</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <UserLink
                          userId={user.id}
                          name={user.name}
                          avatarUrl={user.avatarUrl}
                        />
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ChangeRoleSelect userId={user.id} currentRole={user.globalRole} />
                      </td>
                      <td className="px-4 py-3">
                        <FriendlyBadge value={user.approvalStatus} variant="semantic" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.unitMemberships[0]?.unit.unitNumber ? (
                          <UnitLink unitNumber={user.unitMemberships[0].unit.unitNumber} />
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {user.approvalStatus === "PENDING" && (
                            <>
                              <ApproveUserButton userId={user.id} />
                              <RejectUserButton userId={user.id} />
                            </>
                          )}
                          {user.isActive && user.approvalStatus !== "PENDING" && (
                            <>
                              <EditUserButton
                                userId={user.id}
                                currentName={user.name}
                                currentPhone={user.phone ?? ""}
                                currentEmergencyName={user.emergencyContactName ?? ""}
                                currentEmergencyPhone={user.emergencyContactPhone ?? ""}
                              />
                              <DeactivateUserButton userId={user.id} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
