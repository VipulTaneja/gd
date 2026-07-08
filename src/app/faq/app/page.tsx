import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listPublicFaq } from "@/lib/faq";
import { canManageFaq } from "@/lib/faq-auth";
import { buildFaqPageMetadata } from "@/lib/faq-metadata";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Button } from "@/components/ui/button";
import { faq as faqCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildFaqPageMetadata("/faq/app");
}

export default async function ResidentFaqPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/faq/app");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login?callbackUrl=/faq/app");

  const [sections, canEdit] = await Promise.all([
    listPublicFaq(),
    canManageFaq(session.user.id),
  ]);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="faq"
          title={faqCopy.title}
          subtitle={faqCopy.subtitle}
          action={
            canEdit ? (
              <Button render={<Link href="/faq/manage" />} className="min-h-11 w-full sm:w-auto">
                {faqCopy.editFaq}
              </Button>
            ) : undefined
          }
        />
        <FaqAccordion sections={sections} showSearch />
      </div>
    </DashboardLayout>
  );
}
