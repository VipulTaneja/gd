import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Gulshan Dynasty",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p><strong>Last updated:</strong> July 2026</p>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              Gulshan Dynasty Residents&apos; Welfare Association (&quot;we&quot;, &quot;us&quot;) collects information you provide directly:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (name, email, phone number)</li>
              <li>Unit and residency details</li>
              <li>Visitor pass information</li>
              <li>Help ticket submissions</li>
              <li>Facility booking requests</li>
              <li>Community participation (polls, events, notices)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide community management services</li>
              <li>To send important notifications about your residency</li>
              <li>To process visitor passes and facility bookings</li>
              <li>To communicate RWA announcements and notices</li>
              <li>To improve portal functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">3. Data Storage & Security</h2>
            <p>
              Your data is stored securely on infrastructure managed by the RWA. We implement appropriate security measures
              to protect your personal information. Data is not shared with third parties except as required for portal
              functionality (e.g., email notifications via Resend).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">4. Data Retention</h2>
            <p>
              Your account data is retained as long as you are an active resident. Upon move-out, personal data is
              anonymized or deleted within 90 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">5. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of non-essential notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">6. Contact</h2>
            <p>
              For privacy-related inquiries, contact the RWA at the details provided in the portal footer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
