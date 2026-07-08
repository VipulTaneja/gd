import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellRing,
  Calendar,
  MessageSquare,
  LifeBuoy,
  Building2,
  DoorOpen,
  CreditCard,
  Users,
  Home,
  Phone,
  Sparkles,
  UsersRound,
  HelpCircle,
  Crown,
  Package,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";

export type FeatureKey =
  | "home"
  | "notices"
  | "events"
  | "polls"
  | "tickets"
  | "facilities"
  | "visitors"
  | "dues"
  | "directory"
  | "communities"
  | "notifications"
  | "forums"
  | "team"
  | "contacts"
  | "staff"
  | "faq"
  | "leader"
  | "packages"
  | "files"
  | "profile"
  | "gate";

export interface FeatureStyle {
  icon: LucideIcon;
  label: string;
  bg: string;
  text: string;
  ring: string;
}

export const featureColors: Record<FeatureKey, FeatureStyle> = {
  home: {
    icon: Home,
    label: "Home",
    bg: "bg-gold/15",
    text: "text-gold-dark",
    ring: "ring-gold/30",
  },
  notices: {
    icon: Bell,
    label: "What's new",
    bg: "bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  events: {
    icon: Calendar,
    label: "Events",
    bg: "bg-sky-100",
    text: "text-sky-700",
    ring: "ring-sky-200",
  },
  polls: {
    icon: MessageSquare,
    label: "Polls",
    bg: "bg-violet-100",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
  tickets: {
    icon: LifeBuoy,
    label: "Get help",
    bg: "bg-rose-100",
    text: "text-rose-700",
    ring: "ring-rose-200",
  },
  facilities: {
    icon: Building2,
    label: "Book a spot",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  visitors: {
    icon: DoorOpen,
    label: "Invite a guest",
    bg: "bg-orange-100",
    text: "text-orange-700",
    ring: "ring-orange-200",
  },
  dues: {
    icon: CreditCard,
    label: "Payments",
    bg: "bg-gold/15",
    text: "text-gold-dark",
    ring: "ring-gold/30",
  },
  directory: {
    icon: Users,
    label: "Neighbours",
    bg: "bg-teal-100",
    text: "text-teal-700",
    ring: "ring-teal-200",
  },
  communities: {
    icon: Sparkles,
    label: "Communities",
    bg: "bg-lime-100",
    text: "text-lime-700",
    ring: "ring-lime-200",
  },
  notifications: {
    icon: BellRing,
    label: "Notifications",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
  },
  forums: {
    icon: MessageSquare,
    label: "Forums",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
  },
  team: {
    icon: Users,
    label: "Our Team",
    bg: "bg-pink-100",
    text: "text-pink-700",
    ring: "ring-pink-200",
  },
  contacts: {
    icon: Phone,
    label: "Contacts",
    bg: "bg-blue-100",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  staff: {
    icon: UsersRound,
    label: "Regular help",
    bg: "bg-purple-100",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  faq: {
    icon: HelpCircle,
    label: "Help & FAQ",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    ring: "ring-yellow-200",
  },
  leader: {
    icon: Crown,
    label: "Leader hub",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-200",
  },
  packages: {
    icon: Package,
    label: "Packages",
    bg: "bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  files: {
    icon: FileText,
    label: "Documents",
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
  },
  profile: {
    icon: User,
    label: "My profile",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-200",
  },
  gate: {
    icon: ShieldCheck,
    label: "Gate control",
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-200",
  },
};
