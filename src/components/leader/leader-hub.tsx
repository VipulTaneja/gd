"use client";

import Link from "next/link";
import { Building2, Users, Sparkles, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { faq as faqCopy } from "@/lib/microcopy";

interface LeaderHubProps {
  ledUnitNumber: string | null;
  communityLeaders: { id: string; name: string }[];
  amenityFacilities: { id: string; name: string; pendingCount: number }[];
  canManageFaq?: boolean;
}

export function LeaderHub({
  ledUnitNumber,
  communityLeaders,
  amenityFacilities,
  canManageFaq = false,
}: LeaderHubProps) {
  const hasAny =
    canManageFaq ||
    ledUnitNumber ||
    communityLeaders.length > 0 ||
    amenityFacilities.length > 0;

  if (!hasAny) {
    return (
      <p className="text-sm text-muted-foreground">
        You don&apos;t have any leader roles assigned yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {canManageFaq && (
        <Link
          href="/faq/manage"
          className="flex min-h-11 flex-col gap-1 rounded-xl border bg-card p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-violet-600" />
            <div>
              <p className="font-medium">{faqCopy.editFaq}</p>
              <p className="text-sm text-muted-foreground">Update help articles for residents and guests</p>
            </div>
          </div>
        </Link>
      )}

      {ledUnitNumber && (
        <Link
          href={`/units/${ledUnitNumber}`}
          className="flex min-h-11 flex-col gap-1 rounded-xl border bg-card p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">Unit {ledUnitNumber}</p>
              <p className="text-sm text-muted-foreground">Manage invites & residents</p>
            </div>
          </div>
        </Link>
      )}

      {communityLeaders.map((c) => (
        <Link
          key={c.id}
          href={`/communities/${c.id}`}
          className="flex min-h-11 flex-col gap-1 rounded-xl border bg-card p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-teal-600" />
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-muted-foreground">Community leader tools</p>
            </div>
          </div>
        </Link>
      ))}

      {amenityFacilities.map((f) => (
        <Link
          key={f.id}
          href={`/facilities/${f.id}`}
          className="flex min-h-11 flex-col gap-1 rounded-xl border bg-card p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-muted-foreground">
                {f.pendingCount > 0
                  ? `${f.pendingCount} pending booking${f.pendingCount === 1 ? "" : "s"}`
                  : "Amenity leader — bookings"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function LeaderHubHeader() {
  return (
    <PageHeader
      feature="directory"
      title="Leader hub"
      subtitle="Shortcuts to your unit, community, and amenity leader tools"
    />
  );
}
