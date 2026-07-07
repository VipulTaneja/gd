import Link from "next/link";
import { auth } from "@/lib/auth";
import { listPublicFaq } from "@/lib/faq";
import { buildFaqJsonLd, buildFaqPageMetadata } from "@/lib/faq-metadata";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { FaqLoginRedirect } from "@/components/faq/faq-login-redirect";
import { faq as faqCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildFaqPageMetadata("/faq");
}

export default async function PublicFaqPage() {
  const session = await auth();
  const sections = await listPublicFaq();
  const jsonLd = buildFaqJsonLd(sections);

  if (session?.user?.id) {
    return <FaqLoginRedirect />;
  }

  return (
    <div className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">{faqCopy.title}</h1>
          <p className="mt-2 text-muted-foreground">{faqCopy.subtitle}</p>
        </div>
        <FaqAccordion sections={sections} />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline hover:text-foreground">
            Sign in
          </Link>{" "}
          for the full resident experience, or{" "}
          <Link href="/" className="underline hover:text-foreground">
            return home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
