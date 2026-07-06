"use client";

import { cn } from "@/lib/utils";
import { UserLink } from "./user-link";
import { UnitLink } from "./unit-link";
import { Calendar, ArrowRight } from "lucide-react";

interface Membership {
  id: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  isPrimary: boolean;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  unit?: {
    unitNumber: string;
    block: string;
  };
}

interface MembershipTimelineProps {
  memberships: Membership[];
  perspective: "user" | "unit";
  className?: string;
}

export function MembershipTimeline({
  memberships,
  perspective,
  className,
}: MembershipTimelineProps) {
  const sorted = [...memberships].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No membership history
      </p>
    );
  }

  return (
    <div className={cn("relative space-y-0", className)}>
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

      {sorted.map((m) => {
        const isActive = !m.endDate;
        const start = new Date(m.startDate).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
        const end = m.endDate
          ? new Date(m.endDate).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
          : null;

        return (
          <div key={m.id} className="relative flex gap-4 py-3">
            <div
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                isActive
                  ? "border-gold bg-gold/10"
                  : "border-border bg-background"
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isActive ? "bg-gold" : "bg-muted-foreground/40"
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {perspective === "user" && m.unit && (
                  <UnitLink unitNumber={m.unit.unitNumber} />
                )}
                {perspective === "unit" && m.user && (
                  <UserLink userId={m.user.id} name={m.user.name} showAvatar />
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isActive
                      ? "bg-gold/15 text-gold-dark"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {m.role.replace("_", " ")}
                </span>
                {m.isPrimary && (
                  <span className="text-[10px] text-gold font-medium">
                    Primary
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{start}</span>
                {end && (
                  <>
                    <ArrowRight className="h-3 w-3" />
                    <span>{end}</span>
                  </>
                )}
                {!end && (
                  <span className="text-gold font-medium">Present</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
