import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Gulshan Dynasty — Community Portal",
    template: "%s | Gulshan Dynasty",
  },
  description:
    "Your community. Your people. Your portal. Welcome to the Gulshan Dynasty Residents' Welfare Association — NCR's first IGBC Platinum-rated community in Sector 144, Noida.",
  keywords: [
    "Gulshan Dynasty",
    "community portal",
    "residents welfare association",
    "Noida",
    "Sector 144",
    "gated community",
    "RWA",
  ],
  openGraph: {
    title: "Gulshan Dynasty — Community Portal",
    description:
      "Your community. Your people. Your portal. 204 homes across 3 towers in 5.8 acres of green living.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Gulshan Dynasty",
    images: [
      {
        url: "https://www.gulshandynasty.com/images/banner-1.webp",
        width: 1200,
        height: 630,
        alt: "Gulshan Dynasty Community Portal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gulshan Dynasty — Community Portal",
    description:
      "Your community. Your people. Your portal. 204 homes across 3 towers in 5.8 acres of green living.",
    images: ["https://www.gulshandynasty.com/images/banner-1.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="https://www.gulshandynasty.com/images/favicon.png" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
