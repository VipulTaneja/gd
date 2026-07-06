import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { actions, empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const params = await searchParams;
  const userId = session.user!.id;

  const where: Record<string, unknown> = params.tab === "past"
    ? { userId, status: { in: ["USED", "EXPIRED", "CANCELLED"] } }
    : { userId, status: "ACTIVE" };

  const passes = await db.visitorPass.findMany({
    where,
    include: { unit: { select: { unitNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  const userMembership = await db.unitMembership.findFirst({
    where: { userId, OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    select: { unitId: true },
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

        <div className="flex gap-2">
          {[["active", "Active"], ["past", "Past"]].map(([key, label]) => (
            <Link key={key} href={`/visitors?tab=${key}`}
              className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                (params.tab || "active") === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </div>

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
              <Link key={pass.id} href={`/visitors/${pass.id}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:ring-gold hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <FriendlyBadge value={pass.status} variant="status" />
                  {pass.isRecurring && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      Recurring
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-base font-semibold group-hover:text-gold">{pass.visitorName}</h3>
                <p className="text-sm text-muted-foreground">{pass.visitorType.replace(/_/g, " ")}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Valid: {pass.validFrom.toLocaleDateString()} — {pass.validUntil.toLocaleDateString()}</p>
                  <p>Unit: {pass.unit.unitNumber}</p>
                  {pass.parkingSlot && <p>Parking: {pass.parkingSlot}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
