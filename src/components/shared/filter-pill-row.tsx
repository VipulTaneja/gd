import { cn } from "@/lib/utils";

interface FilterPillRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterPillRow({ children, className }: FilterPillRowProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide pb-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
