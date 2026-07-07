"use client";

import type { HubHeroSlideDto } from "@/lib/hub-hero";
import { ImageCarousel } from "@/components/shared/image-carousel";

interface HubHeroCarouselProps {
  slides: HubHeroSlideDto[];
}

export function HubHeroCarousel({ slides }: HubHeroCarouselProps) {
  return (
    <ImageCarousel
      slides={slides.map((slide) => ({
        id: slide.id,
        src: slide.imageUrl,
        alt: slide.altText,
        href: slide.linkUrl,
      }))}
    />
  );
}
