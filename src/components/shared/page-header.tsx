import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FeatureKey } from "@/lib/feature-colors";
import { featureColors } from "@/lib/feature-colors";

interface PageHeaderProps {
  feature: FeatureKey;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  feature,
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  const style = featureColors[feature];
  const Icon = style.icon;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            style.bg,
            style.text
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  );
}
