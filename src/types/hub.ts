export interface HubUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  globalRole: string;
  primaryUnit?: {
    unitNumber: string;
    block: string;
    floor: number | null;
  } | null;
}

export interface HubNotice {
  id: string;
  title: string;
  body: string;
  priority: "NORMAL" | "IMPORTANT" | "EMERGENCY";
  publishedAt: Date;
  targetBlock?: string | null;
}

export interface HubEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: Date;
  endsAt: Date;
}

export interface HubPoll {
  id: string;
  title: string;
  description?: string | null;
  closesAt: Date;
  scope: "GLOBAL" | "SUB_COMMUNITY";
}

export interface HubForumThread {
  id: string;
  title: string;
  forumSlug: string;
  lastActivityAt: Date;
  _count: { posts: number };
}

export interface HubFacility {
  id: string;
  name: string;
  location?: string | null;
}

export interface HubShortcut {
  label: string;
  icon: string;
  href: string;
  guestHref: string;
  badge?: number;
}

export interface HubFeedItem {
  type: "notice" | "event" | "poll";
  id: string;
  title: string;
  subtitle?: string;
  timestamp: Date;
  priority?: string;
  link: string;
}

export interface HubBadgeCounts {
  openTickets: number;
  pendingDues: number;
  unreadNotifications: number;
  activePolls: number;
}

export interface HubData {
  user: HubUser | null;
  isResident: boolean;
  notices: HubNotice[];
  events: HubEvent[];
  polls: HubPoll[];
  forumThreads: HubForumThread[];
  facilities: HubFacility[];
  badges: HubBadgeCounts;
  showFaqShortcut: boolean;
}
