"use client";

import Link from "next/link";
import type { HubBadgeCounts } from "@/types/hub";
import { IconTile } from "@/components/shared/icon-tile";
import { StaggerChildren } from "@/components/shared/animated";
import type { FeatureKey } from "@/lib/feature-colors";

interface HubShortcutsProps {
  isAuthenticated: boolean;
  badges: HubBadgeCounts;
}

const shortcuts: {
  feature: FeatureKey;
  href: string;
  guestHref: string;
  badgeKey?: keyof HubBadgeCounts;
}[] = [
  { feature: "facilities", href: "/facilities", guestHref: "/login?callbackUrl=/facilities" },
  { feature: "visitors", href: "/visitors", guestHref: "/login?callbackUrl=/visitors" },
  { feature: "tickets", href: "/tickets", guestHref: "/login?callbackUrl=/tickets" },
  { feature: "dues", href: "/dues", guestHref: "/login?callbackUrl=/dues", badgeKey: "pendingDues" },
  { feature: "notices", href: "/notices", guestHref: "/login?callbackUrl=/notices" },
  { feature: "events", href: "/events", guestHref: "/login?callbackUrl=/events" },
  { feature: "polls", href: "/polls", guestHref: "/login?callbackUrl=/polls", badgeKey: "activePolls" },
  { feature: "directory", href: "/directory", guestHref: "/login?callbackUrl=/directory" },
];

export function HubShortcuts({ isAuthenticated, badges }: HubShortcutsProps) {
  return (
    <StaggerChildren
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3"
      staggerMs={50}
    >
      {shortcuts.map((s) => {
        const href = isAuthenticated ? s.href : s.guestHref;
        const count = s.badgeKey ? badges[s.badgeKey] : 0;

        return (
          <IconTile
            key={s.feature}
            feature={s.feature}
            href={href}
            badge={count}
          />
        );
      })}
    </StaggerChildren>
  );
}
