import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { UnitLink } from "@/components/shared/unit-link";
import { DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { actions, empty } from "@/lib/microcopy";
import { FilterPillRow } from "@/components/shared/filter-pill-row";
import { getUserUnitMemberships } from "@/lib/rbac";
import type { PassStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  if (params.tab === "help") redirect("/staff");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const userId = session.user!.id;
  const activeTab = params.tab === "past" ? "past" : "active";

  const memberships = await getUserUnitMemberships(userId);
  const userMembership = memberships[0] ?? null;

  const pastStatuses: PassStatus[] = ["USED", "EXPIRED", "CANCELLED"];
  const where =
    activeTab === "past"
      ? { userId, status: { in: pastStatuses } }
      : { userId, status: "ACTIVE" as const };

  const passes = await db.visitorPass.findMany({
    where,
    include: { unit: { select: { unitNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="visitors"
          title="Guest Passes"
          subtitle="Invite friends and family in a few taps"
          action={userMembership ? (
            <Link href="/visitors/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light w-full sm:w-auto">
              {actions.newVisitor}
            </Link>
          ) : undefined}
        />

        <FilterPillRow>
          {[
            ["active", "Active"],
            ["past", "Past"],
          ].map(([key, label]) => (
            <Link key={key} href={`/visitors?tab=${key}`}
              className={`inline-flex h-11 shrink-0 snap-start items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                activeTab === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </FilterPillRow>

        {passes.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title={empty.visitors.title}
            description={empty.visitors.description}
            action={userMembership ? { label: actions.newVisitor, href: "/visitors/new" } : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passes.map((pass) => (
              <div
                key={pass.id}
                className="group rounded-xl border bg-card p-5 transition-all hover:ring-gold hover:shadow-lg"
              >
                <Link href={`/visitors/${pass.id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <FriendlyBadge value={pass.status} variant="status" />
                    {pass.isRecurring && (
                      <FriendlyBadge value="RECURRING" variant="semantic" />
                    )}
                  </div>
                  <h3 className="font-heading text-base font-semibold group-hover:text-gold">{pass.visitorName}</h3>
                  <p className="text-sm text-muted-foreground">{pass.visitorType.replace(/_/g, " ")}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Valid: {pass.validFrom.toLocaleDateString()} — {pass.validUntil.toLocaleDateString()}
                  </p>
                  {pass.parkingSlot && (
                    <p className="text-xs text-muted-foreground">Parking: {pass.parkingSlot}</p>
                  )}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pass.unit?.unitNumber ? (
                    <p>
                      Unit: <UnitLink unitNumber={pass.unit.unitNumber} />
                    </p>
                  ) : (
                    <p>Unit: Regular help (multi-unit)</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
