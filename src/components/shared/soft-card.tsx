import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SoftCardProps {
  children: ReactNode;
  className?: string;
  accent?: "gold" | "amber" | "sky" | "rose" | "emerald" | "none";
}

const accentStyles = {
  gold: "before:bg-gold",
  amber: "before:bg-amber-400",
  sky: "before:bg-sky-400",
  rose: "before:bg-rose-400",
  emerald: "before:bg-emerald-400",
  none: "",
};

export function SoftCard({ children, className, accent = "none" }: SoftCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5",
        accent !== "none" && "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-2xl",
        accent !== "none" && accentStyles[accent],
        className
      )}
    >
      {children}
    </div>
  );
}
