import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Gulshan Dynasty",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">Terms of Use</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p><strong>Last updated:</strong> July 2026</p>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Gulshan Dynasty Community Portal (&quot;the Portal&quot;), you agree to be bound
              by these Terms of Use. The Portal is provided by the Gulshan Dynasty Residents&apos; Welfare Association
              (&quot;the RWA&quot;) for the benefit of residents and community members.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">2. Eligibility</h2>
            <p>
              The Portal is available to verified residents, their family members, and authorized tenants of
              Gulshan Dynasty. Access is subject to approval by the RWA administration.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Provide accurate and up-to-date information</li>
              <li>Use the Portal only for legitimate community purposes</li>
              <li>Do not share your account with non-residents</li>
              <li>Comply with all applicable RWA bylaws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">4. Facility Bookings</h2>
            <p>
              Facility bookings are subject to availability and RWA rules. Cancellations must be made at least
              60 minutes before the booked slot. Repeated no-shows may result in booking restrictions.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">5. Visitor Management</h2>
            <p>
              Residents are responsible for all visitors entering the premises. Visitor passes must be generated
              before arrival. The RWA is not liable for visitor actions within the community.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              The Portal is provided &quot;as is&quot; without warranties. The RWA is not liable for any
              indirect, incidental, or consequential damages arising from Portal use.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">7. Modifications</h2>
            <p>
              The RWA reserves the right to modify these terms at any material changes will be communicated
              through the Portal.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction
              of courts in Noida, Uttar Pradesh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
