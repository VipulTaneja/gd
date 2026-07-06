"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const galleryImages = [
  { src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-1.webp", alt: "Luxury interiors" },
  { src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-2.webp", alt: "Premium apartments" },
  { src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-3.webp", alt: "Exclusive flats" },
  { src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-4.webp", alt: "Premium project" },
  { src: "https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-5.webp", alt: "Housing complex" },
];

export function GalleryCarousel() {
  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
    >
      <CarouselContent>
        {galleryImages.map((img, i) => (
          <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
