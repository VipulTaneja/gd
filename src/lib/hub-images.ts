/** Hub imagery — local community assets + approved gulshandynasty.com gallery */

export const hubHero = {
  src: "/hero-image.jpeg",
  alt: "Residents celebrating Holi together in the Gulshan Dynasty courtyard",
  width: 1280,
  height: 720,
} as const;

export const hubGallery = [
  {
    src: "https://www.gulshandynasty.com/images/banner-3.webp",
    alt: "Gulshan Dynasty community living",
    width: 1920,
    height: 1080,
  },
  {
    src: "https://www.gulshandynasty.com/images/overview.webp",
    alt: "Gulshan Dynasty towers and green campus",
    width: 1200,
    height: 800,
  },
  {
    src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-5.webp",
    alt: "Gulshan Dynasty landscaped grounds",
    width: 1200,
    height: 800,
  },
] as const;

export const hubEventFallback = {
  src: "/hero-image.jpeg",
  alt: "Community celebration at Gulshan Dynasty",
  width: 1280,
  height: 720,
} as const;

const facilityImageRules: { match: RegExp; src: string; alt: string }[] = [
  {
    match: /pool|swim/i,
    src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-2.webp",
    alt: "Swimming pool",
  },
  {
    match: /gym|fitness/i,
    src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-1.webp",
    alt: "Fitness center",
  },
  {
    match: /garden|park|lawn/i,
    src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-5.webp",
    alt: "Green spaces",
  },
  {
    match: /club|hall|party|lounge/i,
    src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-3.webp",
    alt: "Clubhouse",
  },
];

export function getFacilityImage(name: string) {
  return facilityImageRules.find((r) => r.match.test(name)) ?? null;
}

export const towerHeroTint: Record<string, string> = {
  A: "from-gold/35 via-black/50 to-black/70",
  B: "from-teal-500/30 via-black/50 to-black/70",
  C: "from-rose-500/30 via-black/50 to-black/70",
};

export const defaultHeroTint = "from-gold/25 via-black/45 to-black/65";
