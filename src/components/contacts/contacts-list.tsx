"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Star, Loader2 } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { FilterPillRow } from "@/components/shared/filter-pill-row";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerChildren } from "@/components/shared/animated";
import { InlineAlert } from "@/components/shared/inline-alert";
import { contacts as contactsCopy, empty } from "@/lib/microcopy";
import { contactCategoryStyle, CONTACT_CATEGORIES } from "@/lib/contact-category-style";

interface Contact {
  id: string;
  category: string;
  typeOfService: string;
  name: string | null;
  contactNo: string;
  remarks: string | null;
  lastEditedById: string | null;
  lastEditedAt: string;
  lastEditedBy?: { name: string } | null;
  avgRating: number | null;
  reviewCount: number;
}

interface ContactsPageProps {
  contacts: Contact[];
  currentUserId: string;
  isAdmin: boolean;
}

function RatingBadge({ avgRating, reviewCount }: { avgRating: number | null; reviewCount: number }) {
  if (avgRating == null) {
    return <span className="text-xs text-muted-foreground">{contactsCopy.noRating}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      {avgRating}
      <span className="text-muted-foreground font-normal">({reviewCount})</span>
    </span>
  );
}

export function ContactsList({ contacts }: ContactsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addData, setAddData] = useState<{ category: string; typeOfService: string; name: string; contactNo: string; remarks: string }>({
    category: "",
    typeOfService: "",
    name: "",
    contactNo: "",
    remarks: "",
  });
  const [pending, startTransition] = useTransition();

  const categories = useMemo(() => [...new Set(contacts.map((c) => c.category))], [contacts]);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((c) => {
        const matchesSearch = searchQuery === "" ||
          c.typeOfService.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.contactNo.includes(searchQuery);
        const matchesCategory = selectedCategory === null || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [contacts, searchQuery, selectedCategory],
  );

  const groupedContacts = useMemo(
    () =>
      filteredContacts.reduce((acc, contact) => {
        if (!acc[contact.category]) acc[contact.category] = [];
        acc[contact.category].push(contact);
        return acc;
      }, {} as Record<string, Contact[]>),
    [filteredContacts],
  );

  const saveAdd = () => {
    startTransition(async () => {
      setAddError(null);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError(data.error ?? "Failed to add contact");
        return;
      }
      setShowAddForm(false);
      setAddData({ category: "", typeOfService: "", name: "", contactNo: "", remarks: "" });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts..."
          className="flex-1 [&_input]:rounded-xl [&_input]:bg-card [&_input]:py-3 [&_input]:focus-visible:ring-gold"
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Contact</span>
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-heading text-sm font-semibold">New Contact</h3>
          {addError && <InlineAlert>{addError}</InlineAlert>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category *</label>
              <select
                value={addData.category}
                onChange={(e) => setAddData({ ...addData, category: e.target.value })}
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <option value="">Select category</option>
                {CONTACT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Service Type *</label>
              <input
                type="text"
                value={addData.typeOfService}
                onChange={(e) => setAddData({ ...addData, typeOfService: e.target.value })}
                placeholder="e.g. Plumber, Electrician"
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={addData.name}
                onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                placeholder="Contact person name"
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contact No *</label>
              <input
                type="tel"
                value={addData.contactNo}
                onChange={(e) => setAddData({ ...addData, contactNo: e.target.value })}
                placeholder="Phone number"
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Remarks</label>
            <input
              type="text"
              value={addData.remarks}
              onChange={(e) => setAddData({ ...addData, remarks: e.target.value })}
              placeholder="Optional notes"
              className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveAdd}
              disabled={pending || !addData.category || !addData.typeOfService || !addData.contactNo}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Contact
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <FilterPillRow>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`inline-flex min-h-11 shrink-0 snap-start items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${
            selectedCategory === null ? "bg-gold text-black" : "border border-input hover:bg-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const { icon: Icon } = contactCategoryStyle(cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
                selectedCategory === cat ? "bg-gold text-black" : "border border-input hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat}
            </button>
          );
        })}
      </FilterPillRow>

      {Object.entries(groupedContacts).map(([category, items]) => {
        const { icon: Icon, iconBg, iconColor } = contactCategoryStyle(category);

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{category}</h3>
              <span className="text-sm text-muted-foreground">({items.length})</span>
            </div>

            <StaggerChildren className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((contact) => {
                const style = contactCategoryStyle(contact.category);
                const ContactIcon = style.icon;
                return (
                  <Link key={contact.id} href={`/contacts/${contact.id}`}>
                    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md">
                      <div className={`absolute left-0 top-0 h-full w-1 ${style.line}`} />
                      <div className="flex flex-1 flex-col p-3 pl-3.5">
                        <div className="flex items-start gap-2">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.iconBg}`}>
                            <ContactIcon className={`h-4 w-4 ${style.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-sm font-semibold leading-tight group-hover:text-gold">
                              {contact.typeOfService}
                            </p>
                            {contact.name && (
                              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{contact.name}</p>
                            )}
                          </div>
                          <RatingBadge avgRating={contact.avgRating} reviewCount={contact.reviewCount} />
                        </div>
                        {contact.remarks && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{contact.remarks}</p>
                        )}
                        {contact.lastEditedBy && (
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            Updated {new Date(contact.lastEditedAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </StaggerChildren>
          </div>
        );
      })}

      {filteredContacts.length === 0 && (
        <EmptyState icon={Users} title={empty.contacts.title} description={empty.contacts.description} />
      )}
    </div>
  );
}
