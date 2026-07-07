import { db } from "@/lib/db";
import { UserLink } from "@/components/shared/user-link";
import { designationTitleLabel } from "@/lib/designation-labels";

export const dynamic = "force-dynamic";

export default async function PublicCommitteePage() {
  const designations = await db.designation.findMany({
    where: {
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: [{ startDate: "desc" }],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold">RWA Committee</h1>
          <p className="mt-3 text-muted-foreground">
            Current office bearers of the Gulshan Dynasty Residents&apos; Welfare Association
          </p>
        </div>

        {designations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Committee information will be available soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {designations.map((d) => (
              <div key={d.id} className="rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold text-xl font-bold">
                  {d.user.name.charAt(0)}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  <UserLink userId={d.user.id} name={d.user.name} className="hover:text-gold" />
                </h3>
                <p className="mt-1 text-sm font-medium text-gold">{designationTitleLabel(d.title)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Since {d.startDate.toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
