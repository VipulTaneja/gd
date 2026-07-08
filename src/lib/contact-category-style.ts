import {
  Phone,
  Home,
  Wrench,
  Heart,
  Scissors,
  Truck,
  Leaf,
  ShoppingBasket,
  Flower2,
  Pill,
  UtensilsCrossed,
  Sparkles,
  Stethoscope,
  Building,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

export interface ContactCategoryStyle {
  icon: LucideIcon;
  line: string;
  iconBg: string;
  iconColor: string;
}

export const CONTACT_CATEGORY_STYLES: Record<string, ContactCategoryStyle> = {
  "Internal": { icon: Home, line: "bg-amber-400", iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  "Internal Intercom": { icon: Home, line: "bg-orange-400", iconBg: "bg-orange-100", iconColor: "text-orange-700" },
  "Regular Services": { icon: Wrench, line: "bg-emerald-400", iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
  "Personal Care": { icon: Heart, line: "bg-rose-400", iconBg: "bg-rose-100", iconColor: "text-rose-700" },
  "Drycleaner": { icon: Scissors, line: "bg-violet-400", iconBg: "bg-violet-100", iconColor: "text-violet-700" },
  "Courier": { icon: Truck, line: "bg-sky-400", iconBg: "bg-sky-100", iconColor: "text-sky-700" },
  "Gardener": { icon: Leaf, line: "bg-green-400", iconBg: "bg-green-100", iconColor: "text-green-700" },
  "Staples": { icon: ShoppingBasket, line: "bg-teal-400", iconBg: "bg-teal-100", iconColor: "text-teal-700" },
  "Florist": { icon: Flower2, line: "bg-pink-400", iconBg: "bg-pink-100", iconColor: "text-pink-700" },
  "Pharmacy": { icon: Pill, line: "bg-red-400", iconBg: "bg-red-100", iconColor: "text-red-700" },
  "Caterer": { icon: UtensilsCrossed, line: "bg-lime-400", iconBg: "bg-lime-100", iconColor: "text-lime-700" },
  "Boutique & Tailor": { icon: Scissors, line: "bg-purple-400", iconBg: "bg-purple-100", iconColor: "text-purple-700" },
  "White Goods Servicing": { icon: Sparkles, line: "bg-cyan-400", iconBg: "bg-cyan-100", iconColor: "text-cyan-700" },
  "Health": { icon: Stethoscope, line: "bg-blue-400", iconBg: "bg-blue-100", iconColor: "text-blue-700" },
  "Interior Hardware": { icon: Building, line: "bg-slate-400", iconBg: "bg-slate-100", iconColor: "text-slate-700" },
  "Sports": { icon: Dumbbell, line: "bg-indigo-400", iconBg: "bg-indigo-100", iconColor: "text-indigo-700" },
};

const DEFAULT_STYLE: ContactCategoryStyle = {
  icon: Phone,
  line: "bg-muted-foreground/40",
  iconBg: "bg-muted",
  iconColor: "text-muted-foreground",
};

export function contactCategoryStyle(category: string): ContactCategoryStyle {
  return CONTACT_CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
}

/** Canonical contact categories, plus a catch-all "Other" bucket for anything uncategorized. */
export const CONTACT_CATEGORIES = [...Object.keys(CONTACT_CATEGORY_STYLES), "Other"] as const;

export function isValidContactCategory(category: string): boolean {
  return (CONTACT_CATEGORIES as readonly string[]).includes(category);
}
