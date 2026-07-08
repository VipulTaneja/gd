import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

async function getPackages(userId: string) {
  return db.visitorPass.findMany({
    where: {
      userId,
      visitorType: "DELIVERY",
      status: { in: ["ACTIVE", "USED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export default async function PackagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const packages = await getPackages(session.user.id);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader feature="packages" title="Package Inbox" subtitle={`${packages.length} recent delivery${packages.length === 1 ? "" : "s"}`} />

        {packages.length === 0 ? (
          <EmptyState icon={Package} title={empty.packages.title} description={empty.packages.description} />
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{pkg.visitorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {pkg.createdAt.toLocaleDateString()} · {pkg.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <FriendlyBadge value={pkg.status} variant="status" />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
