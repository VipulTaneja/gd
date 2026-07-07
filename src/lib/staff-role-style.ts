import {
  Baby,
  Car,
  ChefHat,
  Droplets,
  Flower2,
  Shield,
  Sparkles,
  UserRound,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "@/generated/prisma/enums";

export interface StaffRoleStyle {
  icon: LucideIcon;
  line: string;
  iconBg: string;
  iconColor: string;
  pillActive: string;
}

export const STAFF_ROLE_STYLES: Record<StaffRole, StaffRoleStyle> = {
  MAID: {
    icon: Sparkles,
    line: "bg-rose-400",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    pillActive: "bg-rose-100 text-rose-800 ring-rose-200",
  },
  NANNY: {
    icon: Baby,
    line: "bg-pink-400",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    pillActive: "bg-pink-100 text-pink-800 ring-pink-200",
  },
  COOK: {
    icon: ChefHat,
    line: "bg-orange-400",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    pillActive: "bg-orange-100 text-orange-800 ring-orange-200",
  },
  DRIVER: {
    icon: Car,
    line: "bg-sky-400",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    pillActive: "bg-sky-100 text-sky-800 ring-sky-200",
  },
  GARDENER: {
    icon: Flower2,
    line: "bg-emerald-400",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    pillActive: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
  GUARD: {
    icon: Shield,
    line: "bg-slate-500",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    pillActive: "bg-slate-100 text-slate-800 ring-slate-200",
  },
  FACILITY: {
    icon: Wrench,
    line: "bg-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    pillActive: "bg-amber-100 text-amber-900 ring-amber-200",
  },
  ELECTRICIAN: {
    icon: Zap,
    line: "bg-yellow-400",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-700",
    pillActive: "bg-yellow-100 text-yellow-900 ring-yellow-200",
  },
  PLUMBER: {
    icon: Droplets,
    line: "bg-cyan-400",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
    pillActive: "bg-cyan-100 text-cyan-900 ring-cyan-200",
  },
  OTHER: {
    icon: UserRound,
    line: "bg-violet-400",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    pillActive: "bg-violet-100 text-violet-800 ring-violet-200",
  },
};

export const STAFF_ROLE_FILTER_ORDER: StaffRole[] = [
  "MAID",
  "NANNY",
  "COOK",
  "DRIVER",
  "GARDENER",
  "GUARD",
  "FACILITY",
  "ELECTRICIAN",
  "PLUMBER",
  "OTHER",
];

export function staffRoleStyle(role: StaffRole): StaffRoleStyle {
  return STAFF_ROLE_STYLES[role] ?? STAFF_ROLE_STYLES.OTHER;
}
