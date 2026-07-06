import Link from "next/link";
import { cn } from "@/lib/utils";

const towerColors: Record<string, string> = {
  A: "bg-gold/15 text-gold-dark border-gold/30 hover:bg-gold/25",
  B: "bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200",
  C: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200",
};

interface UnitLinkProps {
  unitNumber: string;
  className?: string;
}

export function UnitLink({ unitNumber, className }: UnitLinkProps) {
  const tower = unitNumber.charAt(0);

  return (
    <Link
      href={`/units/${unitNumber}`}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        towerColors[tower] ?? "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        className
      )}
    >
      {unitNumber}
    </Link>
  );
}
