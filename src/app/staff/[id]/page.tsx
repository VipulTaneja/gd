import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { DetailHeroCard } from "@/components/shared/detail-hero-card";
import { UnitLink } from "@/components/shared/unit-link";
import { PhoneLink } from "@/components/shared/phone-link";
import { StaffReviewForm } from "@/components/staff/staff-review-form";
import { StaffReviewList } from "@/components/staff/staff-review-list";
import { StarRatingDisplay } from "@/components/shared/star-rating-display";
import { getStaffProfile, getStaffReviewAggregate, staffInitials, staffRoleLabel } from "@/lib/staff";
import { isSocietyStaffRole } from "@/lib/staff-labels";
import { staff as staffCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage({
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

  const profile = await getStaffProfile(id);
  if (!profile) notFound();

  const aggregate = await getStaffReviewAggregate(id);
  const now = new Date();

  const activeAssociations = profile.associations.filter(
    (a) => a.status === "ACTIVE" && (!a.endDate || a.endDate > now),
  );
  const endedAssociations = profile.associations.filter(
    (a) => a.status === "ENDED" || (a.endDate && a.endDate <= now),
  );

  const [reviews, ownReview] = await Promise.all([
    db.staffReview.findMany({
      where: { staffPersonId: id, isHidden: false },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.staffReview.findUnique({
      where: {
        staffPersonId_authorId: { staffPersonId: id, authorId: session.user.id },
      },
    }),
  ]);

  return (
    <DashboardLayout user={layoutUser}>
      <div className="space-y-6">
        <PageHeader
          feature="staff"
          title={profile.name}
          subtitle={staffCopy.profileTitle}
        />

        <DetailHeroCard
          accent="gold"
          avatarClassName="bg-gold/10 text-gold"
          avatarContent={
            profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              staffInitials(profile.name)
            )
          }
        >
          {aggregate.avgRating != null && (
            <StarRatingDisplay
              rating={aggregate.avgRating}
              reviewCount={aggregate.reviewCount}
              size="md"
              showValue
            />
          )}
          <PhoneLink phone={profile.phone} className="text-base font-medium" />
        </DetailHeroCard>

        {activeAssociations.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">{staffCopy.activeAt}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeAssociations.map((a) => (
                <SoftCard key={a.id} className="p-4">
                  <p className="font-medium">{staffRoleLabel(a.role)}</p>
                  {a.scope === "SOCIETY" || isSocietyStaffRole(a.role) ? (
                    <p className="mt-2 text-sm text-muted-foreground">{staffCopy.societyWide}</p>
                  ) : (
                    a.unit?.unitNumber && (
                      <div className="mt-2">
                        <UnitLink unitNumber={a.unit.unitNumber} />
                      </div>
                    )
                  )}
                  {a.recurrenceDays.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {staffCopy.schedule}: {a.recurrenceDays.join(", ")}
                    </p>
                  )}
                </SoftCard>
              ))}
            </div>
          </section>
        )}

        {endedAssociations.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold text-muted-foreground">{staffCopy.pastAt}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {endedAssociations.map((a) => (
                <SoftCard key={a.id} className="p-4 opacity-75">
                  <p className="font-medium">{staffRoleLabel(a.role)}</p>
                  {a.scope === "SOCIETY" || isSocietyStaffRole(a.role) ? (
                    <p className="mt-2 text-sm text-muted-foreground">{staffCopy.societyWide}</p>
                  ) : (
                    a.unit?.unitNumber && (
                      <div className="mt-2">
                        <UnitLink unitNumber={a.unit.unitNumber} />
                      </div>
                    )
                  )}
                </SoftCard>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">{staffCopy.reviewsTitle}</h2>
          <SoftCard accent="gold">
            <StaffReviewForm
              staffPersonId={id}
              initialRating={ownReview?.rating ?? 0}
              initialComment={ownReview?.comment}
            />
          </SoftCard>
          <StaffReviewList
            reviews={reviews.map((r) => ({
              ...r,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
