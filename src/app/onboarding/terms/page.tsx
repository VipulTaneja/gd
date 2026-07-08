"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/terms", { method: "POST" });
      if (res.ok) {
        router.push("/onboarding/unit-claim");
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <Image
            src="/logo.webp"
            alt="Gulshan Dynasty"
            width={200}
            height={50}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="mt-6 font-heading text-3xl font-bold">Terms of Use</h1>
          <p className="mt-2 text-muted-foreground">
            Please review and accept the terms before accessing the portal.
          </p>
        </div>

        <div className="max-h-[400px] overflow-y-auto rounded-lg border bg-card p-6 text-sm text-card-foreground">
          <h2 className="font-heading text-lg font-semibold">Gulshan Dynasty Community Portal — Terms of Use</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              <strong>1. Acceptance of Terms</strong><br />
              By accessing and using the Gulshan Dynasty Community Portal (&quot;Portal&quot;), you
              agree to be bound by these Terms of Use. This Portal is operated by the Gulshan
              Dynasty Residents&apos; Welfare Association (&quot;RWA&quot;).
            </p>
            <p>
              <strong>2. Eligibility</strong><br />
              The Portal is available only to residents, owners, tenants, and authorized staff of
              Gulshan Dynasty, Sector 144, Noida. Registration is subject to admin approval.
            </p>
            <p>
              <strong>3. User Responsibilities</strong><br />
              You are responsible for maintaining the confidentiality of your account and for all
              activities that occur under your account. You agree to provide accurate information
              during registration.
            </p>
            <p>
              <strong>4. Privacy</strong><br />
              Your personal information is collected and processed in accordance with our Privacy
              Policy. We do not share your data with third parties except as required for portal
              functionality.
            </p>
            <p>
              <strong>5. Community Guidelines</strong><br />
              Use the Portal respectfully. Do not post offensive content, spam, or misuse community
              features. The RWA reserves the right to suspend accounts that violate these guidelines.
            </p>
            <p>
              <strong>6. Limitation of Liability</strong><br />
              The Portal is provided &quot;as is&quot; without warranties. The RWA is not liable for any
              damages arising from the use of this Portal.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span className="text-sm text-muted-foreground">
            I have read and agree to the Terms of Use and Privacy Policy
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}
