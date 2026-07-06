import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { CommitteeForm } from "./committee-form";

export const dynamic = "force-dynamic";

export default async function AdminCommitteePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const designations = await db.designation.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ startDate: "desc" }],
  });

  const current = designations.filter((d) => !d.endDate || d.endDate > new Date());
  const past = designations.filter((d) => d.endDate && d.endDate <= new Date());

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">RWA Committee</h1>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Add Designation</h2>
          <CommitteeForm />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Current Office Bearers</h2>
          {current.length === 0 ? (
            <p className="text-sm text-muted-foreground">No current designations</p>
          ) : (
            <div className="space-y-3">
              {current.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{d.user.name}</p>
                    <p className="text-xs text-muted-foreground">{d.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {d.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Since {d.startDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Past Designations</h2>
            <div className="space-y-2">
              {past.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3 opacity-60">
                  <div>
                    <p className="font-medium">{d.user.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{d.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.startDate.toLocaleDateString()} — {d.endDate?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
