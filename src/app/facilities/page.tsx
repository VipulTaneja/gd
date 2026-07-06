import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { empty } from "@/lib/microcopy";
import { featureColors } from "@/lib/feature-colors";

export const dynamic = "force-dynamic";

const facilityIcons: Record<string, string> = {
  "Swimming Pool": "🏊",
  "Rooftop Recreation": "🌅",
  "Spa & Wellness": "💆",
  "Mini Theatre": "🎬",
  "Amphitheater": "🎭",
  "Cricket Pitch": "🏏",
  "Skating Rink": "⛸️",
};

export default async function FacilitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const facilities = await db.facility.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { name: "asc" },
  });

  const style = featureColors.facilities;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="facilities"
          title="Community Amenities"
          subtitle="Book your favourite spaces — pool, theatre, cricket pitch, and more."
        />

        {facilities.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={empty.facilities.title}
            description={empty.facilities.description}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => {
              const emoji = Object.entries(facilityIcons).find(([key]) =>
                f.name.toLowerCase().includes(key.toLowerCase())
              )?.[1] ?? "🏛️";
              return (
                <Link key={f.id} href={`/facilities/${f.id}`}
                  className="group rounded-xl border bg-card overflow-hidden transition-all hover:ring-gold hover:shadow-lg">
                  <div className={`flex h-28 items-center justify-center ${style.bg}`}>
                    <span className="text-5xl group-hover:scale-110 transition-transform">{emoji}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold group-hover:text-gold">{f.name}</h3>
                      {f.requiresApproval && (
                        <FriendlyBadge value="PENDING" variant="status" />
                      )}
                    </div>
                    {f.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{f.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {f.location && <span>{f.location}</span>}
                      <span>{f.slotMinutes} min slots</span>
                      <span>Capacity: {f.capacity}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
