import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import { UnitLink } from "@/components/shared/unit-link";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TOWERS = ["A", "B", "C"];

async function getUnits(tower?: string, floor?: string) {
  const where: Record<string, unknown> = {};
  if (tower) where.block = tower;
  if (floor) where.floor = parseInt(floor);

  return db.unit.findMany({
    where,
    orderBy: [{ block: "asc" }, { floor: "asc" }, { unitNumber: "asc" }],
    include: {
      memberships: {
        where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });
}

export default async function AdminUnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ tower?: string; floor?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const units = await getUnits(params.tower, params.floor);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });

  if (!user) redirect("/login");

  const occupiedCount = units.filter((u) => u.memberships.length > 0).length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Unit Management</h1>
            <p className="text-muted-foreground">
              {units.length} units · {occupiedCount} occupied · {units.length - occupiedCount} vacant
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/units"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              !params.tower ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            All Towers
          </Link>
          {TOWERS.map((t) => (
            <Link
              key={t}
              href={`/admin/units?tower=${t}`}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                params.tower === t ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}
            >
              Tower {t}
            </Link>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Unit</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Area</th>
                  <th className="px-4 py-3 text-left font-medium">Parking</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Residents</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <UnitLink unitNumber={unit.unitNumber} />
                    </td>
                    <td className="px-4 py-3">{unit.unitType}</td>
                    <td className="px-4 py-3">{unit.areaSqFt} sq ft</td>
                    <td className="px-4 py-3">{unit.parkingSlots}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        unit.memberships.length > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {unit.memberships.length > 0 ? "Occupied" : "Vacant"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {unit.memberships.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {unit.memberships.map((m, i) => (
                            <UserLink
                              key={i}
                              userId={m.user.id}
                              name={m.user.name}
                              className="text-xs"
                            />
                          ))}
                        </div>
                      ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
