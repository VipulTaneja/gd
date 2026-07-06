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
  | "notifications"
  | "forums"
  | "team";

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
    label: "Neighbors",
    bg: "bg-teal-100",
    text: "text-teal-700",
    ring: "ring-teal-200",
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
    label: "Meet Our Team",
    bg: "bg-rose-100",
    text: "text-rose-700",
    ring: "ring-rose-200",
  },
};
