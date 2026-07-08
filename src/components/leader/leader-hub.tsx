"use client";

import Link from "next/link";
import { Building2, Users, Sparkles, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { featureColors } from "@/lib/feature-colors";
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
        <Link href="/faq/manage">
          <SoftCard className="flex min-h-11 flex-col gap-1 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className={`h-5 w-5 ${featureColors.faq.text}`} />
              <div>
                <p className="font-medium">{faqCopy.editFaq}</p>
                <p className="text-sm text-muted-foreground">Update help articles for residents and guests</p>
              </div>
            </div>
          </SoftCard>
        </Link>
      )}

      {ledUnitNumber && (
        <Link href={`/units/${ledUnitNumber}`}>
          <SoftCard className="flex min-h-11 flex-col gap-1 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Building2 className={`h-5 w-5 ${featureColors.home.text}`} />
              <div>
                <p className="font-medium">Unit {ledUnitNumber}</p>
                <p className="text-sm text-muted-foreground">Manage invites & residents</p>
              </div>
            </div>
          </SoftCard>
        </Link>
      )}

      {communityLeaders.map((c) => (
        <Link key={c.id} href={`/communities/${c.id}`}>
          <SoftCard className="flex min-h-11 flex-col gap-1 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Users className={`h-5 w-5 ${featureColors.communities.text}`} />
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">Community leader tools</p>
              </div>
            </div>
          </SoftCard>
        </Link>
      ))}

      {amenityFacilities.map((f) => (
        <Link key={f.id} href={`/facilities/${f.id}`}>
          <SoftCard className="flex min-h-11 flex-col gap-1 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`h-5 w-5 ${featureColors.facilities.text}`} />
              <div>
                <p className="font-medium">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  {f.pendingCount > 0
                    ? `${f.pendingCount} pending booking${f.pendingCount === 1 ? "" : "s"}`
                    : "Amenity leader — bookings"}
                </p>
              </div>
            </div>
          </SoftCard>
        </Link>
      ))}
    </div>
  );
}

export function LeaderHubHeader() {
  return (
    <PageHeader
      feature="leader"
      title="Leader hub"
      subtitle="Shortcuts to your unit, community, and amenity leader tools"
    />
  );
}
