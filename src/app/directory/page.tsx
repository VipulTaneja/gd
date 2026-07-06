import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import { buildAlignedFloorGrid, buildDirectoryTowers } from "@/lib/directory-layout";
import { DirectoryTowerView } from "@/components/directory/directory-tower-view";
import { DirectoryTowerFilter } from "@/components/directory/directory-tower-filter";

export const dynamic = "force-dynamic";

async function getDirectoryData(tower?: string) {
  const unitWhere = tower ? { block: tower } : { block: { in: ["A", "B", "C"] } };

  const membershipWhere: Record<string, unknown> = {
    OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
  };
  if (tower) {
    membershipWhere.unit = { block: tower };
  }

  const [units, memberships] = await Promise.all([
    db.unit.findMany({
      where: unitWhere,
      select: { id: true, unitNumber: true, block: true, floor: true },
      orderBy: [{ floor: "desc" }, { unitNumber: "asc" }],
    }),
    db.unitMembership.findMany({
      where: membershipWhere,
      include: {
        unit: { select: { unitNumber: true, block: true, floor: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ unit: { unitNumber: "asc" } }],
    }),
  ]);

  return { units, memberships };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tower?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const { units, memberships } = await getDirectoryData(params.tower);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });

  if (!user) redirect("/login");

  const towers = buildDirectoryTowers(units, memberships, params.tower);
  const alignedGrid = !params.tower ? buildAlignedFloorGrid(units, memberships) : null;
  const totalResidents = alignedGrid?.residentCount ?? towers.reduce((count, t) => count + t.residentCount, 0);
  const vacantUnits = alignedGrid?.vacantCount ?? towers.reduce((count, t) => count + t.vacantCount, 0);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-3 pb-20 md:pb-4">
        <PageHeader
          feature="directory"
          title="Neighbors"
          subtitle="Explore your community floor by floor — tap a neighbor to view their profile."
        />

        <DirectoryTowerFilter activeTower={params.tower} />

        {units.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No units found"
            description={
              params.tower
                ? `No units in Tower ${params.tower} yet.`
                : "Unit data has not been loaded yet."
            }
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {totalResidents} neighbor{totalResidents !== 1 ? "s" : ""}
              {params.tower ? ` in Tower ${params.tower}` : " across Gulshan Dynasty"}
              {vacantUnits > 0 && ` · ${vacantUnits} vacant unit${vacantUnits !== 1 ? "s" : ""}`}
            </p>
            <DirectoryTowerView
              towers={towers}
              alignedGrid={alignedGrid}
              sideBySide={!params.tower}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
