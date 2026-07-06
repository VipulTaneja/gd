"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const heroSlides = [
  {
    src: "https://www.gulshandynasty.com/images/banner-1.webp",
    alt: "Gulshan Dynasty exterior view",
  },
  {
    src: "https://www.gulshandynasty.com/images/banner-2.webp",
    alt: "Gulshan Dynasty premium apartments",
  },
  {
    src: "https://www.gulshandynasty.com/images/banner-3.webp",
    alt: "Gulshan Dynasty community living",
  },
];

export function HeroCarousel() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
      className="absolute inset-0"
    >
      <CarouselContent className="h-full">
        {heroSlides.map((slide, i) => (
          <CarouselItem key={i} className="h-full">
            <div className="relative h-full w-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
