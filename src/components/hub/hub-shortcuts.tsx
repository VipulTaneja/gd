"use client";

import type { HubBadgeCounts } from "@/types/hub";
import { IconTile } from "@/components/shared/icon-tile";
import { StaggerChildren } from "@/components/shared/animated";
import type { FeatureKey } from "@/lib/feature-colors";

interface HubShortcutsProps {
  isAuthenticated: boolean;
  badges: HubBadgeCounts;
  showFaq?: boolean;
}

const shortcuts: {
  feature: FeatureKey;
  href: string;
  guestHref: string;
  badgeKey?: keyof HubBadgeCounts;
}[] = [
  { feature: "communities", href: "/communities", guestHref: "/login?callbackUrl=/communities" },
  { feature: "directory", href: "/directory", guestHref: "/login?callbackUrl=/directory" },
  { feature: "polls", href: "/polls", guestHref: "/login?callbackUrl=/polls", badgeKey: "activePolls" },
  { feature: "events", href: "/events", guestHref: "/login?callbackUrl=/events" },
  { feature: "facilities", href: "/facilities", guestHref: "/login?callbackUrl=/facilities" },
  { feature: "visitors", href: "/visitors", guestHref: "/login?callbackUrl=/visitors" },
  { feature: "tickets", href: "/tickets", guestHref: "/login?callbackUrl=/tickets" },
  { feature: "dues", href: "/dues", guestHref: "/login?callbackUrl=/dues", badgeKey: "pendingDues" },
];

export function HubShortcuts({ isAuthenticated, badges, showFaq = false }: HubShortcutsProps) {
  const faqShortcut: {
    feature: FeatureKey;
    href: string;
    guestHref: string;
    badgeKey?: keyof HubBadgeCounts;
  }[] = showFaq
    ? [
        {
          feature: "faq",
          href: isAuthenticated ? "/faq/app" : "/faq",
          guestHref: "/faq",
        },
      ]
    : [];

  const allShortcuts = [...shortcuts, ...faqShortcut];

  return (
    <StaggerChildren
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3"
      staggerMs={50}
    >
      {allShortcuts.map((s) => {
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
