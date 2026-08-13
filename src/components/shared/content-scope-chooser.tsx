import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import type { FeatureKey } from "@/lib/feature-colors";

type CommunityOption = {
  id: string;
  name: string;
  suggested?: boolean;
};

export function ContentScopeChooser({
  feature,
  title,
  subtitle,
  backHref,
  backLabel,
  societyHref,
  societyTitle,
  societyDescription,
  communityHref,
  communityDescription,
  communities,
}: {
  feature: FeatureKey;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  societyHref: string;
  societyTitle: string;
  societyDescription: string;
  communityHref: (id: string) => string;
  communityDescription: string;
  communities: CommunityOption[];
}) {
  const tileClass =
    feature === "events"
      ? "bg-sky-100 text-sky-700"
      : feature === "polls"
        ? "bg-lime-100 text-lime-700"
        : "bg-muted text-muted-foreground";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader feature={feature} title={title} subtitle={subtitle} />
      <div className="space-y-3">
        <Link href={societyHref} className="block">
          <SoftCard className="flex items-center gap-3 transition-shadow hover:shadow-md">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tileClass}`}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold">{societyTitle}</p>
              <p className="text-sm text-muted-foreground">{societyDescription}</p>
            </div>
          </SoftCard>
        </Link>

        {communities.map((c) => (
          <Link key={c.id} href={communityHref(c.id)} className="block">
            <SoftCard className="flex items-center gap-3 transition-shadow hover:shadow-md">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tileClass}`}
              >
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading font-semibold">{c.name}</p>
                  {c.suggested && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Suggested
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{communityDescription}</p>
              </div>
            </SoftCard>
          </Link>
        ))}
      </div>
      <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
        ← {backLabel}
      </Link>
    </div>
  );
}
