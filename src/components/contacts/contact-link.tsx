import Link from "next/link";
import { cn } from "@/lib/utils";

interface ContactLinkProps {
  contactId: string;
  label: string;
  className?: string;
}

export function ContactLink({ contactId, label, className }: ContactLinkProps) {
  return (
    <Link
      href={`/contacts/${contactId}`}
      className={cn(
        "text-foreground transition-colors hover:text-gold hover:underline hover:underline-offset-4",
        className,
      )}
    >
      {label}
    </Link>
  );
}
