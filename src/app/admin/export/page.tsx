import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { ExportButtons } from "./export-buttons";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">Export community data as CSV files.</p>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Available Exports</h2>
          <ExportButtons />
        </div>
      </div>
    </DashboardLayout>
  );
}
