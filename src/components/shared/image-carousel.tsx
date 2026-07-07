"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type ImageCarouselSlide = {
  id: string;
  src: string;
  alt: string;
  href?: string | null;
};

interface ImageCarouselProps {
  slides: ImageCarouselSlide[];
  autoplayMs?: number;
  className?: string;
  showControls?: boolean;
  showDots?: boolean;
}

function isExternalImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

function CarouselSlideImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  if (isExternalImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover object-center"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function CarouselSlideFrame({
  slide,
  priority,
}: {
  slide: ImageCarouselSlide;
  priority?: boolean;
}) {
  const content = (
    <div className="relative h-full w-full">
      <CarouselSlideImage src={slide.src} alt={slide.alt} priority={priority} />
    </div>
  );

  if (slide.href) {
    if (slide.href.startsWith("http")) {
      return (
        <a
          href={slide.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-full w-full"
          aria-label={slide.alt}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={slide.href} className="relative block h-full w-full" aria-label={slide.alt}>
        {content}
      </Link>
    );
  }

  return content;
}

function CarouselDots({ className }: { className?: string }) {
  const { api } = useCarousel();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const sync = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    sync();
    api.on("select", sync);
    api.on("reInit", sync);

    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  if (count <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "h-2 rounded-full transition-all",
            index === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75",
          )}
        />
      ))}
    </div>
  );
}

export function ImageCarousel({
  slides,
  autoplayMs = 6000,
  className,
  showControls = true,
  showDots = true,
}: ImageCarouselProps) {
  const plugins = React.useMemo(
    () => (slides.length > 1 ? [Autoplay({ delay: autoplayMs, stopOnInteraction: false })] : []),
    [slides.length, autoplayMs],
  );

  if (slides.length === 0) return null;

  if (slides.length === 1) {
    return (
      <div className={cn("absolute inset-0", className)}>
        <CarouselSlideFrame slide={slides[0]} priority />
      </div>
    );
  }

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={plugins}
      className={cn("absolute inset-0", className)}
    >
      <CarouselContent className="ml-0 h-full">
        {slides.map((slide, index) => (
          <CarouselItem key={slide.id} className="h-full basis-full pl-0">
            <CarouselSlideFrame slide={slide} priority={index === 0} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && (
        <>
          <CarouselPrevious className="left-3 border-white/30 bg-black/40 text-white hover:bg-black/55 disabled:opacity-40" />
          <CarouselNext className="right-3 border-white/30 bg-black/40 text-white hover:bg-black/55 disabled:opacity-40" />
        </>
      )}

      {showDots && (
        <CarouselDots className="absolute bottom-3 left-0 right-0 z-10" />
      )}
    </Carousel>
  );
}
