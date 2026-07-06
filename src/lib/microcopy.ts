/** Friendly resident-facing copy — single source of truth (CAS-005) */

export const nav = {
  home: "Home",
  notices: "What's new",
  events: "Events",
  polls: "Polls",
  tickets: "Get help",
  facilities: "Book a spot",
  visitors: "Guests",
  dues: "Payments",
  directory: "Neighbors",
  profile: "My profile",
  notifications: "Notifications",
  more: "More",
} as const;

export const actions = {
  newTicket: "Ask for help",
  newVisitor: "Invite someone",
  newEvent: "Plan an event",
  newPoll: "Start a poll",
  viewAll: "See all",
  signIn: "Sign in",
  signOut: "Sign out",
} as const;

export const greetings = {
  guestTitle: "Welcome to Gulshan Dynasty",
  guestSubtitle: "Your neighborhood, one tap away.",
  loginTitle: "Hey, neighbor 👋",
  loginSubtitle: "Sign in to book amenities, invite guests, and stay in the loop.",
} as const;

export const empty = {
  notices: { title: "All quiet for now", description: "No notices right now — enjoy the calm!" },
  events: { title: "Nothing on the calendar", description: "Check back soon or plan something fun." },
  polls: { title: "No votes open", description: "When the community asks, you'll see it here." },
  tickets: { title: "No open requests", description: "Need something fixed? We're here to help." },
  facilities: { title: "Amenities coming soon", description: "Booking will be available shortly." },
  visitors: { title: "No guest passes yet", description: "Invite friends and family in a few taps." },
  dues: { title: "You're all caught up! 🎉", description: "No pending payments right now." },
  feed: { title: "It's a quiet day", description: "Nothing new — maybe time for chai on the terrace?" },
  forums: { title: "No discussions yet", description: "Start a conversation with your community" },
  forumThreads: { title: "No threads yet", description: "Be the first to start a discussion" },
} as const;

export const priorityLabels: Record<string, string> = {
  EMERGENCY: "Urgent",
  IMPORTANT: "Heads up",
  NORMAL: "FYI",
};

export const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "We're on it",
  RESOLVED: "All sorted",
  CLOSED: "Closed",
  PENDING: "Due soon",
  PAID: "Paid",
};
