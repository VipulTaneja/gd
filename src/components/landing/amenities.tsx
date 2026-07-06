import Link from "next/link";
import {
  Waves,
  Building2,
  Sparkles,
  Film,
  Megaphone,
  Trophy,
  CircleDot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const amenities = [
  { icon: Waves, name: "Swimming Pool & Sun Deck", description: "Resort-style pool with sun deck" },
  { icon: Building2, name: "Rooftop Recreation", description: "Sky deck with panoramic views" },
  { icon: Sparkles, name: "Spa & Wellness Center", description: "State-of-the-art spa facilities" },
  { icon: Film, name: "Mini Theatre", description: "Private theatre for movie nights" },
  { icon: Megaphone, name: "Amphitheater", description: "Open-air venue for events" },
  { icon: Trophy, name: "Cricket Pitch", description: "Full-size cricket pitch" },
  { icon: CircleDot, name: "Skating Rink", description: "Roller skating rink" },
];

export function AmenitiesSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold sm:text-4xl">
          Community Amenities
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Book your favourite spaces — pool, theatre, cricket pitch, and more.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {amenities.map((amenity) => (
            <Card key={amenity.name} className="group transition-all hover:ring-gold hover:shadow-lg">
              <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                  <amenity.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-base font-semibold">{amenity.name}</h3>
                <p className="text-sm text-muted-foreground">{amenity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light"
          >
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
}
