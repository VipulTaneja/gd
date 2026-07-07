import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { PhoneLink } from "@/components/shared/phone-link";
import { UnitLink } from "@/components/shared/unit-link";
import { StaffLink } from "@/components/staff/staff-link";
import { QRCodeDisplay } from "./qr-display";

export const dynamic = "force-dynamic";

export default async function VisitorPassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const pass = await db.visitorPass.findUnique({
    where: { id },
    include: {
      unit: { select: { unitNumber: true } },
      staffPerson: { select: { id: true, name: true } },
    },
  });

  if (!pass) notFound();
  if (pass.userId !== session.user!.id) redirect("/visitors");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    USED: "bg-blue-100 text-blue-800",
    EXPIRED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const unitLabel = pass.unit?.unitNumber ?? "Multiple units";

  const whatsappText = encodeURIComponent(
    `Your visitor pass for Gulshan Dynasty:\n\nVisitor: ${pass.visitorName}\nOTP: ${pass.otp}\nUnit: ${unitLabel}\nValid: ${pass.validFrom.toLocaleDateString()} — ${pass.validUntil.toLocaleDateString()}${pass.parkingSlot ? `\nParking: ${pass.parkingSlot}` : ""}`,
  );

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/visitors" className="text-sm text-muted-foreground hover:text-foreground">← Passes</Link>

        <div className="rounded-xl border bg-card p-6 text-center space-y-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[pass.status]}`}>
            {pass.status}
          </span>

          <div>
            <h1 className="font-heading text-2xl font-bold">{pass.visitorName}</h1>
            <p className="text-muted-foreground">{pass.visitorType.replace(/_/g, " ")}</p>
          </div>

          <div className="rounded-lg bg-muted p-6">
            <p className="text-sm text-muted-foreground mb-1">OTP Code</p>
            <p className="font-mono text-3xl sm:text-4xl font-bold tracking-widest break-all">{pass.otp}</p>
          </div>

          <QRCodeDisplay passId={pass.id} otp={pass.otp} unitNumber={unitLabel} />

          <div className="text-sm text-muted-foreground space-y-1">
            {pass.unit?.unitNumber ? (
              <p>Unit: <UnitLink unitNumber={pass.unit.unitNumber} /></p>
            ) : (
              <p>Unit: {unitLabel}</p>
            )}
            {pass.staffPerson && (
              <p>Staff: <StaffLink staffId={pass.staffPerson.id} name={pass.staffPerson.name} /></p>
            )}
            {pass.visitorPhone && (
              <p>
                Phone: <PhoneLink phone={pass.visitorPhone} />
              </p>
            )}
            <p>Valid: {pass.validFrom.toLocaleString()} — {pass.validUntil.toLocaleString()}</p>
            {pass.parkingSlot && <p>Parking: {pass.parkingSlot}</p>}
            {pass.isRecurring && <p>Recurring: {pass.recurrenceDays.join(", ")}</p>}
          </div>

          {pass.status === "ACTIVE" && (
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 w-full sm:w-auto"
            >
              Share via WhatsApp
            </a>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
