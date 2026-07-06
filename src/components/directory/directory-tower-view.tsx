import { Building2, Users } from "lucide-react";
import { SoftCard } from "@/components/shared/soft-card";
import { cn } from "@/lib/utils";
import {
  towerBalloonStyles,
  type DirectoryAlignedGrid,
  type DirectoryTowerData,
} from "@/lib/directory-layout";
import { DirectoryUnitSlots } from "@/components/directory/directory-unit-slots";

interface DirectoryTowerViewProps {
  towers: DirectoryTowerData[];
  alignedGrid?: DirectoryAlignedGrid | null;
  sideBySide?: boolean;
}

function TowerHeader({ block, residentCount }: { block: string; residentCount: number }) {
  const styles = towerBalloonStyles[block] ?? towerBalloonStyles.A;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5 rounded-lg border bg-gradient-to-r px-2 py-1.5",
        styles.header,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm",
            styles.floorBadge,
          )}
        >
          <Building2 className="h-4 w-4" />
        </div>
        <h2 className="font-heading text-sm font-bold truncate">Tower {block}</h2>
      </div>
      <div
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
          styles.floorBadge,
        )}
      >
        <Users className="h-3 w-3" />
        {residentCount}
      </div>
    </div>
  );
}

function AlignedDirectoryView({ grid }: { grid: DirectoryAlignedGrid }) {
  const residentCounts = grid.towers.map((block) => {
    const slots = grid.floors.flatMap((row) =>
      row.columns.find((column) => column.block === block)?.units ?? [],
    );
    return {
      block,
      count: slots.reduce((total, slot) => total + slot.residents.length, 0),
    };
  });

  return (
    <SoftCard className="overflow-hidden p-0">
      <div className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur-sm px-2 py-1.5 sm:px-3">
        <div className="grid grid-cols-[2.25rem_1fr_1fr_1fr] gap-1 sm:grid-cols-[2.5rem_1fr_1fr_1fr] sm:gap-1.5">
          <div />
          {residentCounts.map(({ block, count }) => (
            <TowerHeader key={block} block={block} residentCount={count} />
          ))}
        </div>
      </div>

      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-2 py-0.5 sm:px-3">
        {grid.floors.map((floorRow) => (
          <div
            key={floorRow.floor}
            className="grid grid-cols-[2.25rem_1fr_1fr_1fr] items-start gap-1 border-b border-border/30 py-1 last:border-b-0 sm:grid-cols-[2.5rem_1fr_1fr_1fr] sm:gap-1.5 sm:py-1.5"
          >
            <div className="flex items-center justify-center pt-0.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-xs font-bold sm:h-8 sm:w-8">
                {floorRow.floor}
              </span>
            </div>

            {floorRow.columns.map((column) => (
              <div key={column.block} className="min-w-0 rounded-md bg-muted/15 px-1 py-0.5 sm:px-1.5">
                <DirectoryUnitSlots units={column.units} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SoftCard>
  );
}

function TowerCard({ tower }: { tower: DirectoryTowerData }) {
  const styles = towerBalloonStyles[tower.block] ?? towerBalloonStyles.A;

  return (
    <SoftCard className="overflow-hidden p-0">
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b bg-gradient-to-r px-3 py-2",
          styles.header,
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm",
              styles.floorBadge,
            )}
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-bold truncate">Tower {tower.block}</h2>
            <p className="text-xs text-muted-foreground">
              {tower.floors.length} floors · {tower.vacantCount} vacant
            </p>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            styles.floorBadge,
          )}
        >
          <Users className="h-3.5 w-3.5" />
          {tower.residentCount}
        </div>
      </div>

      <div className="relative px-2 py-1 sm:px-3">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-[1.65rem] top-2 w-px bg-gradient-to-b from-border via-border/70 to-transparent sm:left-[1.85rem]"
        />

        {tower.floors.map((floorRow) => (
          <div
            key={floorRow.floor}
            className="relative flex gap-2 border-b border-border/30 py-1.5 last:border-b-0 sm:gap-3"
          >
            <div className="relative z-10 flex w-9 shrink-0 items-center justify-center sm:w-10">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold shadow-sm",
                  styles.floorBadge,
                )}
              >
                {floorRow.floor}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <DirectoryUnitSlots units={floorRow.units} />
            </div>
          </div>
        ))}
      </div>
    </SoftCard>
  );
}

export function DirectoryTowerView({
  towers,
  alignedGrid,
  sideBySide = false,
}: DirectoryTowerViewProps) {
  if (sideBySide && alignedGrid) {
    return <AlignedDirectoryView grid={alignedGrid} />;
  }

  return (
    <div className="space-y-4">
      {towers.map((tower) => (
        <TowerCard key={tower.block} tower={tower} />
      ))}
    </div>
  );
}
