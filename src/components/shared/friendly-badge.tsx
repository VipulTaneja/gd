import { AlertTriangle, Info, Sparkles, Clock, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { priorityLabels, statusLabels } from "@/lib/microcopy";

type BadgeVariant = "priority" | "status" | "semantic";

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

const semanticConfig: Record<string, { className: string; label: string }> = {
  RECURRING: { className: "bg-violet-100 text-violet-700", label: "Recurring" },
  RESOLUTION: { className: "bg-purple-100 text-purple-800", label: "Resolution" },
  LEADER: { className: "bg-purple-100 text-purple-800", label: "Leader" },
  ADMIN_ROLE: { className: "bg-purple-100 text-purple-800", label: "Admin" },
  PENDING: { className: "bg-amber-100 text-amber-700", label: "Pending" },
  APPROVED: { className: "bg-emerald-100 text-emerald-700", label: "Approved" },
  REJECTED: { className: "bg-red-100 text-red-700", label: "Rejected" },
  SUPER_ADMIN: { className: "bg-gold text-black", label: "Super Admin" },
  ADMIN: { className: "bg-gold/20 text-gold-dark", label: "Admin" },
  RESIDENT: { className: "bg-muted text-muted-foreground", label: "Resident" },
  NON_RESIDENT: { className: "bg-secondary text-secondary-foreground", label: "Non-Resident" },
  MEMBER: { className: "bg-green-100 text-green-800", label: "Member" },
  VIEW: { className: "bg-gold/10 text-gold", label: "View →" },
  OWNER: { className: "bg-gold/15 text-gold-dark", label: "Owner" },
  JOINT_OWNER: { className: "bg-gold/15 text-gold-dark", label: "Joint Owner" },
  TENANT: { className: "bg-sky-100 text-sky-700", label: "Tenant" },
  OWNER_FAMILY: { className: "bg-amber-100 text-amber-700", label: "Owner's Family" },
  TENANT_FAMILY: { className: "bg-amber-100 text-amber-700", label: "Tenant's Family" },
  PRIMARY: { className: "bg-gold/15 text-gold-dark", label: "Primary" },
};

interface FriendlyBadgeProps {
  value: string;
  variant: BadgeVariant;
  className?: string;
}

export function FriendlyBadge({ value, variant, className }: FriendlyBadgeProps) {
  if (variant === "semantic") {
    const config = semanticConfig[value];
    const label = config?.label ?? value;
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          config?.className ?? "bg-muted text-muted-foreground",
          className,
        )}
      >
        {label}
      </span>
    );
  }

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
