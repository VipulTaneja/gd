import { cn } from "@/lib/utils";

interface CountBadgeProps {
  count: number;
  size?: "sm" | "md";
  className?: string;
}

export function CountBadge({ count, size = "md", className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        "absolute flex animate-badge-pop items-center justify-center rounded-full bg-gold font-bold text-black",
        size === "md"
          ? "-top-1.5 -right-1.5 h-5 min-w-5 px-1.5 text-[10px]"
          : "top-1 right-1 h-4 min-w-4 px-1 text-[9px]",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
