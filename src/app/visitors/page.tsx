import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";

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

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    USED: "bg-blue-100 text-blue-800",
    EXPIRED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold">Visitor Passes</h1>
          {userMembership && (
            <Link href="/visitors/new"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light w-full sm:w-auto">
              Create Pass
            </Link>
          )}
        </div>

        <div className="flex gap-2">
          {[["active", "Active"], ["past", "Past"]].map(([key, label]) => (
            <Link key={key} href={`/visitors?tab=${key}`}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors ${
                (params.tab || "active") === key ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passes.map((pass) => (
            <Link key={pass.id} href={`/visitors/${pass.id}`}
              className="group rounded-xl border bg-card p-5 transition-all hover:ring-gold hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[pass.status]}`}>
                  {pass.status}
                </span>
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
          {passes.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No {params.tab || "active"} passes.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
