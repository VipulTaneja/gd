import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { UserLink } from "@/components/shared/user-link";
import { PhoneLink } from "@/components/shared/phone-link";

export const dynamic = "force-dynamic";

async function getOverdueDues() {
  return db.due.findMany({
    where: { status: { in: ["PENDING", "OVERDUE"] } },
    include: {
      unit: {
        select: {
          unitNumber: true,
          block: true,
          memberships: {
            where: { endDate: null, isPrimary: true },
            include: { user: { select: { id: true, name: true, email: true, phone: true } } },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}

function getAgingBucket(dueDate: Date): string {
  const now = new Date();
  const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 30) return "0-30 days";
  if (daysOverdue <= 60) return "31-60 days";
  if (daysOverdue <= 90) return "61-90 days";
  return "90+ days";
}

export default async function AdminDuesReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dues = await getOverdueDues();

  const agingBuckets: Record<string, { count: number; total: number }> = {};
  for (const due of dues) {
    const bucket = getAgingBucket(due.dueDate);
    if (!agingBuckets[bucket]) agingBuckets[bucket] = { count: 0, total: 0 };
    agingBuckets[bucket].count++;
    agingBuckets[bucket].total += Number(due.amount);
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Dues Report" }]} />

      <h1 className="font-heading text-2xl font-bold">Defaulter Aging Report</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(agingBuckets).map(([bucket, data]) => (
          <div key={bucket} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{bucket}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{data.count}</p>
            <p className="text-xs text-muted-foreground">₹{data.total.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      <div className="md:hidden space-y-3">
        {dues.length === 0 && (
          <div className="rounded-xl border bg-card px-4 py-12 text-center text-muted-foreground">
            No overdue dues.
          </div>
        )}
        {dues.map((due) => (
          <div key={due.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{due.unit.unitNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {due.unit.memberships[0]?.user ? (
                    <UserLink
                      userId={due.unit.memberships[0].user.id}
                      name={due.unit.memberships[0].user.name}
                    />
                  ) : (
                    "—"
                  )}
                </p>
                {due.unit.memberships[0]?.user.phone && (
                  <p className="text-xs text-muted-foreground">
                    <PhoneLink phone={due.unit.memberships[0].user.phone} />
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                getAgingBucket(due.dueDate) === "90+ days" ? "bg-red-100 text-red-800" :
                getAgingBucket(due.dueDate) === "61-90 days" ? "bg-amber-100 text-amber-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {getAgingBucket(due.dueDate)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Due: </span>
                {due.label}
              </div>
              <div className="font-medium">
                ₹{Number(due.amount).toLocaleString("en-IN")}
              </div>
              <div className="text-muted-foreground">
                {due.dueDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Resident</th>
                <th className="px-4 py-3 text-left font-medium">Due</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Due Date</th>
                <th className="px-4 py-3 text-left font-medium">Aging</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due) => (
                <tr key={due.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{due.unit.unitNumber}</td>
                  <td className="px-4 py-3">
                    {due.unit.memberships[0]?.user ? (
                      <div>
                        <UserLink
                          userId={due.unit.memberships[0].user.id}
                          name={due.unit.memberships[0].user.name}
                        />
                        {due.unit.memberships[0].user.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <PhoneLink phone={due.unit.memberships[0].user.phone} />
                          </p>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{due.label}</td>
                  <td className="px-4 py-3 font-medium">₹{Number(due.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {due.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      getAgingBucket(due.dueDate) === "90+ days" ? "bg-red-100 text-red-800" :
                      getAgingBucket(due.dueDate) === "61-90 days" ? "bg-amber-100 text-amber-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {getAgingBucket(due.dueDate)}
                    </span>
                  </td>
                </tr>
              ))}
              {dues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No overdue dues.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
