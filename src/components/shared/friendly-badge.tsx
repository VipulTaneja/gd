import { AlertTriangle, Info, Sparkles, Clock, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { priorityLabels, statusLabels } from "@/lib/microcopy";

type BadgeVariant = "priority" | "status";

const priorityConfig: Record<string, { icon: typeof Info; className: string }> = {
  EMERGENCY: { icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  IMPORTANT: { icon: Sparkles, className: "bg-amber-100 text-amber-700" },
  NORMAL: { icon: Info, className: "bg-slate-100 text-slate-600" },
};

const statusConfig: Record<string, { icon: typeof Circle; className: string }> = {
  OPEN: { icon: Circle, className: "bg-sky-100 text-sky-700" },
  IN_PROGRESS: { icon: Clock, className: "bg-amber-100 text-amber-700" },
  RESOLVED: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  CLOSED: { icon: CheckCircle2, className: "bg-slate-100 text-slate-600" },
  PENDING: { icon: Clock, className: "bg-amber-100 text-amber-700" },
  PAID: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  ACTIVE: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  USED: { icon: CheckCircle2, className: "bg-sky-100 text-sky-700" },
  EXPIRED: { icon: Circle, className: "bg-slate-100 text-slate-600" },
  CANCELLED: { icon: Circle, className: "bg-red-100 text-red-700" },
  OVERDUE: { icon: AlertTriangle, className: "bg-red-100 text-red-700" },
  WAIVED: { icon: Circle, className: "bg-slate-100 text-slate-600" },
};

interface FriendlyBadgeProps {
  value: string;
  variant: BadgeVariant;
  className?: string;
}

export function FriendlyBadge({ value, variant, className }: FriendlyBadgeProps) {
  const config =
    variant === "priority" ? priorityConfig[value] : statusConfig[value];
  const label =
    variant === "priority"
      ? (priorityLabels[value] ?? value)
      : (statusLabels[value] ?? value.replace(/_/g, " "));

  if (!config) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground", className)}>
        {label}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
