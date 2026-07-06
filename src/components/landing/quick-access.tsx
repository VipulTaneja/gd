import Link from "next/link";
import { Calendar, AlertCircle, KeyRound, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  {
    icon: Calendar,
    title: "Book Amenity",
    description: "Reserve pool, theatre, or sports facilities",
    href: "/login",
  },
  {
    icon: AlertCircle,
    title: "Raise Ticket",
    description: "Report maintenance issues instantly",
    href: "/login",
  },
  {
    icon: KeyRound,
    title: "Visitor Pass",
    description: "Generate OTP & QR for your guests",
    href: "/login",
  },
  {
    icon: Bell,
    title: "Notices",
    description: "Stay updated with community announcements",
    href: "/login",
  },
];

export function QuickAccessSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold sm:text-4xl">
          What would you like to do?
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Quick access to your most-used community services
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Card className="group cursor-pointer transition-all hover:ring-gold hover:shadow-lg">
                <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                    <link.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">{link.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
