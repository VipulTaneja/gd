import { cn } from "@/lib/utils";
import { towerBalloonStyles } from "@/lib/directory-layout";

interface VacantUnitBalloonProps {
  block: string;
}

export function VacantUnitBalloon({ block }: VacantUnitBalloonProps) {
  const styles = towerBalloonStyles[block] ?? towerBalloonStyles.A;

  return (
    <div
      className={cn(
        "inline-flex min-w-[4.75rem] max-w-[7.5rem] flex-col items-center rounded-xl px-2 py-1 ring-1",
        styles.vacant,
      )}
    >
      <span className="w-full text-center text-[11px] font-medium leading-snug">Vacant</span>
    </div>
  );
}
