import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ContactSection() {
  return (
    <section className="bg-muted/30 py-20 px-4">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-center text-3xl font-bold sm:text-4xl">Contact RWA</h2>
        <p className="mt-3 text-center text-muted-foreground">
          Have a question or need assistance? Reach out to the Residents&apos; Welfare Association.
        </p>
        <Card className="mt-10">
          <CardContent className="pt-6">
            <form className="space-y-4" action="/api/enquiry" method="POST">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-gold px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gold-light"
              >
                <Send className="h-4 w-4" />
                Send Enquiry
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
