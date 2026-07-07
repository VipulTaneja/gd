import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { validateRichTextBody } from "../src/lib/rich-text";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function html(text: string) {
  const parsed = validateRichTextBody(text);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.html;
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { globalRole: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    console.error("No admin user found — run db:seed first");
    process.exit(1);
  }

  const existing = await prisma.faqSection.count();
  if (existing > 0) {
    console.log(`FAQ seed skipped — ${existing} section(s) already exist`);
    return;
  }

  const editor = { createdById: admin.id, lastEditedById: admin.id };

  const sections = [
    {
      title: "Getting started",
      slug: "getting-started",
      description: "Portal basics for new residents",
      sortOrder: 10,
      items: [
        {
          question: "What is the Gulshan Dynasty portal?",
          slug: "what-is-portal",
          answer: html(
            "<p>This is your community hub — notices, amenity bookings, guest passes, helpdesk tickets, and more. Sign in with Google, Apple, or email. New accounts need RWA approval before full access.</p>",
          ),
          sortOrder: 10,
        },
        {
          question: "How do I claim my flat on the portal?",
          slug: "claim-flat",
          answer: html(
            "<p>After signing in, go to <strong>Profile</strong> and submit a unit claim with your tower and flat number. The RWA verifies ownership or tenancy before approving your account.</p>",
          ),
          sortOrder: 20,
        },
        {
          question: "Who can see my phone number?",
          slug: "phone-privacy",
          answer: html(
            "<p>Your mobile number is <strong>never</strong> shown in the public directory. Only your name and unit appear to neighbours. You choose who to share your number with directly.</p>",
          ),
          sortOrder: 30,
        },
      ],
    },
    {
      title: "Visitors & gate",
      slug: "visitors",
      description: "Guest passes, deliveries, and gate entry",
      sortOrder: 20,
      items: [
        {
          question: "How do I invite a guest?",
          slug: "invite-guest",
          answer: html(
            "<p>Go to <strong>Guests</strong> → <strong>New Pass</strong>. Enter your visitor's name, pick a time window, and share the 6-digit OTP via WhatsApp. The guard validates it at the gate.</p>",
          ),
          sortOrder: 10,
        },
        {
          question: "Can my maid enter without a visitor pass every day?",
          slug: "maid-daily-pass",
          answer: html(
            "<p>Add your maid under <strong>Regular Help</strong> (<code>/staff</code>). Once linked to your unit, the system can generate daily gate passes automatically.</p>",
          ),
          sortOrder: 20,
        },
        {
          question: "What if my guest arrives early or late?",
          slug: "guest-timing",
          answer: html(
            "<p>Passes are valid only within the time window you set. Create a new pass or extend the window before they arrive. Guards cannot admit guests outside the approved slot.</p>",
          ),
          sortOrder: 30,
        },
      ],
    },
    {
      title: "Amenities & booking",
      slug: "amenities",
      description: "Pool, theatre, sports facilities, and more",
      sortOrder: 30,
      items: [
        {
          question: "How do I book a facility?",
          slug: "book-facility",
          answer: html(
            "<p>Open <strong>Book a spot</strong>, choose the amenity, and pick an available slot on the calendar. You'll get a confirmation — show it at the facility if asked.</p>",
          ),
          sortOrder: 10,
        },
        {
          question: "What if my preferred slot is full?",
          slug: "waitlist",
          answer: html(
            "<p>Join the <strong>waitlist</strong> for that slot. If someone cancels, the next person on the list is notified. Check your notifications for updates.</p>",
          ),
          sortOrder: 20,
        },
        {
          question: "Can I cancel a booking?",
          slug: "cancel-booking",
          answer: html(
            "<p>Yes — open your booking and tap <strong>Cancel</strong>. Please cancel as early as possible so others can use the slot.</p>",
          ),
          sortOrder: 30,
        },
      ],
    },
    {
      title: "Payments & dues",
      slug: "payments",
      description: "Maintenance bills and UPI payment",
      sortOrder: 40,
      items: [
        {
          question: "How do I pay my maintenance bill?",
          slug: "pay-maintenance",
          answer: html(
            "<p>Open <strong>Payments</strong> to see pending bills. You can scan the society UPI QR code to pay offline, then the treasurer marks it paid in the ledger.</p>",
          ),
          sortOrder: 10,
        },
        {
          question: "Where can I see my payment history?",
          slug: "payment-history",
          answer: html(
            "<p>The <strong>Payments</strong> page shows pending and settled bills for your unit. Contact the treasurer if a payment isn't reflected within a few days.</p>",
          ),
          sortOrder: 20,
        },
      ],
    },
    {
      title: "Maintenance & help",
      slug: "maintenance",
      description: "Reporting issues and getting support",
      sortOrder: 50,
      items: [
        {
          question: "How do I report a maintenance issue?",
          slug: "report-issue",
          answer: html(
            "<p>Go to <strong>Get help</strong> → <strong>Ask for help</strong>. Describe the problem, pick a category (plumbing, electrical, etc.), and attach photos if helpful. You'll get updates as the ticket progresses.</p>",
          ),
          sortOrder: 10,
        },
        {
          question: "What counts as an urgent issue?",
          slug: "urgent-ticket",
          answer: html(
            "<p>Use <strong>Urgent</strong> priority only for safety risks — gas leak, fire hazard, major water flooding, or lift entrapment. For life-threatening emergencies, call security and emergency services first.</p>",
          ),
          sortOrder: 20,
        },
        {
          question: "Who do I contact for society-wide issues?",
          slug: "contact-rwa",
          answer: html(
            "<p>For common-area problems or policy questions, open a helpdesk ticket or check <strong>Important contacts</strong> for vendor numbers. The RWA committee page lists current office bearers.</p>",
          ),
          sortOrder: 30,
        },
      ],
    },
  ];

  for (const section of sections) {
    await prisma.faqSection.create({
      data: {
        title: section.title,
        slug: section.slug,
        description: section.description,
        sortOrder: section.sortOrder,
        isPublished: true,
        ...editor,
        items: {
          create: section.items.map((item) => ({
            question: item.question,
            slug: item.slug,
            answer: item.answer,
            sortOrder: item.sortOrder,
            isPublished: true,
            ...editor,
          })),
        },
      },
    });
  }

  const itemCount = sections.reduce((n, s) => n + s.items.length, 0);
  console.log(`✅ FAQ seed: ${sections.length} sections, ${itemCount} published questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
