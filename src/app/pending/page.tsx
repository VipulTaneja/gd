import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <Image
          src="/logo.webp"
          alt="Gulshan Dynasty"
          width={200}
          height={50}
          className="mx-auto h-12 w-auto"
          priority
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 mx-auto">
          <Clock className="h-8 w-8 text-gold" />
        </div>

        <h1 className="font-heading text-3xl font-bold">Account Pending Approval</h1>

        <p className="text-muted-foreground">
          Thank you for registering with Gulshan Dynasty Community Portal. Your account is
          currently being reviewed by the RWA administrator.
        </p>

        <div className="rounded-lg border bg-card p-4 text-sm text-card-foreground">
          <p className="font-medium">What happens next?</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• An admin will review your registration</li>
            <li>• You&apos;ll receive an email once approved</li>
            <li>• You can then access the full community portal</li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          Need help? Contact the RWA at{" "}
          <a href="mailto:Luxury@gulshangroup.com" className="text-gold hover:underline">
            Luxury@gulshangroup.com
          </a>
        </p>

        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-input px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
