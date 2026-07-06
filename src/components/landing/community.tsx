"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryCarousel } from "./gallery-carousel";

const stats = [
  { value: "5.8", label: "Acres", suffix: "" },
  { value: "3", label: "Towers", suffix: "" },
  { value: "204", label: "Homes", suffix: "" },
];

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const target = parseFloat(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl font-bold text-gold sm:text-5xl">
      {Number.isInteger(target) ? Math.round(count) : count.toFixed(1)}
      {suffix}
    </div>
  );
}

export function CommunitySection() {
  return (
    <section id="about" className="bg-muted/30 py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold sm:text-4xl">Our Community</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          204 homes across 3 towers, set in 5.8 acres of green living in Sector 144, Noida. NCR&apos;s
          first IGBC Platinum-rated community.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-12 sm:gap-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <div className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <GalleryCarousel />
        </div>
      </div>
    </section>
  );
}
