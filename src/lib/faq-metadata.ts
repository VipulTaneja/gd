import type { Metadata } from "next";
import type { FaqSectionDto } from "@/lib/faq";
import { richTextToPlain } from "@/lib/rich-text";
import { faq as faqCopy } from "@/lib/microcopy";

function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildFaqPageMetadata(path: "/faq" | "/faq/app"): Metadata {
  const baseUrl = appBaseUrl();
  const url = `${baseUrl}${path}`;
  const title = faqCopy.title;
  const description = faqCopy.subtitle;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Gulshan Dynasty`,
      description,
      url,
      siteName: "Gulshan Dynasty",
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary",
      title: `${title} | Gulshan Dynasty`,
      description,
    },
    alternates: { canonical: `${baseUrl}/faq` },
  };
}

export function buildFaqJsonLd(sections: FaqSectionDto[]) {
  const mainEntity = sections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: richTextToPlain(item.answer),
      },
    })),
  );

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
