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
  directory: "Neighbours",
  profile: "My profile",
  notifications: "Notifications",
  more: "More",
  regularHelp: "Regular help",
  contacts: "Contacts",
  teamsCommunities: "Teams and Communities",
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
  guestCtaHint: "Book amenities, invite guests, stay in the loop.",
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
  contacts: { title: "No contacts found", description: "Try a different search or category." },
  communities: { title: "No communities available yet", description: "Check back soon — new communities are added regularly." },
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
  ACTIVE: "Active",
  USED: "Used",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  OVERDUE: "Overdue",
  WAIVED: "Waived",
};

export const staff = {
  title: "Regular help",
  subtitle: "Maids, cooks, drivers, guards, and other help across the community",
  addHelp: "Add someone",
  searchPlaceholder: "Search by name or phone…",
  noResults: "No one found — try a different name or number",
  noStaff: "No regular help registered yet",
  noStaffHint: "When households add their help, they will appear here for everyone to see",
  endAssociation: "Remove from my unit",
  addToMyUnit: "Add to my unit",
  filterAllHelp: "All help",
  filterMyUnit: "My unit",
  filterAllTypes: "All types",
  societyWide: "Society-wide",
  endConfirm: "Stop daily passes for this person at your unit?",
  reviewsTitle: "What neighbors say",
  yourReview: "Your rating",
  noReviews: "No ratings yet",
  reviewPlaceholder: "Optional note (max 500 characters)",
  submitReview: "Save rating",
  deleteReview: "Remove my rating",
  profileTitle: "Regular help profile",
  activeAt: "Works at",
  pastAt: "Previously at",
  schedule: "Days",
  expectedToday: "Expected today",
  callStaff: "Call",
} as const;

export const communities = {
  title: "Teams and Communities",
  subtitle: "Browse teams and join communities in your neighbourhood.",
} as const;

export const committee = {
  title: "RWA Committee",
  subtitle: "Current office bearers of the Gulshan Dynasty Residents' Welfare Association",
} as const;

export const contacts = {
  title: "Important contacts",
  subtitle: "Society services, maintenance, and vendor contacts",
  callCta: "Call or message",
  reviewsTitle: "Community ratings",
  yourReview: "Your rating",
  reviewPlaceholder: "Share your experience (optional)",
  submitReview: "Save rating",
  deleteReview: "Remove my rating",
  notReviewable: "Ratings aren't available for this contact",
  noReviews: "No ratings yet — be the first!",
  editContact: "Update details",
  saveContact: "Save changes",
  addedBy: "Added by",
  lastEditedBy: "Last updated by",
  noRating: "Not rated yet",
  crossLinkToStaff: "Looking for individual help (maid, cook, driver)?",
  crossLinkToStaffCta: "Regular help registry",
} as const;

export const faq = {
  title: "Help & FAQ",
  subtitle: "Answers to common questions about life at Gulshan Dynasty",
  emptyTitle: "No FAQs published yet",
  emptyDescription: "Check back soon — the RWA is preparing helpful guides.",
  searchPlaceholder: "Search questions…",
  noSearchResults: "No questions match your search.",
  manageTitle: "Manage FAQ",
  manageSubtitle: "Create sections and answers for residents and guests",
  editFaq: "Edit FAQ",
  viewPublic: "View FAQ",
  addSection: "Add section",
  addQuestion: "Add question",
  newSectionPlaceholder: "Section title (e.g. Visitors)",
  questionPlaceholder: "Question",
  answerPlaceholder: "Write the answer…",
  published: "Published",
  draft: "Draft",
  questions: "questions",
  save: "Save",
  cancel: "Cancel",
  manageEmpty: "No sections yet — add your first section above.",
  deleteSectionConfirm: (count: number) =>
    `Delete this section and all ${count} question(s)? This cannot be undone.`,
  deleteQuestionConfirm: "Delete this question?",
  moveUp: "Move up",
  moveDown: "Move down",
} as const;
