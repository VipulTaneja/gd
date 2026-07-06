"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { HoverLift } from "@/components/shared/animated";
import type { FeatureKey } from "@/lib/feature-colors";
import { featureColors } from "@/lib/feature-colors";

interface IconTileProps {
  feature: FeatureKey;
  href: string;
  label?: string;
  badge?: number;
  className?: string;
}

export function IconTile({ feature, href, label, badge, className }: IconTileProps) {
  const style = featureColors[feature];
  const Icon = style.icon;
  const displayLabel = label ?? style.label;

  return (
    <HoverLift>
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col items-center gap-2.5 rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-foreground/5 transition-all duration-200",
          "hover:shadow-md hover:ring-2",
          style.ring,
          className
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
            style.bg,
            style.text
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
          {displayLabel}
        </span>
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 animate-badge-pop items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-black">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    </HoverLift>
  );
}
