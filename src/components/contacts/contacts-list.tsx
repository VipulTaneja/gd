"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Phone, Loader2, Search, Users, Home, Wrench, Heart, Truck, Leaf, ShoppingBasket, Flower2, Pill, UtensilsCrossed, Scissors, Sparkles, Stethoscope, Building, Dumbbell, Plus, Star } from "lucide-react";
import { contacts as contactsCopy } from "@/lib/microcopy";

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

const categoryIcons: Record<string, typeof Phone> = {
  "Internal": Home,
  "Internal Intercom": Home,
  "Regular Services": Wrench,
  "Personal Care": Heart,
  "Drycleaner": Scissors,
  "Courier": Truck,
  "Gardener": Leaf,
  "Staples": ShoppingBasket,
  "Florist": Flower2,
  "Pharmacy": Pill,
  "Caterer": UtensilsCrossed,
  "Boutique & Tailor": Scissors,
  "White Goods Servicing": Sparkles,
  "Health": Stethoscope,
  "Interior Hardware": Building,
  "Sports": Dumbbell,
};

const categoryColors: Record<string, string> = {
  "Internal": "bg-amber-100 text-amber-700",
  "Internal Intercom": "bg-orange-100 text-orange-700",
  "Regular Services": "bg-emerald-100 text-emerald-700",
  "Personal Care": "bg-rose-100 text-rose-700",
  "Drycleaner": "bg-violet-100 text-violet-700",
  "Courier": "bg-sky-100 text-sky-700",
  "Gardener": "bg-green-100 text-green-700",
  "Staples": "bg-amber-100 text-amber-700",
  "Florist": "bg-pink-100 text-pink-700",
  "Pharmacy": "bg-red-100 text-red-700",
  "Caterer": "bg-orange-100 text-orange-700",
  "Boutique & Tailor": "bg-purple-100 text-purple-700",
  "White Goods Servicing": "bg-cyan-100 text-cyan-700",
  "Health": "bg-rose-100 text-rose-700",
  "Interior Hardware": "bg-slate-100 text-slate-700",
  "Sports": "bg-indigo-100 text-indigo-700",
};

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const categories = [...new Set(contacts.map((c) => c.category))];

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = searchQuery === "" ||
      c.typeOfService.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactNo.includes(searchQuery);
    const matchesCategory = selectedCategory === null || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.category]) acc[contact.category] = [];
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const saveAdd = () => {
    startTransition(async () => {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addData),
      });
      if (res.ok) {
        setShowAddForm(false);
        setAddData({ category: "", typeOfService: "", name: "", contactNo: "", remarks: "" });
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-card pl-10 pr-4 py-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-11"
          />
        </div>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category *</label>
              <select
                value={addData.category}
                onChange={(e) => setAddData({ ...addData, category: e.target.value })}
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
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

      <div className="flex gap-2 overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`inline-flex min-h-11 shrink-0 snap-start items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${
            selectedCategory === null ? "bg-gold text-black" : "border border-input hover:bg-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Phone;
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
      </div>

      {Object.entries(groupedContacts).map(([category, items]) => {
        const Icon = categoryIcons[category] || Phone;
        const colorClass = categoryColors[category] || "bg-muted text-muted-foreground";

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{category}</h3>
              <span className="text-sm text-muted-foreground">({items.length})</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="group rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:ring-1 hover:ring-gold/30 min-h-11"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate group-hover:text-gold">{contact.typeOfService}</p>
                      {contact.name && (
                        <p className="text-xs text-muted-foreground truncate">{contact.name}</p>
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
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No contacts found</p>
        </div>
      )}
    </div>
  );
}
