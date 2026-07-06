import Link from "next/link";
import { cn } from "@/lib/utils";

const TOWERS = ["A", "B", "C"] as const;

const towerFilterStyles: Record<string, { active: string; idle: string }> = {
  A: {
    active: "bg-gold text-black ring-2 ring-gold/40",
    idle: "border-gold/30 bg-gold/10 text-gold-dark hover:bg-gold/20",
  },
  B: {
    active: "bg-teal-600 text-white ring-2 ring-teal-300/50",
    idle: "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
  },
  C: {
    active: "bg-rose-600 text-white ring-2 ring-rose-300/50",
    idle: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
  },
};

interface DirectoryTowerFilterProps {
  activeTower?: string;
}

export function DirectoryTowerFilter({ activeTower }: DirectoryTowerFilterProps) {
  return (
    <div className="overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
      <div className="flex w-max min-w-full gap-2 pb-1">
        <Link
          href="/directory"
          className={cn(
            "inline-flex h-11 shrink-0 snap-start items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors",
            !activeTower
              ? "bg-primary text-primary-foreground"
              : "border border-input hover:bg-muted",
          )}
        >
          All towers
        </Link>
        {TOWERS.map((tower) => {
          const styles = towerFilterStyles[tower];
          const isActive = activeTower === tower;
          return (
            <Link
              key={tower}
              href={`/directory?tower=${tower}`}
              className={cn(
                "inline-flex h-11 shrink-0 snap-start items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors",
                isActive ? styles.active : styles.idle,
              )}
            >
              Tower {tower}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
