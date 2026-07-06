import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { VisitorPassForm } from "@/components/visitors/visitor-pass-form";

export const dynamic = "force-dynamic";

export default async function NewVisitorPassPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const membership = await db.unitMembership.findFirst({
    where: { userId: session.user!.id, OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    select: { unitId: true },
  });

  if (!membership) redirect("/visitors");

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-heading text-2xl font-bold">Create Visitor Pass</h1>
        <div className="rounded-xl border bg-card p-6">
          <VisitorPassForm unitId={membership.unitId} />
        </div>
      </div>
    </DashboardLayout>
  );
}
