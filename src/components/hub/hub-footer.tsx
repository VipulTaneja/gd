"use client";

import { useState } from "react";
import { ContactRwaDialog } from "./contact-rwa-dialog";

export function HubFooter() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t bg-muted/30 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:pb-0">
        <div className="mx-auto flex flex-col gap-2 sm:flex-row sm:h-10 sm:items-center sm:justify-between max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-0 text-xs text-muted-foreground">
          <span className="truncate">Gulshan Dynasty Residents&apos; Association</span>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setContactOpen(true)}
              className="hover:text-foreground transition-colors"
            >
              Contact RWA
            </button>
            <span aria-hidden="true">·</span>
            <a href="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <span aria-hidden="true">·</span>
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span aria-hidden="true">·</span>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
      <ContactRwaDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
