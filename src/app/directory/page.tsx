import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { UserLink } from "@/components/shared/user-link";
import { UnitLink } from "@/components/shared/unit-link";

export const dynamic = "force-dynamic";

const TOWERS = ["A", "B", "C"];

async function getDirectory(tower?: string) {
  const where: Record<string, unknown> = {
    OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
  };

  if (tower) {
    where.unit = { block: tower };
  }

  return db.unitMembership.findMany({
    where,
    include: {
      unit: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ unit: { unitNumber: "asc" } }],
  });
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tower?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const memberships = await getDirectory(params.tower);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });

  if (!user) redirect("/login");

  // Group by unit
  const unitsByNumber = new Map<string, { unit: { id: string; unitNumber: string; block: string; floor: number | null }; residents: { id: string; name: string }[] }>();
  for (const m of memberships) {
    const existing = unitsByNumber.get(m.unit.unitNumber);
    if (existing) {
      existing.residents.push({ id: m.user.id, name: m.user.name });
    } else {
      unitsByNumber.set(m.unit.unitNumber, {
        unit: m.unit,
        residents: [{ id: m.user.id, name: m.user.name }],
      });
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Unit Directory</h1>
          <p className="text-muted-foreground">Browse who lives where in your community.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/directory"
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
              !params.tower ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
            }`}
          >
            All
          </a>
          {TOWERS.map((t) => (
            <a
              key={t}
              href={`/directory?tower=${t}`}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                params.tower === t ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}
            >
              Tower {t}
            </a>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          {/* Mobile card list */}
          <div className="md:hidden divide-y">
            {Array.from(unitsByNumber.values()).map(({ unit, residents }) => (
              <div key={unit.id} className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <UnitLink unitNumber={unit.unitNumber} />
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Tower {unit.block}
                  </span>
                  {unit.floor !== null && (
                    <span className="text-xs text-muted-foreground">Floor {unit.floor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {residents.map((r, i) => (
                    <UserLink
                      key={i}
                      userId={r.id}
                      name={r.name}
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>
            ))}
            {unitsByNumber.size === 0 && (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No units found.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Unit</th>
                  <th className="px-4 py-3 text-left font-medium">Tower</th>
                  <th className="px-4 py-3 text-left font-medium">Floor</th>
                  <th className="px-4 py-3 text-left font-medium">Residents</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(unitsByNumber.values()).map(({ unit, residents }) => (
                  <tr key={unit.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <UnitLink unitNumber={unit.unitNumber} />
                    </td>
                    <td className="px-4 py-3">Tower {unit.block}</td>
                    <td className="px-4 py-3">{unit.floor}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {residents.map((r, i) => (
                          <UserLink
                            key={i}
                            userId={r.id}
                            name={r.name}
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {unitsByNumber.size === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      No units found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
