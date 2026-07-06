import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { QrCode } from "lucide-react";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  WAIVED: "bg-gray-100 text-gray-800",
};

function generateUPIString(upiId: string, amount: number, label: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: "Gulshan Dynasty RWA",
    am: amount.toString(),
    cu: "INR",
    tn: label,
  });
  return `upi://pay?${params.toString()}`;
}

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-bold">My Dues</h1>
          {totalPending > 0 && (
            <span className="inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold-dark w-full sm:w-auto justify-center sm:justify-start">
              Outstanding: ₹{totalPending.toLocaleString("en-IN")}
            </span>
          )}
        </div>

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
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[due.status]}`}>
                  {due.status}
                </span>
                {due.paidAt && (
                  <span className="text-xs text-muted-foreground">
                    Paid {due.paidAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {dues.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No dues found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
