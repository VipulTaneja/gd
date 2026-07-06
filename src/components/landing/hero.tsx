import Link from "next/link";
import { HeroCarousel } from "./hero-carousel";

export function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
      <HeroCarousel />

      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-20 text-center text-white px-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Welcome to
          <br />
          <span className="text-gold">Gulshan Dynasty</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80 sm:text-xl">
          Your community. Your people. Your portal.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light"
          >
            Resident Login
          </Link>
          <Link
            href="#about"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
