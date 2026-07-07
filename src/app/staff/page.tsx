import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { HelpTabContent } from "@/components/staff/help-tab-content";
import { staff as staffCopy } from "@/lib/microcopy";
import { getUserUnitMemberships } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function RegularHelpPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const memberships = await getUserUnitMemberships(session.user.id);
  const units = memberships.map((m) => ({ id: m.unitId, unitNumber: m.unit.unitNumber }));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="staff"
          title={staffCopy.title}
          subtitle={staffCopy.subtitle}
        />
        <HelpTabContent units={units} />
      </div>
    </DashboardLayout>
  );
}
