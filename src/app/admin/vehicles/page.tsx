import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const dynamic = "force-dynamic";

async function getVehiclesByUnit() {
  const memberships = await db.unitMembership.findMany({
    where: {
      endDate: null,
      user: { vehiclePlates: { isEmpty: false } },
    },
    include: {
      user: { select: { id: true, name: true, vehiclePlates: true } },
      unit: { select: { unitNumber: true, block: true } },
    },
    orderBy: { unit: { unitNumber: "asc" } },
  });

  return memberships;
}

export default async function AdminVehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await getVehiclesByUnit();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Vehicles" }]} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Vehicles by Unit</h1>
        <span className="text-sm text-muted-foreground">
          {memberships.length} units with registered vehicles
        </span>
      </div>

      <div className="md:hidden space-y-3">
        {memberships.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No vehicles registered.
          </div>
        )}
        {memberships.map((m) => (
          <div key={m.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{m.unit.unitNumber}</p>
                <p className="text-sm text-muted-foreground">Tower {m.unit.block}</p>
              </div>
              <p className="text-sm">{m.user.name}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {m.user.vehiclePlates.map((plate: string) => (
                <span key={plate} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-mono">
                  {plate}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Tower</th>
                <th className="px-4 py-3 text-left font-medium">Resident</th>
                <th className="px-4 py-3 text-left font-medium">Vehicles</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{m.unit.unitNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">Tower {m.unit.block}</td>
                  <td className="px-4 py-3">{m.user.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.user.vehiclePlates.map((plate: string) => (
                        <span key={plate} className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {plate}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {memberships.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No vehicles registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
