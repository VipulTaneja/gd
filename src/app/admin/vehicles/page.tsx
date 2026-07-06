import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { UserLink } from "@/components/shared/user-link";
import { UnitLink } from "@/components/shared/unit-link";
import { vehicleTypeLabels } from "@/lib/unit-assets-labels";

export const dynamic = "force-dynamic";

async function getVehiclesByUnit() {
  return db.vehicle.findMany({
    include: {
      unit: { select: { unitNumber: true, block: true } },
      registeredByUser: { select: { id: true, name: true } },
    },
    orderBy: [{ unit: { unitNumber: "asc" } }, { registrationNumber: "asc" }],
  });
}

export default async function AdminVehiclesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const vehicles = await getVehiclesByUnit();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Vehicles" }]} />

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Vehicles by Unit</h1>
        <span className="text-sm text-muted-foreground">
          {vehicles.length} registered vehicle{vehicles.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="md:hidden space-y-3">
        {vehicles.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No vehicles registered.
          </div>
        )}
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono font-semibold">{v.registrationNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicleTypeLabels[v.vehicleType]}
                  {[v.make, v.model].filter(Boolean).length > 0 && (
                    <> · {[v.make, v.model].filter(Boolean).join(" ")}</>
                  )}
                  {v.color && <> · {v.color}</>}
                </p>
              </div>
              <UnitLink unitNumber={v.unit.unitNumber} />
            </div>
            <p className="text-xs text-muted-foreground">
              Tower {v.unit.block} ·{" "}
              <UserLink userId={v.registeredByUser.id} name={v.registeredByUser.name} />
            </p>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Registration</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Make / Model</th>
                <th className="px-4 py-3 text-left font-medium">Color</th>
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Registered by</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">{v.registrationNumber}</td>
                  <td className="px-4 py-3">{vehicleTypeLabels[v.vehicleType]}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[v.make, v.model].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.color ?? "—"}</td>
                  <td className="px-4 py-3">
                    <UnitLink unitNumber={v.unit.unitNumber} />
                  </td>
                  <td className="px-4 py-3">
                    <UserLink userId={v.registeredByUser.id} name={v.registeredByUser.name} />
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
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
