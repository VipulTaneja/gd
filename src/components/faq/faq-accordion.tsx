"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { RichTextContent } from "@/components/shared/rich-text-content";
import type { FaqSectionDto } from "@/lib/faq";
import { cn } from "@/lib/utils";
import { faq as faqCopy } from "@/lib/microcopy";

interface FaqAccordionProps {
  sections: FaqSectionDto[];
  showSearch?: boolean;
}

export function FaqAccordion({ sections, showSearch = false }: FaqAccordionProps) {
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;

    return sections
      .map((section) => {
        const items = section.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q),
        );
        if (items.length === 0 && !section.title.toLowerCase().includes(q)) {
          return null;
        }
        return { ...section, items: items.length > 0 ? items : section.items };
      })
      .filter(Boolean) as FaqSectionDto[];
  }, [sections, query]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    for (const section of sections) {
      if (section.slug === hash) {
        setOpenSections(new Set([section.id]));
        return;
      }
      for (const item of section.items) {
        const itemAnchor = `${section.slug}-${item.slug}`;
        if (item.slug === hash || itemAnchor === hash) {
          setOpenSections(new Set([section.id]));
          requestAnimationFrame(() => {
            document.getElementById(itemAnchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          return;
        }
      }
    }
  }, [sections]);

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
        <p className="font-medium text-foreground">{faqCopy.emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{faqCopy.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={faqCopy.searchPlaceholder}
          className="[&_input]:rounded-xl"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{faqCopy.noSearchResults}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((section) => {
            const isOpen = openSections.has(section.id) || query.trim() !== "";
            return (
              <section
                key={section.id}
                id={section.slug}
                className="scroll-mt-24 rounded-xl border bg-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenSections((prev) => {
                      const next = new Set(prev);
                      if (next.has(section.id)) next.delete(section.id);
                      else next.add(section.id);
                      return next;
                    });
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <h2 className="font-heading text-base font-semibold">{section.title}</h2>
                    {section.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t divide-y">
                    {section.items.map((item) => {
                      const anchorId = `${section.slug}-${item.slug}`;
                      return (
                        <div key={item.id} id={anchorId} className="scroll-mt-24 px-4 py-4">
                          <h3 className="font-medium text-foreground">{item.question}</h3>
                          <div className="mt-2">
                            <RichTextContent content={item.answer} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
