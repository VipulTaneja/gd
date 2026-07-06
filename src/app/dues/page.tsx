import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { QrCode, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { empty } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function DuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const memberships = await db.unitMembership.findMany({
    where: { userId: session.user.id, endDate: null },
    select: { unitId: true },
  });

  const unitIds = memberships.map((m) => m.unitId);

  const dues = await db.due.findMany({
    where: { unitId: { in: unitIds } },
    orderBy: { dueDate: "asc" },
    include: { unit: { select: { unitNumber: true } } },
  });

  const totalPending = dues
    .filter((d) => d.status === "PENDING")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const upiId = "gulshandynasty@upi";

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="dues"
          title="My Dues"
          subtitle={totalPending > 0 ? `Outstanding: ₹${totalPending.toLocaleString("en-IN")}` : "No pending payments"}
        />

        {totalPending > 0 && (
          <div className="rounded-xl border border-gold/30 bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
                <QrCode className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold">Pay via UPI</h3>
                <p className="text-sm text-muted-foreground">
                  Scan the QR or use UPI ID: <span className="font-mono text-foreground">{upiId}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount: ₹{totalPending.toLocaleString("en-IN")} · Reference: Your unit number
                </p>
              </div>
            </div>
          </div>
        )}

        {dues.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={empty.dues.title}
            description={empty.dues.description}
          />
        ) : (
          <div className="space-y-3">
            {dues.map((due) => (
              <div key={due.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border bg-card p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{due.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Unit {due.unit.unitNumber} · Due {due.dueDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-heading text-lg font-bold">₹{Number(due.amount).toLocaleString()}</span>
                  <FriendlyBadge value={due.status} variant="status" />
                  {due.paidAt && (
                    <span className="text-xs text-muted-foreground">
                      Paid {due.paidAt.toLocaleDateString()}
                    </span>
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
