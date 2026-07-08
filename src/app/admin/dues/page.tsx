import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenerateDuesForm } from "@/components/dues/generate-dues-form";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { MarkPaidButton } from "./mark-paid-button";

export const dynamic = "force-dynamic";

export default async function AdminDuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [totalDues, paidDues, pendingDues, overdueDues] = await Promise.all([
    db.due.aggregate({ _sum: { amount: true }, _count: true }),
    db.due.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    db.due.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } }),
    db.due.aggregate({ _sum: { amount: true }, where: { status: "OVERDUE" } }),
  ]);

  const recentDues = await db.due.findMany({
    include: { unit: { select: { unitNumber: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const formatCurrency = (val: number | null) => `₹${(val ?? 0).toLocaleString()}`;
  const totalAmount = totalDues._sum.amount ? Number(totalDues._sum.amount) : 0;
  const paidAmount = paidDues._sum.amount ? Number(paidDues._sum.amount) : 0;
  const pendingAmount = pendingDues._sum.amount ? Number(pendingDues._sum.amount) : 0;
  const overdueAmount = overdueDues._sum.amount ? Number(overdueDues._sum.amount) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dues Management</h1>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4">Generate Dues</h2>
        <GenerateDuesForm />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Dues</p>
          <p className="font-heading text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-muted-foreground">{totalDues._count} records</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Collected</p>
          <p className="font-heading text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="font-heading text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="font-heading text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Label</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentDues.map((due) => (
                <tr key={due.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{due.unit.unitNumber}</td>
                  <td className="px-4 py-3">{due.label}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(due.amount))}</td>
                  <td className="px-4 py-3">{due.dueDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge value={due.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {due.status !== "PAID" && (
                      <MarkPaidButton dueId={due.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
