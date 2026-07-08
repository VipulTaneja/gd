import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Image
              src="/logo.webp"
              alt="Gulshan Dynasty"
              width={160}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-sm text-primary-foreground/70">
              A complete neighbourhood to compliment your lifestyle.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link href="/login" className="hover:text-gold transition-colors">
                  Resident Login
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="hover:text-gold transition-colors">
                  Book Amenities
                </Link>
              </li>
              <li>
                <Link href="/notices" className="hover:text-gold transition-colors">
                  Notices
                </Link>
              </li>
              <li>
                <Link href="/committee" className="hover:text-gold transition-colors">
                  RWA Committee
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link href="/privacy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold">
              Contact
            </h4>
            <address className="not-italic text-sm text-primary-foreground/70 space-y-2">
              <p>Gulshan Dynasty RWA</p>
              <p>GH-03D, Sector 144</p>
              <p>Noida, UP 201306</p>
              <p className="text-gold">Luxury@gulshangroup.com</p>
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Gulshan Dynasty Residents&apos; Welfare Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
