import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listManageFaq } from "@/lib/faq";
import { canManageFaq } from "@/lib/faq-auth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { FaqManagePanel } from "@/components/faq/faq-manage-panel";
import { Button } from "@/components/ui/button";
import { faq as faqCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function FaqManagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/faq/manage");

  const canEdit = await canManageFaq(session.user.id);
  if (!canEdit) redirect("/faq/app");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const sections = await listManageFaq();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="faq"
          title={faqCopy.manageTitle}
          subtitle={faqCopy.manageSubtitle}
          action={
            <Button
              variant="outline"
              render={<Link href="/faq/app" />}
              nativeButton={false}
              className="min-h-11 w-full sm:w-auto"
            >
              {faqCopy.viewPublic}
            </Button>
          }
        />
        <FaqManagePanel initialSections={sections} />
      </div>
    </DashboardLayout>
  );
}
