import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { PhoneLink } from "@/components/shared/phone-link";
import { UserLink } from "@/components/shared/user-link";
import { ContactReviewForm } from "@/components/contacts/contact-review-form";
import { ContactReviewList } from "@/components/contacts/contact-review-list";
import { ContactEditForm } from "@/components/contacts/contact-edit-form";
import {
  getContactReviewAggregate,
  isContactReviewable,
  listContactReviews,
} from "@/lib/contact-reviews";
import { isAdmin } from "@/lib/rbac";
import { contacts as contactsCopy } from "@/lib/microcopy";
import Link from "next/link";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const layoutUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!layoutUser) redirect("/login");

  const contact = await db.importantContact.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  if (!contact) notFound();

  const [aggregate, reviewData, ownReview, admin] = await Promise.all([
    getContactReviewAggregate(id),
    listContactReviews(id),
    db.contactReview.findUnique({
      where: {
        contactId_authorId: { contactId: id, authorId: session.user.id },
      },
    }),
    isAdmin(session.user.id),
  ]);

  const reviewable = isContactReviewable(contact.category);
  const canEdit = admin || contact.createdById === session.user.id;

  return (
    <DashboardLayout user={layoutUser}>
      <div className="space-y-6">
        <PageHeader
          feature="contacts"
          title={contact.typeOfService}
          subtitle={contact.category}
        />

        <SoftCard accent="emerald">
          <div className="space-y-4">
            {contact.name && (
              <p className="text-lg font-medium">{contact.name}</p>
            )}
            {aggregate.avgRating != null && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-medium">{aggregate.avgRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({aggregate.reviewCount} rating{aggregate.reviewCount === 1 ? "" : "s"})
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{contactsCopy.callCta}</p>
              <PhoneLink phone={contact.contactNo} className="text-base font-medium" />
            </div>
            {contact.remarks && (
              <p className="text-sm text-muted-foreground">{contact.remarks}</p>
            )}
          </div>
        </SoftCard>

        <section className="space-y-2 text-sm text-muted-foreground">
          {contact.createdBy && (
            <p>
              {contactsCopy.addedBy}{" "}
              <UserLink userId={contact.createdBy.id} name={contact.createdBy.name ?? "Unknown"} />
            </p>
          )}
          {contact.lastEditedBy && (
            <p>
              {contactsCopy.lastEditedBy}{" "}
              <UserLink userId={contact.lastEditedBy.id} name={contact.lastEditedBy.name ?? "Unknown"} />
              {" · "}
              {contact.lastEditedAt.toLocaleDateString("en-IN")}
            </p>
          )}
        </section>

        <ContactEditForm
          contactId={contact.id}
          initialName={contact.name}
          initialContactNo={contact.contactNo}
          initialRemarks={contact.remarks}
          canEdit={canEdit}
        />

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">{contactsCopy.reviewsTitle}</h2>
          <SoftCard accent="emerald">
            <ContactReviewForm
              contactId={id}
              initialRating={ownReview?.rating ?? 0}
              initialComment={ownReview?.comment}
              disabled={!reviewable}
            />
          </SoftCard>
          <ContactReviewList
            reviews={reviewData.reviews.map((r) => ({
              ...r,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </section>

        <p className="text-sm text-muted-foreground border-t pt-4">
          Looking for individual help (maid, cook, driver)?{" "}
          <Link href="/staff" className="text-gold hover:underline">
            Regular help registry
          </Link>
        </p>
      </div>
    </DashboardLayout>
  );
}
