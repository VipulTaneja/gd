import { PrismaClient, GlobalRole, ApprovalStatus, UnitRole, TicketCategory, TicketStatus, TicketPriority, PollScope, PollEligibility, ResultVisibility, EventScope, VisitorType, PassStatus, BookingStatus, MoveType, MoveStatus, NoticePriority, DueStatus, DomesticHelpStatus, LostFoundType, LostFoundStatus, NotificationType, CommunityRole, RSVPStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TOWERS = ["A", "B", "C"] as const;
const FLOORS_PER_TOWER = 34;
const UNITS_PER_FLOOR = 2;

const FACILITIES = [
  { name: "Swimming Pool & Sun Deck", description: "Resort-style pool with sun deck", location: "Ground Floor", slotMinutes: 60, capacity: 20, maxAdvDays: 7 },
  { name: "Rooftop Recreation & Sky Deck", description: "Rooftop recreational area with panoramic views", location: "Rooftop", slotMinutes: 120, capacity: 30, maxAdvDays: 14 },
  { name: "Spa & Wellness Center", description: "State-of-the-art spa and wellness facilities", location: "Floor 1", slotMinutes: 60, capacity: 5, maxAdvDays: 7 },
  { name: "Mini Theatre", description: "Private mini theatre for movie screenings", location: "Floor 2", slotMinutes: 180, capacity: 20, maxAdvDays: 14 },
  { name: "Amphitheater", description: "Open-air amphitheater for events", location: "Garden Area", slotMinutes: 120, capacity: 100, maxAdvDays: 30 },
  { name: "Cricket Pitch", description: "Full-size cricket pitch", location: "Sports Area", slotMinutes: 120, capacity: 22, maxAdvDays: 7 },
  { name: "Skating Rink", description: "Roller skating rink", location: "Sports Area", slotMinutes: 60, capacity: 15, maxAdvDays: 7 },
];

function generateUnitNumber(tower: string, floor: number, unit: number): string {
  return `${tower}-${String(floor).padStart(2, "0")}${String(unit).padStart(2, "0")}`;
}

function isDuplex(tower: string, floor: number): boolean {
  return floor >= 33;
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seedProd() {
  console.log("🌱 Running PROD seed...\n");

  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    console.error("❌ SETUP_SECRET environment variable is required for prod seed");
    process.exit(1);
  }

  console.log("📦 Seeding units...");
  const unitData: { unitNumber: string; block: string; floor: number; unitType: "APARTMENT" | "DUPLEX"; areaSqFt: number; parkingSlots: number }[] = [];

  for (const tower of TOWERS) {
    for (let floor = 1; floor <= FLOORS_PER_TOWER; floor++) {
      for (let unit = 1; unit <= UNITS_PER_FLOOR; unit++) {
        const unitNumber = generateUnitNumber(tower, floor, unit);
        const duplex = isDuplex(tower, floor);
        unitData.push({
          unitNumber,
          block: tower,
          floor,
          unitType: duplex ? "DUPLEX" : "APARTMENT",
          areaSqFt: duplex ? 4200 : 2783,
          parkingSlots: duplex ? 3 : 2,
        });
      }
    }
  }

  for (const u of unitData) {
    await prisma.unit.upsert({
      where: { unitNumber: u.unitNumber },
      update: {},
      create: u,
    });
  }
  console.log(`   ✅ ${unitData.length} units created`);

  console.log("\n👤 Creating first SUPER_ADMIN...");
  const adminEmail = `admin+${setupSecret}@gulshandynasty.com`;
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Super Admin",
      email: adminEmail,
      globalRole: "SUPER_ADMIN",
      approvalStatus: "APPROVED",
      isActive: true,
      approvedAt: new Date(),
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`   ✅ SUPER_ADMIN created: ${admin.email}`);

  console.log("\n🏊 Seeding facilities...");
  for (const f of FACILITIES) {
    await prisma.facility.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
  }
  console.log(`   ✅ ${FACILITIES.length} facilities created`);

  console.log("\n📢 Seeding sample notices...");
  await prisma.notice.create({
    data: {
      title: "Welcome to Gulshan Dynasty Portal",
      body: "Welcome to the Gulshan Dynasty Residents' Welfare Association portal. This platform helps you manage your community life — from booking amenities to raising tickets and staying updated with notices.",
      priority: "IMPORTANT",
      createdById: admin.id,
    },
  });
  await prisma.notice.create({
    data: {
      title: "Emergency: Water Supply Maintenance",
      body: "Water supply will be interrupted on Saturday from 10 AM to 4 PM for maintenance work. Please store water accordingly.",
      priority: "EMERGENCY",
      createdById: admin.id,
    },
  });
  console.log("   ✅ 2 sample notices created");

  console.log("\n🎉 PROD seed complete!");
  console.log(`   Admin login: ${adminEmail}`);
}

async function seedForums() {
  console.log("\n💬 Seeding forum categories...");
  const forumData = [
    { slug: "general", name: "General Discussion", description: "Open discussion for all residents", scope: "GLOBAL" as const, sortOrder: 0 },
    { slug: "suggestions", name: "Suggestions & Feedback", description: "Share ideas to improve our community", scope: "GLOBAL" as const, sortOrder: 1 },
    { slug: "announcements", name: "Official Responses", description: "RWA announcements and official responses", scope: "GLOBAL" as const, sortOrder: 2, isReadOnly: true },
  ];

  for (const f of forumData) {
    await prisma.forum.upsert({
      where: { slug: f.slug },
      update: {},
      create: f,
    });
  }
  console.log(`   ✅ ${forumData.length} forum categories created`);
}

async function seedDev() {
  console.log("🌱 Running DEV seed...\n");
  await seedProd();
  await seedForums();
  console.log("\n🔧 Adding DEV-specific data...\n");

  // ─── LOOKUP REAL USERS ─────────────────────────────────────────
  console.log("👤 Looking up existing residents...");
  const lookupUser = async (email: string) => {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) console.warn(`   ⚠️  User not found: ${email}`);
    return u;
  };

  const vipul = await lookupUser("noemail-919891777078@gulshandynasty.local");
  const deepakSapra = await lookupUser("noemail-919811278448@gulshandynasty.local");
  const sumitTayal = await lookupUser("noemail-919811111372@gulshandynasty.local");
  const meenalKumar = await lookupUser("noemail-919560928800@gulshandynasty.local");
  const rajesh = await lookupUser("rajesh@example.com");
  const priya = await lookupUser("priya@example.com");
  const amit = await lookupUser("amit@example.com");
  const neha = await lookupUser("neha@example.com");
  const anita = await lookupUser("anita@example.com");
  const deepa = await lookupUser("deepa@example.com");
  const ravi = await lookupUser("ravi@example.com");
  const meena = await lookupUser("meena@example.com");
  const vikram = await lookupUser("vikram@example.com");
  const karan = await lookupUser("karan@example.com");
  const sneha = await lookupUser("sneha@example.com");
  const arun = await lookupUser("arun@example.com");

  // Additional real residents for variety
  const abhishekAgrawal = await lookupUser("abhishek@mtalkz.com");
  const aditya = await lookupUser("greenaditya@gmail.com");
  const ajayJain = await lookupUser("avnikajain07@gmail.com");
  const amitMittal = await lookupUser("namratakumari@gmail.com");
  const ankit = await lookupUser("ankittayal@thestepindia.com");
  const ashishSaini = await lookupUser("contact@ashishtools.co.in");
  const bhanu = await lookupUser("noemail-919310011010@gulshandynasty.local");
  const deepakGupta = await lookupUser("deepak@yogiassociates.com");
  const gaurav = await lookupUser("gmalil@gmail.com");
  const harish = await lookupUser("harishgoyal@gatewaypapers.com");
  const manik = await lookupUser("manikuppal@gmail.com");
  const mohit = await lookupUser("casinoite@gmail.com");
  const nitin = await lookupUser("nitinkumargupta@gmail.com");
  const pankaj = await lookupUser("noemail-919999960068@gulshandynasty.local");
  const rakesh = await lookupUser("drmalhotra68@gmail.com");
  const sachin = await lookupUser("sachin@advadvise.in");
  const sanjay = await lookupUser("chiragmittal13@gmail.com");
  const sumeet = await lookupUser("sumeet86@gmail.com");
  const sunil = await lookupUser("sunil22sharma@gmail.com");
  const varun = await lookupUser("goyal.v81@gmail.com");
  const salil = await lookupUser("noemail-919871488022@gulshandynasty.local");
  const sameer = await lookupUser("sameer.com@gmail.com");
  const manojBansal = await lookupUser("manoj4506@gmail.com");

  const allUsers = [vipul, deepakSapra, sumitTayal, meenalKumar, rajesh, priya, amit, neha, anita, deepa, ravi, meena, vikram, karan, sneha, arun].filter(Boolean);
  console.log(`   ✅ ${allUsers.length} key users found`);

  // ─── MAKE VIPUL SUPER ADMIN ───────────────────────────────────
  console.log("\n👑 Promoting Vipul Taneja to SUPER_ADMIN...");
  if (vipul) {
    await prisma.user.update({
      where: { id: vipul.id },
      data: { globalRole: "SUPER_ADMIN" },
    });
    console.log("   ✅ Vipul Taneja → SUPER_ADMIN");
  }

  // ─── SUB-COMMUNITIES ──────────────────────────────────────────
  console.log("\n🏘️ Creating sub-communities...");
  const communityDefs = [
    { name: "Tower A Residents", description: "Official group for all Tower A residents — maintenance updates, shared concerns, and social events." },
    { name: "Tower B Residents", description: "Official group for all Tower B residents — stay connected with your tower neighbours." },
    { name: "Tower C Residents", description: "Official group for all Tower C residents — announcements and community discussions." },
    { name: "Infrastructure & Fire Safety", description: "Overseeing building maintenance, fire safety compliance, structural repairs, and emergency preparedness across all towers." },
    { name: "Sports & Recreation", description: "Organizing cricket tournaments, badminton matches, yoga sessions, and all sports activities in the community." },
    { name: "Cultural Activities", description: "Planning and executing festival celebrations, cultural evenings, art workshops, music sessions, and community performances." },
    { name: "Garden Club", description: "For gardening enthusiasts. Share tips, organize terrace garden meetups, and plan community green drives." },
    { name: "Fitness Group", description: "Morning workout buddies, yoga sessions, jogging groups, and healthy living discussions." },
    { name: "Book Club", description: "Monthly book discussions, reading recommendations, and literary evenings." },
    { name: "Kids Activity Club", description: "Activities, workshops, and playdates for children in the community." },
    { name: "Senior Citizens' Circle", description: "A warm space for senior residents — health talks, cultural evenings, and daily chai meetups." },
  ];

  const createdCommunities = [];
  for (const c of communityDefs) {
    const sc = await prisma.subCommunity.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    createdCommunities.push(sc);
  }

  // Map communities by name for easy lookup
  const byName = Object.fromEntries(createdCommunities.map(c => [c.name, c]));
  console.log(`   ✅ ${communityDefs.length} sub-communities created`);

  // ─── COMMUNITY LEADERSHIP & MEMBERSHIPS ───────────────────────
  console.log("\n🔗 Creating community memberships with leadership...");
  const cmData: { userId: string; subCommunityId: string; role: CommunityRole }[] = [];

  const addMember = (user: { id: string } | null, community: string, role: CommunityRole) => {
    if (user) cmData.push({ userId: user.id, subCommunityId: byName[community].id, role });
  };

  // Infrastructure & Fire Safety — Deepak Sapra as head
  addMember(deepakSapra, "Infrastructure & Fire Safety", "ADMIN");
  addMember(vipul, "Infrastructure & Fire Safety", "MEMBER");
  addMember(rajesh, "Infrastructure & Fire Safety", "MEMBER");
  addMember(deepakGupta, "Infrastructure & Fire Safety", "MEMBER");
  addMember(salil, "Infrastructure & Fire Safety", "MEMBER");
  addMember(rakesh, "Infrastructure & Fire Safety", "MEMBER");
  addMember(harish, "Infrastructure & Fire Safety", "MEMBER");

  // Sports & Recreation — Sumit Tayal as head
  addMember(sumitTayal, "Sports & Recreation", "ADMIN");
  addMember(vikram, "Sports & Recreation", "MEMBER");
  addMember(karan, "Sports & Recreation", "MEMBER");
  addMember(sunil, "Sports & Recreation", "MEMBER");
  addMember(sameer, "Sports & Recreation", "MEMBER");
  addMember(mohit, "Sports & Recreation", "MEMBER");
  addMember(anita, "Sports & Recreation", "MEMBER");
  addMember(aditya, "Sports & Recreation", "MEMBER");

  // Cultural Activities — Meenal Kumar as head
  addMember(meenalKumar, "Cultural Activities", "ADMIN");
  addMember(priya, "Cultural Activities", "MEMBER");
  addMember(neha, "Cultural Activities", "MEMBER");
  addMember(deepa, "Cultural Activities", "MEMBER");
  addMember(sneha, "Cultural Activities", "MEMBER");
  addMember(meena, "Cultural Activities", "MEMBER");
  addMember(anita, "Cultural Activities", "MEMBER");
  addMember(manik, "Cultural Activities", "MEMBER");

  // Tower A — Rajesh as admin
  addMember(rajesh, "Tower A Residents", "ADMIN");
  addMember(priya, "Tower A Residents", "MEMBER");
  addMember(anita, "Tower A Residents", "MEMBER");
  addMember(deepa, "Tower A Residents", "MEMBER");
  addMember(meenalKumar, "Tower A Residents", "MEMBER");
  addMember(nitin, "Tower A Residents", "MEMBER");

  // Tower B — Amit as admin
  addMember(amit, "Tower B Residents", "ADMIN");
  addMember(neha, "Tower B Residents", "MEMBER");
  addMember(ravi, "Tower B Residents", "MEMBER");
  addMember(sneha, "Tower B Residents", "MEMBER");
  addMember(gaurav, "Tower B Residents", "MEMBER");
  addMember(gaurav, "Tower B Residents", "MEMBER");

  // Tower C — Vipul as admin
  addMember(vipul, "Tower C Residents", "ADMIN");
  addMember(deepakSapra, "Tower C Residents", "MEMBER");
  addMember(sumitTayal, "Tower C Residents", "MEMBER");
  addMember(meena, "Tower C Residents", "MEMBER");
  addMember(vikram, "Tower C Residents", "MEMBER");
  addMember(varun, "Tower C Residents", "MEMBER");

  // Garden Club
  addMember(anita, "Garden Club", "ADMIN");
  addMember(deepa, "Garden Club", "MEMBER");
  addMember(meena, "Garden Club", "MEMBER");
  addMember(bhanu, "Garden Club", "MEMBER");
  addMember(ajayJain, "Garden Club", "MEMBER");

  // Fitness Group
  addMember(karan, "Fitness Group", "ADMIN");
  addMember(amit, "Fitness Group", "MEMBER");
  addMember(sunil, "Fitness Group", "MEMBER");
  addMember(sanjay, "Fitness Group", "MEMBER");
  addMember(sumeet, "Fitness Group", "MEMBER");

  // Book Club
  addMember(neha, "Book Club", "ADMIN");
  addMember(priya, "Book Club", "MEMBER");
  addMember(sneha, "Book Club", "MEMBER");
  addMember(deepa, "Book Club", "MEMBER");
  addMember(manik, "Book Club", "MEMBER");

  // Kids Activity Club
  addMember(priya, "Kids Activity Club", "ADMIN");
  addMember(neha, "Kids Activity Club", "MEMBER");
  addMember(meenalKumar, "Kids Activity Club", "MEMBER");
  addMember(ravi, "Kids Activity Club", "MEMBER");

  // Senior Citizens' Circle
  addMember(anita, "Senior Citizens' Circle", "ADMIN");
  addMember(deepa, "Senior Citizens' Circle", "MEMBER");
  addMember(harish, "Senior Citizens' Circle", "MEMBER");
  addMember(bhanu, "Senior Citizens' Circle", "MEMBER");

  for (const cm of cmData) {
    const existing = await prisma.communityMembership.findUnique({
      where: { userId_subCommunityId: { userId: cm.userId, subCommunityId: cm.subCommunityId } },
    });
    if (!existing) {
      await prisma.communityMembership.create({ data: cm });
    }
  }
  console.log(`   ✅ ${cmData.length} community memberships created`);

  // ─── DESIGNATIONS (RWA COMMITTEE) ─────────────────────────────
  console.log("\n🏛️ Creating RWA committee designations...");
  const designationData = [
    { userId: vipul?.id!, title: "President", startDate: daysAgo(365) },
    { userId: rajesh?.id!, title: "Vice President", startDate: daysAgo(365) },
    { userId: deepakSapra?.id!, title: "Infrastructure & Fire Safety Head", startDate: daysAgo(365) },
    { userId: sumitTayal?.id!, title: "Sports & Recreation Head", startDate: daysAgo(365) },
    { userId: meenalKumar?.id!, title: "Cultural Activities Head", startDate: daysAgo(180) },
    { userId: anita?.id!, title: "Garden & Environment Head", startDate: daysAgo(365) },
    { userId: amit?.id!, title: "Treasurer", startDate: daysAgo(365) },
  ].filter(d => d.userId);

  for (const d of designationData) {
    const existing = await prisma.designation.findFirst({
      where: { userId: d.userId, title: d.title, startDate: d.startDate },
    });
    if (!existing) {
      await prisma.designation.create({ data: d });
    }
  }
  console.log(`   ✅ ${designationData.length} designations created`);

  // ─── NOTICES ───────────────────────────────────────────────────
  console.log("\n📢 Seeding notices...");
  const noticeData = [
    { title: "Monthly Maintenance Bill — July 2026", body: "The July 2026 maintenance bills have been generated. Please check your dues section and pay before the 15th to avoid late fees. For any discrepancies, contact the office.", priority: "IMPORTANT" as NoticePriority, targetBlock: null },
    { title: "Tower B Lift Maintenance — 12th July", body: "Lift No. 2 in Tower B will be out of service on 12th July (Saturday) from 9 AM to 5 PM for annual maintenance. Please use the stairs or Lift No. 1.", priority: "IMPORTANT" as NoticePriority, targetBlock: "B" },
    { title: "Emergency: Fire Alarm Testing — All Towers", body: "Annual fire alarm testing will be conducted on 10th July between 10 AM and 12 PM. Expect loud alarms. Please do not panic.", priority: "EMERGENCY" as NoticePriority, targetBlock: null },
    { title: "Independence Day Celebration — 15th August", body: "Join us for the Independence Day flag hoisting ceremony at 8 AM in the central garden area, followed by cultural performances by kids. Refreshments will be served.", priority: "NORMAL" as NoticePriority, targetBlock: null },
    { title: "Tower C Water Tank Cleaning", body: "The overhead water tanks in Tower C will be cleaned on 18th July from 6 AM to 10 AM. Water supply will be temporarily interrupted during this period.", priority: "IMPORTANT" as NoticePriority, targetBlock: "C" },
    { title: "New Parking Guidelines — Effective Immediately", body: "Please ensure your vehicles are parked within designated slots only. Visitor vehicles must be parked in the ground-floor visitor bay. Vehicles blocking fire exits will be towed at owner's expense.", priority: "IMPORTANT" as NoticePriority, targetBlock: null },
    { title: "Community Garden — Volunteer Call", body: "We are planning to set up a terrace garden on the 2nd floor of each tower. Interested residents, please join the Garden Club sub-community or contact Anita Reddy.", priority: "NORMAL" as NoticePriority, targetBlock: null },
    { title: "Security Advisory — Stranger Entry", body: "In view of recent incidents in the neighbourhood, please ensure all visitors are verified at the gate before allowing entry. Report any suspicious activity to security immediately.", priority: "IMPORTANT" as NoticePriority, targetBlock: null },
    { title: "Tower A Common Area Painting", body: "Tower A common areas (lobby, corridors, and staircase) will be repainted starting 20th July. Work will be done floor-by-floor over 2 weeks. Please cooperate with the painters.", priority: "NORMAL" as NoticePriority, targetBlock: "A" },
    { title: "Diwali Celebrations — Pre-booking Open", body: "We are organizing a grand Diwali mela on 18th October at the amphitheater. Food stalls, cultural performances, and a raffle draw! Book your stall or performance slot now.", priority: "NORMAL" as NoticePriority, targetBlock: null },
  ];

  for (const n of noticeData) {
    const existing = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!existing) {
      await prisma.notice.create({
        data: { ...n, createdById: vipul?.id!, publishedAt: daysAgo(Math.floor(Math.random() * 10) + 1) },
      });
    }
  }
  console.log(`   ✅ ${noticeData.length} notices created`);

  // ─── POLLS ─────────────────────────────────────────────────────
  console.log("\n📊 Creating polls...");
  const poll1 = await prisma.poll.create({
    data: {
      title: "Best time for gardening workshops?",
      description: "When would you prefer to attend gardening workshops organized by the Garden Club?",
      scope: "GLOBAL",
      eligibility: "ALL_RESIDENTS",
      isAnonymous: false,
      resultVisibility: "LIVE",
      opensAt: daysAgo(3),
      closesAt: daysFromNow(4),
      createdById: rajesh?.id!,
      options: {
        create: [
          { label: "Weekday mornings (7–9 AM)", order: 0 },
          { label: "Weekday evenings (5–7 PM)", order: 1 },
          { label: "Saturday mornings (8–10 AM)", order: 2 },
          { label: "Sunday mornings (8–10 AM)", order: 3 },
        ],
      },
    },
  });

  const poll2 = await prisma.poll.create({
    data: {
      title: "Proposal: Upgrade gym equipment",
      description: "The current gym equipment is over 3 years old. Should we allocate ₹5,00,000 from the maintenance fund to purchase new treadmills, ellipticals, and a functional training rig?",
      scope: "GLOBAL",
      eligibility: "OWNERS_ONLY",
      isAnonymous: false,
      resultVisibility: "AFTER_CLOSE",
      opensAt: daysAgo(10),
      closesAt: daysAgo(3),
      createdById: vipul?.id!,
      options: {
        create: [
          { label: "Yes, approve the upgrade", order: 0 },
          { label: "No, use funds elsewhere", order: 1 },
          { label: "Reduce budget and do partial upgrade", order: 2 },
        ],
      },
    },
  });

  const poll3 = await prisma.poll.create({
    data: {
      title: "Which movie should we screen this Saturday?",
      description: "Vote for this weekend's movie night at the Mini Theatre. Popcorn is on us!",
      scope: "GLOBAL",
      eligibility: "ALL_RESIDENTS",
      isAnonymous: false,
      resultVisibility: "LIVE",
      opensAt: daysAgo(1),
      closesAt: daysFromNow(2),
      createdById: neha?.id!,
      options: {
        create: [
          { label: "3 Idiots", order: 0 },
          { label: "Dangal", order: 1 },
          { label: "Zindagi Na Milegi Dobara", order: 2 },
          { label: "PK", order: 3 },
        ],
      },
    },
  });

  const poll4 = await prisma.poll.create({
    data: {
      title: "Festival decoration budget per tower",
      description: "How much should each tower spend on common area decorations for upcoming festivals? Current proposal is ₹15,000 per tower per festival.",
      scope: "GLOBAL",
      eligibility: "ONE_PER_UNIT",
      isAnonymous: true,
      resultVisibility: "AFTER_CLOSE",
      opensAt: daysFromNow(2),
      closesAt: daysFromNow(12),
      createdById: meenalKumar?.id!,
      options: {
        create: [
          { label: "₹10,000 — keep it minimal", order: 0 },
          { label: "₹15,000 — moderate decorations", order: 1 },
          { label: "₹25,000 — go all out!", order: 2 },
          { label: "No decoration budget needed", order: 3 },
        ],
      },
    },
  });

  const poll5 = await prisma.poll.create({
    data: {
      title: "Book Club: Next month's pick",
      description: "Vote for our next book! We'll discuss it on the last Saturday of the month.",
      scope: "SUB_COMMUNITY",
      subCommunityId: byName["Book Club"].id,
      eligibility: "ALL_RESIDENTS",
      isAnonymous: false,
      resultVisibility: "LIVE",
      opensAt: daysAgo(5),
      closesAt: daysFromNow(2),
      createdById: neha?.id!,
      options: {
        create: [
          { label: "The White Tiger — Aravind Adiga", order: 0 },
          { label: "Half Girlfriend — Chetan Bhagat", order: 1 },
          { label: "The Immortals of Meluha — Amish Tripathi", order: 2 },
        ],
      },
    },
  });

  const poll6 = await prisma.poll.create({
    data: {
      title: "Which sports should be included in the annual tournament?",
      description: "Sumit Tayal is organizing the annual sports tournament. Vote for the events you'd like to participate in!",
      scope: "GLOBAL",
      eligibility: "ALL_RESIDENTS",
      isAnonymous: false,
      resultVisibility: "LIVE",
      opensAt: daysAgo(2),
      closesAt: daysFromNow(5),
      createdById: sumitTayal?.id!,
      options: {
        create: [
          { label: "Cricket", order: 0 },
          { label: "Badminton", order: 1 },
          { label: "Table Tennis", order: 2 },
          { label: "Carrom", order: 3 },
          { label: "Chess", order: 4 },
        ],
      },
    },
  });
  console.log("   ✅ 6 polls created");

  // ─── VOTES ─────────────────────────────────────────────────────
  console.log("\n🗳️ Creating votes...");
  const poll1Opts = await prisma.pollOption.findMany({ where: { pollId: poll1.id }, orderBy: { order: "asc" } });
  const poll2Opts = await prisma.pollOption.findMany({ where: { pollId: poll2.id }, orderBy: { order: "asc" } });
  const poll3Opts = await prisma.pollOption.findMany({ where: { pollId: poll3.id }, orderBy: { order: "asc" } });
  const poll5Opts = await prisma.pollOption.findMany({ where: { pollId: poll5.id }, orderBy: { order: "asc" } });
  const poll6Opts = await prisma.pollOption.findMany({ where: { pollId: poll6.id }, orderBy: { order: "asc" } });

  const votes = [
    // Poll 1 — gardening workshops
    { pollId: poll1.id, optionId: poll1Opts[2].id, userId: rajesh?.id! },
    { pollId: poll1.id, optionId: poll1Opts[0].id, userId: priya?.id! },
    { pollId: poll1.id, optionId: poll1Opts[2].id, userId: amit?.id! },
    { pollId: poll1.id, optionId: poll1Opts[3].id, userId: neha?.id! },
    { pollId: poll1.id, optionId: poll1Opts[2].id, userId: anita?.id! },
    { pollId: poll1.id, optionId: poll1Opts[0].id, userId: deepa?.id! },
    { pollId: poll1.id, optionId: poll1Opts[2].id, userId: meena?.id! },
    // Poll 2 — gym upgrade (closed)
    { pollId: poll2.id, optionId: poll2Opts[0].id, userId: rajesh?.id! },
    { pollId: poll2.id, optionId: poll2Opts[0].id, userId: priya?.id! },
    { pollId: poll2.id, optionId: poll2Opts[2].id, userId: amit?.id! },
    { pollId: poll2.id, optionId: poll2Opts[0].id, userId: neha?.id! },
    { pollId: poll2.id, optionId: poll2Opts[1].id, userId: anita?.id! },
    { pollId: poll2.id, optionId: poll2Opts[0].id, userId: deepa?.id! },
    { pollId: poll2.id, optionId: poll2Opts[0].id, userId: ravi?.id! },
    { pollId: poll2.id, optionId: poll2Opts[2].id, userId: karan?.id! },
    // Poll 3 — movie night
    { pollId: poll3.id, optionId: poll3Opts[0].id, userId: rajesh?.id! },
    { pollId: poll3.id, optionId: poll3Opts[2].id, userId: priya?.id! },
    { pollId: poll3.id, optionId: poll3Opts[0].id, userId: neha?.id! },
    { pollId: poll3.id, optionId: poll3Opts[1].id, userId: anita?.id! },
    { pollId: poll3.id, optionId: poll3Opts[2].id, userId: deepa?.id! },
    { pollId: poll3.id, optionId: poll3Opts[0].id, userId: karan?.id! },
    // Poll 5 — book club
    { pollId: poll5.id, optionId: poll5Opts[0].id, userId: neha?.id! },
    { pollId: poll5.id, optionId: poll5Opts[2].id, userId: priya?.id! },
    { pollId: poll5.id, optionId: poll5Opts[0].id, userId: sneha?.id! },
    // Poll 6 — sports tournament
    { pollId: poll6.id, optionId: poll6Opts[0].id, userId: sumitTayal?.id! },
    { pollId: poll6.id, optionId: poll6Opts[1].id, userId: vikram?.id! },
    { pollId: poll6.id, optionId: poll6Opts[0].id, userId: karan?.id! },
    { pollId: poll6.id, optionId: poll6Opts[2].id, userId: rajesh?.id! },
    { pollId: poll6.id, optionId: poll6Opts[3].id, userId: amit?.id! },
    { pollId: poll6.id, optionId: poll6Opts[0].id, userId: deepakSapra?.id! },
  ].filter(v => v.userId);

  for (const v of votes) {
    const existing = await prisma.vote.findFirst({ where: { pollId: v.pollId, userId: v.userId } });
    if (!existing) {
      await prisma.vote.create({ data: v });
    }
  }
  console.log(`   ✅ ${votes.length} votes created`);

  // ─── EVENTS ────────────────────────────────────────────────────
  console.log("\n📅 Creating events...");
  const eventData = [
    {
      title: "Community Meet & Greet", description: "Join your neighbors for a casual meet and greet session at the rooftop recreation center. Light snacks and chai will be served.",
      location: "Rooftop Recreation Center", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(14), endsAt: new Date(daysFromNow(14).getTime() + 2 * 60 * 60 * 1000), maxAttendees: 50, createdById: rajesh?.id!,
    },
    {
      title: "Morning Yoga — Every Sunday", description: "Start your Sunday with a rejuvenating yoga session. Open to all fitness levels. Mats provided. Wear comfortable clothing.",
      location: "Amphitheater Lawn", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(5), endsAt: new Date(daysFromNow(5).getTime() + 90 * 60 * 1000), maxAttendees: 30, createdById: karan?.id!,
    },
    {
      title: "Kids Cricket Tournament", description: "Annual inter-tower cricket tournament for kids aged 8–15. Teams of 6. Trophies for winners! Register with Vikram Singh.",
      location: "Cricket Pitch", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(21), endsAt: new Date(daysFromNow(21).getTime() + 4 * 60 * 60 * 1000), maxAttendees: 40, createdById: sumitTayal?.id!,
    },
    {
      title: "Book Club Monthly Meet", description: "This month we're discussing 'The God of Small Things' by Arundhati Roy. Bring your copy and your thoughts. Tea and biscuits provided.",
      location: "Mini Theatre Lobby", scope: "SUB_COMMUNITY" as EventScope, subCommunityId: byName["Book Club"].id, startsAt: daysFromNow(10), endsAt: new Date(daysFromNow(10).getTime() + 2 * 60 * 60 * 1000), maxAttendees: 15, createdById: neha?.id!,
    },
    {
      title: "Tower A Annual Maintenance Meeting", description: "Annual general meeting for Tower A owners. Agenda: maintenance budget review, elevator modernization proposal, and common area renovation plan.",
      location: "Mini Theatre", scope: "SUB_COMMUNITY" as EventScope, subCommunityId: byName["Tower A Residents"].id, startsAt: daysFromNow(7), endsAt: new Date(daysFromNow(7).getTime() + 2 * 60 * 60 * 1000), maxAttendees: 40, createdById: rajesh?.id!,
    },
    {
      title: "Weekend Badminton", description: "Friendly badminton doubles every Saturday morning. All skill levels welcome. Rackets available if you don't have one.",
      location: "Sports Area", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(6), endsAt: new Date(daysFromNow(6).getTime() + 2 * 60 * 60 * 1000), maxAttendees: 16, createdById: sumitTayal?.id!,
    },
    {
      title: "Senior Citizens' Health Camp", description: "Free health checkup camp — blood pressure, sugar, BMI, and basic cardiac screening. Organized in collaboration with Fortis Hospital.",
      location: "Ground Floor Community Hall", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(28), endsAt: new Date(daysFromNow(28).getTime() + 5 * 60 * 60 * 1000), maxAttendees: 60, createdById: vipul?.id!,
    },
    {
      title: "Cultural Night — Diwali Special", description: "An evening of dance performances, skits, and music to celebrate Diwali. Open mic for residents! Contact Meenal Kumar to register your act.",
      location: "Amphitheater", scope: "GLOBAL" as EventScope, startsAt: daysFromNow(45), endsAt: new Date(daysFromNow(45).getTime() + 4 * 60 * 60 * 1000), maxAttendees: 100, createdById: meenalKumar?.id!,
    },
  ];

  const createdEvents = [];
  for (const e of eventData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      const ev = await prisma.event.create({ data: e });
      createdEvents.push(ev);
    }
  }
  console.log(`   ✅ ${eventData.length} events created`);

  // ─── RSVPs ─────────────────────────────────────────────────────
  console.log("\n✋ Creating RSVPs...");
  if (createdEvents.length >= 3) {
    const rsvpData = [
      { eventId: createdEvents[0].id, userId: priya?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[0].id, userId: amit?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[0].id, userId: neha?.id!, status: "MAYBE" as RSVPStatus },
      { eventId: createdEvents[0].id, userId: anita?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[0].id, userId: deepa?.id!, status: "DECLINED" as RSVPStatus },
      { eventId: createdEvents[1].id, userId: rajesh?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[1].id, userId: priya?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[1].id, userId: karan?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[2].id, userId: vikram?.id!, status: "ACCEPTED" as RSVPStatus },
      { eventId: createdEvents[2].id, userId: ravi?.id!, status: "ACCEPTED" as RSVPStatus },
    ].filter(r => r.userId);

    for (const r of rsvpData) {
      const existing = await prisma.rSVP.findUnique({ where: { eventId_userId: { eventId: r.eventId, userId: r.userId } } });
      if (!existing) {
        await prisma.rSVP.create({ data: r });
      }
    }
    console.log(`   ✅ ${rsvpData.length} RSVPs created`);
  }

  // ─── VISITOR PASSES ────────────────────────────────────────────
  console.log("\n🎫 Creating visitor passes...");
  const unitLookup = async (unitNumber: string) => prisma.unit.findUnique({ where: { unitNumber } });
  const unitC1702 = await unitLookup("C-1702");
  const unitC0301 = await unitLookup("C-0301");
  const unitC0201 = await unitLookup("C-0201");
  const unitA2502 = await unitLookup("A-2502");
  const unitA0101 = await unitLookup("A-0101");
  const unitB1201 = await unitLookup("B-1201");

  const visitorPasses = [
    { userId: vipul?.id!, unitId: unitC1702?.id!, visitorName: "Ramesh Agarwal", visitorPhone: "+91-9999911111", visitorType: "GUEST" as VisitorType, otp: "4821", validFrom: daysFromNow(0), validUntil: daysFromNow(1), status: "ACTIVE" as PassStatus, parkingSlot: "V-01" },
    { userId: deepakSapra?.id!, unitId: unitC0301?.id!, visitorName: "Flipkart Delivery", visitorPhone: "+91-8888822222", visitorType: "DELIVERY" as VisitorType, otp: "7392", validFrom: daysFromNow(0), validUntil: daysFromNow(0), status: "ACTIVE" as PassStatus },
    { userId: priya?.id!, unitId: unitA0101?.id!, visitorName: "Sunil Kumar (Plumber)", visitorPhone: "+91-7777733333", visitorType: "DAILY_HELP" as VisitorType, otp: "1563", validFrom: daysAgo(5), validUntil: daysFromNow(25), status: "ACTIVE" as PassStatus, isRecurring: true, recurrenceDays: ["MON", "WED", "FRI"] },
    { userId: amit?.id!, unitId: unitB1201?.id!, visitorName: "Mamta Devi (Housekeeper)", visitorPhone: "+91-6666644444", visitorType: "DAILY_HELP" as VisitorType, otp: "8247", validFrom: daysAgo(30), validUntil: daysFromNow(60), status: "ACTIVE" as PassStatus, isRecurring: true, recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"] },
    { userId: vipul?.id!, unitId: unitC1702?.id!, visitorName: "Ola Cab", visitorPhone: "+91-5555555555", visitorType: "CAB" as VisitorType, otp: "3190", validFrom: daysAgo(2), validUntil: daysAgo(2), status: "USED" as PassStatus, usedAt: daysAgo(2) },
    { userId: sumitTayal?.id!, unitId: unitC0201?.id!, visitorName: "Sumit's Parents", visitorPhone: "+91-4444466666", visitorType: "GUEST" as VisitorType, otp: "6754", validFrom: daysAgo(7), validUntil: daysAgo(4), status: "USED" as PassStatus, usedAt: daysAgo(7) },
    { userId: meenalKumar?.id!, unitId: unitA2502?.id!, visitorName: "Amazon Delivery", visitorPhone: "+91-3333377777", visitorType: "DELIVERY" as VisitorType, otp: "9028", validFrom: daysAgo(1), validUntil: daysAgo(1), status: "EXPIRED" as PassStatus },
  ].filter(vp => vp.userId && vp.unitId);

  for (const vp of visitorPasses) {
    const existing = await prisma.visitorPass.findFirst({ where: { userId: vp.userId, visitorName: vp.visitorName, otp: vp.otp } });
    if (!existing) {
      await prisma.visitorPass.create({ data: vp });
    }
  }
  console.log(`   ✅ ${visitorPasses.length} visitor passes created`);

  // ─── HELP TICKETS ──────────────────────────────────────────────
  console.log("\n🔧 Creating help tickets...");
  const ticketData = [
    { userId: deepakSapra?.id!, unitId: unitC0301?.id, category: "CIVIL" as TicketCategory, priority: "HIGH" as TicketPriority, subject: "Crack in balcony wall — C-0301", description: "Noticed a horizontal crack about 2 feet long on the outer balcony wall. It appeared after the recent rains. Concerned about structural integrity.", status: "IN_PROGRESS" as TicketStatus, assignedToUserId: vipul?.id! },
    { userId: priya?.id!, unitId: unitA0101?.id, category: "PLUMBING" as TicketCategory, priority: "HIGH" as TicketPriority, subject: "Leaky kitchen faucet — water dripping continuously", description: "The kitchen mixer tap has been dripping for the past 3 days. Water wastage is significant. Tried tightening but doesn't help.", status: "OPEN" as TicketStatus },
    { userId: amit?.id!, unitId: unitB1201?.id, category: "ELECTRICAL" as TicketCategory, priority: "URGENT" as TicketPriority, subject: "Power outage in B-1201 — MCB keeps tripping", description: "The main MCB trips every time we turn on the AC and geyser together. This started after last week's voltage fluctuation. Need electrician urgently.", status: "IN_PROGRESS" as TicketStatus, assignedToUserId: deepakSapra?.id! },
    { userId: neha?.id!, unitId: unitB1201?.id, category: "HOUSEKEEPING" as TicketCategory, priority: "MEDIUM" as TicketPriority, subject: "Corridor carpet staining on 17th floor", description: "The corridor carpet near flat B-1702 has a large coffee stain that hasn't been cleaned in over a week. It's becoming a hygiene concern.", status: "OPEN" as TicketStatus },
    { userId: vikram?.id!, unitId: unitC0301?.id, category: "SECURITY" as TicketCategory, priority: "HIGH" as TicketPriority, subject: "Unknown person found in Tower A lobby at 2 AM", description: "Security camera footage shows an unidentified person lingering in the Tower A lobby at 2:15 AM on 3rd July. Please investigate and tighten access.", status: "RESOLVED" as TicketStatus, resolvedAt: daysAgo(2), satisfactionRating: 4, satisfactionComment: "Quick response from security team. Thanks!" },
    { userId: anita?.id!, unitId: unitA0101?.id, category: "PLUMBING" as TicketCategory, priority: "LOW" as TicketPriority, subject: "Low water pressure in master bathroom", description: "Water pressure in the master bathroom has been noticeably low for the past week. Other bathrooms are fine. Probably a local blockage.", status: "CLOSED" as TicketStatus, resolvedAt: daysAgo(5), satisfactionRating: 5, satisfactionComment: "Fixed promptly. Very satisfied." },
    { userId: ravi?.id!, unitId: unitB1201?.id, category: "OTHER" as TicketCategory, priority: "LOW" as TicketPriority, subject: "Noise complaint — renovation in B-2002", description: "The flat above (B-2002) has been doing renovation work from 7 AM to 9 PM including weekends. The noise is disruptive. Please enforce renovation timings.", status: "OPEN" as TicketStatus },
    { userId: karan?.id!, unitId: unitB1201?.id, category: "ELECTRICAL" as TicketCategory, priority: "MEDIUM" as TicketPriority, subject: "Common area lights flickering in Tower C", description: "The LED lights in the Tower C ground floor corridor have been flickering for the past 2 days. Could be a wiring issue.", status: "IN_PROGRESS" as TicketStatus, assignedToUserId: deepakSapra?.id! },
    { userId: rajesh?.id!, unitId: unitA0101?.id, category: "HOUSEKEEPING" as TicketCategory, priority: "MEDIUM" as TicketPriority, subject: "Elevator buttons sticky and dirty", description: "The lift buttons on floors 4-6 in Tower A feel sticky and haven't been cleaned in a while. Please schedule a deep cleaning.", status: "RESOLVED" as TicketStatus, resolvedAt: daysAgo(1), satisfactionRating: 4, satisfactionComment: "Cleaned next day. Good." },
  ].filter(t => t.userId);

  const createdTickets = [];
  for (const t of ticketData) {
    const existing = await prisma.helpTicket.findFirst({ where: { userId: t.userId, subject: t.subject } });
    if (!existing) {
      const ticket = await prisma.helpTicket.create({ data: t });
      createdTickets.push(ticket);
    }
  }
  console.log(`   ✅ ${ticketData.length} tickets created`);

  // ─── TICKET COMMENTS ───────────────────────────────────────────
  console.log("\n💬 Creating ticket comments...");
  const ticketsForComments = await prisma.helpTicket.findMany({
    where: { subject: { in: [
      "Crack in balcony wall — C-0301",
      "Power outage in B-1201 — MCB keeps tripping",
      "Unknown person found in Tower A lobby at 2 AM",
      "Common area lights flickering in Tower C",
    ]}},
  });
  const ticketMap = Object.fromEntries(ticketsForComments.map(t => [t.subject, t]));

  if (ticketMap["Crack in balcony wall — C-0301"] && ticketMap["Power outage in B-1201 — MCB keeps tripping"]) {
    const ticketComments = [
      { ticketId: ticketMap["Crack in balcony wall — C-0301"].id, authorId: vipul?.id!, body: "I've informed Deepak Sapra from Infrastructure team. He'll inspect the crack this weekend. In the meantime, please avoid putting heavy items near the balcony wall." },
      { ticketId: ticketMap["Crack in balcony wall — C-0301"].id, authorId: deepakSapra?.id!, body: "I'll visit C-0301 on Saturday morning. This could be a waterproofing issue rather than structural. Will assess on-site." },
      { ticketId: ticketMap["Crack in balcony wall — C-0301"].id, authorId: deepakSapra?.id!, body: "Visited and inspected. It's a surface-level crack from thermal expansion. Will get it patched this week. No structural concern." },
      { ticketId: ticketMap["Power outage in B-1201 — MCB keeps tripping"].id, authorId: deepakSapra?.id!, body: "Electrician Raju has been assigned. He will visit this evening after 5 PM. Please ensure someone is home." },
      { ticketId: ticketMap["Power outage in B-1201 — MCB keeps tripping"].id, authorId: amit?.id!, body: "I'll be home after 5:30 PM. Please ask him to check the voltage stabilizer too — it might be the root cause." },
    ].filter(c => c.authorId);

    if (ticketMap["Unknown person found in Tower A lobby at 2 AM"]) {
      ticketComments.push(
        { ticketId: ticketMap["Unknown person found in Tower A lobby at 2 AM"].id, authorId: vipul?.id!, body: "Security team has been alerted. We've reviewed the footage and identified the person — it was a guest of a Tower B resident who got lost. Gates have been re-secured." },
      );
    }
    if (ticketMap["Common area lights flickering in Tower C"]) {
      ticketComments.push(
        { ticketId: ticketMap["Common area lights flickering in Tower C"].id, authorId: deepakSapra?.id!, body: "Maintenance team is checking the wiring in the Tower C corridor. Will update by tomorrow." },
        { ticketId: ticketMap["Common area lights flickering in Tower C"].id, authorId: deepakSapra?.id!, body: "Found the issue — a loose connection in the junction box on the ground floor. Electrician is fixing it now." },
      );
    }

    for (const c of ticketComments) {
      const existing = await prisma.ticketComment.findFirst({ where: { ticketId: c.ticketId, authorId: c.authorId, body: c.body } });
      if (!existing) {
        await prisma.ticketComment.create({ data: c });
      }
    }
    console.log(`   ✅ ${ticketComments.length} ticket comments created`);
  }

  // ─── FACILITY BOOKINGS ────────────────────────────────────────
  console.log("\n🏊 Creating facility bookings...");
  const facilityPool = await prisma.facility.findUnique({ where: { name: "Swimming Pool & Sun Deck" } });
  const facilityTheatre = await prisma.facility.findUnique({ where: { name: "Mini Theatre" } });
  const facilityRooftop = await prisma.facility.findUnique({ where: { name: "Rooftop Recreation & Sky Deck" } });

  if (facilityPool && facilityTheatre && facilityRooftop) {
    const now = new Date();
    const tomorrowAM = new Date(now); tomorrowAM.setDate(now.getDate() + 1); tomorrowAM.setHours(7, 0, 0, 0);
    const tomorrowPM = new Date(now); tomorrowPM.setDate(now.getDate() + 1); tomorrowPM.setHours(8, 0, 0, 0);
    const dayAfterAM = new Date(now); dayAfterAM.setDate(now.getDate() + 2); dayAfterAM.setHours(7, 0, 0, 0);
    const dayAfterPM = new Date(now); dayAfterPM.setDate(now.getDate() + 2); dayAfterPM.setHours(8, 0, 0, 0);
    const weekendEve = new Date(now); weekendEve.setDate(now.getDate() + (6 - now.getDay() + 7) % 7 || 7); weekendEve.setHours(18, 0, 0, 0);
    const weekendEveEnd = new Date(weekendEve.getTime() + 2 * 60 * 60 * 1000);

    const bookings = [
      { facilityId: facilityPool.id, userId: vipul?.id!, startsAt: tomorrowAM, endsAt: tomorrowPM, status: "CONFIRMED" as BookingStatus },
      { facilityId: facilityPool.id, userId: sumitTayal?.id!, startsAt: dayAfterAM, endsAt: dayAfterPM, status: "CONFIRMED" as BookingStatus },
      { facilityId: facilityTheatre.id, userId: meenalKumar?.id!, startsAt: weekendEve, endsAt: weekendEveEnd, status: "CONFIRMED" as BookingStatus },
      { facilityId: facilityRooftop.id, userId: karan?.id!, startsAt: weekendEve, endsAt: weekendEveEnd, status: "PENDING_APPROVAL" as BookingStatus },
    ].filter(b => b.userId);

    for (const b of bookings) {
      const existing = await prisma.facilityBooking.findFirst({ where: { facilityId: b.facilityId, startsAt: b.startsAt } });
      if (!existing) {
        await prisma.facilityBooking.create({ data: b });
      }
    }
    console.log(`   ✅ ${bookings.length} facility bookings created`);

    // Facility blackouts
    const blackoutStart = new Date(now); blackoutStart.setDate(now.getDate() + 14); blackoutStart.setHours(6, 0, 0, 0);
    const blackoutEnd = new Date(now); blackoutEnd.setDate(now.getDate() + 14); blackoutEnd.setHours(18, 0, 0, 0);
    const existingBlackout = await prisma.facilityBlackout.findFirst({ where: { facilityId: facilityPool.id, reason: "Annual pool maintenance and water treatment" } });
    if (!existingBlackout) {
      await prisma.facilityBlackout.create({ data: { facilityId: facilityPool.id, reason: "Annual pool maintenance and water treatment", startsAt: blackoutStart, endsAt: blackoutEnd } });
    }
    console.log("   ✅ 1 facility blackout created");

    // Facility waitlist
    const existingWaitlist = await prisma.facilityWaitlist.findFirst({ where: { facilityId: facilityTheatre.id, userId: ravi?.id! } });
    if (!existingWaitlist && ravi) {
      await prisma.facilityWaitlist.create({ data: { facilityId: facilityTheatre.id, userId: ravi.id, preferredDate: daysFromNow(7), status: "WAITING" } });
    }
    console.log("   ✅ 1 facility waitlist entry created");
  }

  // ─── DOMESTIC HELP ─────────────────────────────────────────────
  console.log("\n👩‍🍳 Creating domestic help registry...");
  const domesticHelps = [
    { userId: vipul?.id!, unitId: unitC1702?.id!, name: "Kamla Devi", phone: "+91-9111122222", helpType: "HOUSEKEEPING", recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"], status: "ACTIVE" as DomesticHelpStatus, validFrom: daysAgo(120), createdById: vipul?.id! },
    { userId: vipul?.id!, unitId: unitC1702?.id!, name: "Rakesh Yadav", phone: "+91-9111133333", helpType: "DRIVER", recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"], status: "ACTIVE" as DomesticHelpStatus, validFrom: daysAgo(90), createdById: vipul?.id! },
    { userId: priya?.id!, unitId: unitA0101?.id!, name: "Sunita Bai", phone: "+91-9111144444", helpType: "COOK", recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"], status: "ACTIVE" as DomesticHelpStatus, validFrom: daysAgo(60), createdById: priya?.id! },
    { userId: amit?.id!, unitId: unitB1201?.id!, name: "Gopal Krishna", phone: "+91-9111155555", helpType: "HOUSEKEEPING", recurrenceDays: ["MON", "WED", "FRI"], status: "ACTIVE" as DomesticHelpStatus, validFrom: daysAgo(45), createdById: amit?.id! },
    { userId: deepakSapra?.id!, unitId: unitC0301?.id!, name: "Parvati Sharma", phone: "+91-9111166666", helpType: "HOUSEKEEPING", recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"], status: "ACTIVE" as DomesticHelpStatus, validFrom: daysAgo(200), createdById: deepakSapra?.id! },
    { userId: meenalKumar?.id!, unitId: unitA2502?.id!, name: "Bharat Singh", phone: "+91-9111177777", helpType: "GARDENER", recurrenceDays: ["TUE", "SAT"], status: "REVOKED" as DomesticHelpStatus, validFrom: daysAgo(150), validUntil: daysAgo(10), createdById: meenalKumar?.id! },
  ].filter(dh => dh.userId && dh.unitId && dh.createdById);

  for (const dh of domesticHelps) {
    const existing = await prisma.domesticHelp.findFirst({ where: { userId: dh.userId, name: dh.name } });
    if (!existing) {
      await prisma.domesticHelp.create({ data: dh });
    }
  }
  console.log(`   ✅ ${domesticHelps.length} domestic help entries created`);

  // ─── DUES ──────────────────────────────────────────────────────
  console.log("\n💰 Creating dues...");
  const dueUnits = [
    { unitId: unitC1702?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitC1702?.id, label: "Maintenance — June 2026", amount: 8500, dueDate: daysAgo(20), status: "PAID" as DueStatus, paidAt: daysAgo(15) },
    { unitId: unitC0301?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitC0301?.id, label: "Maintenance — June 2026", amount: 8500, dueDate: daysAgo(20), status: "PAID" as DueStatus, paidAt: daysAgo(10) },
    { unitId: unitC0201?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitC0201?.id, label: "Maintenance — May 2026", amount: 8500, dueDate: daysAgo(50), status: "OVERDUE" as DueStatus },
    { unitId: unitA2502?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitA2502?.id, label: "Special Assessment — Lift Upgrade Fund", amount: 15000, dueDate: daysFromNow(30), status: "PENDING" as DueStatus },
    { unitId: unitA0101?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitA0101?.id, label: "Maintenance — June 2026", amount: 8500, dueDate: daysAgo(20), status: "PAID" as DueStatus, paidAt: daysAgo(18) },
    { unitId: unitB1201?.id, label: "Maintenance — July 2026", amount: 8500, dueDate: daysFromNow(10), status: "PENDING" as DueStatus },
    { unitId: unitB1201?.id, label: "Maintenance — June 2026", amount: 8500, dueDate: daysAgo(20), status: "PAID" as DueStatus, paidAt: daysAgo(5) },
    { unitId: unitB1201?.id, label: "Maintenance — May 2026", amount: 8500, dueDate: daysAgo(50), status: "OVERDUE" as DueStatus },
  ].filter(d => d.unitId);

  for (const d of dueUnits) {
    const existing = await prisma.due.findFirst({ where: { unitId: d.unitId!, label: d.label } });
    if (!existing) {
      const due = await prisma.due.create({ data: d as any });
      if (d.label.includes("Maintenance")) {
        const baseAmount = d.amount as number;
        await prisma.dueLineItem.createMany({
          data: [
            { dueId: due.id, label: "Sinking Fund", amount: baseAmount * 0.15 },
            { dueId: due.id, label: "Electricity (Common Areas)", amount: baseAmount * 0.25 },
            { dueId: due.id, label: "Security & Housekeeping", amount: baseAmount * 0.35 },
            { dueId: due.id, label: "Water & STP Charges", amount: baseAmount * 0.15 },
            { dueId: due.id, label: "Miscellaneous", amount: baseAmount * 0.10 },
          ],
        });
      }
    }
  }
  console.log(`   ✅ ${dueUnits.length} dues created with line items`);

  // ─── PETS ──────────────────────────────────────────────────────
  console.log("\n🐾 Creating pet registrations...");
  const pets = [
    { userId: vipul?.id!, unitId: unitC1702?.id!, name: "Bruno", breed: "German Shepherd", vaccinationExpiry: daysFromNow(180) },
    { userId: priya?.id!, unitId: unitA0101?.id!, name: "Milo", breed: "Labrador Retriever", vaccinationExpiry: daysFromNow(90) },
    { userId: deepakSapra?.id!, unitId: unitC0301?.id!, name: "Whiskers", breed: "Persian Cat", vaccinationExpiry: daysFromNow(120) },
    { userId: vikram?.id!, unitId: unitC0301?.id!, name: "Chintu", breed: "Indie Pariah Dog", vaccinationExpiry: daysAgo(15) },
    { userId: deepa?.id!, unitId: unitA0101?.id!, name: "Nemo", breed: "Golden Retriever", vaccinationExpiry: daysFromNow(200) },
  ].filter(p => p.userId && p.unitId);

  for (const p of pets) {
    const existing = await prisma.pet.findFirst({ where: { userId: p.userId, name: p.name } });
    if (!existing) {
      await prisma.pet.create({ data: p });
    }
  }
  console.log(`   ✅ ${pets.length} pets registered`);

  // ─── LOST & FOUND ──────────────────────────────────────────────
  console.log("\n🔍 Creating lost & found items...");
  const lostFoundItems = [
    { userId: priya?.id!, title: "Car keys — Honda City keychain", description: "Lost my car keys somewhere between Tower A lobby and parking basement. Black Honda keychain with a small Ganesha charm. Please contact Priya if found.", type: "LOST" as LostFoundType, location: "Tower A Lobby / Parking", status: "ACTIVE" as LostFoundStatus, expiresAt: daysFromNow(14) },
    { userId: amit?.id!, title: "Umbrella — Blue compact umbrella", description: "Found a blue compact umbrella near the swimming pool entrance. If it's yours, please claim it from security with a description.", type: "FOUND" as LostFoundType, location: "Swimming Pool Entrance", status: "ACTIVE" as LostFoundStatus, expiresAt: daysFromNow(14) },
    { userId: vikram?.id!, title: "Wallet — Brown leather wallet", description: "Lost a brown leather wallet near the amphitheater during last weekend's event. Contains ID cards and some cash. Very important — please return.", type: "LOST" as LostFoundType, location: "Amphitheater Area", status: "CLAIMED" as LostFoundStatus, expiresAt: daysFromNow(7) },
    { userId: ravi?.id!, title: "Children's lunchbox — Spiderman design", description: "Found a Spiderman-themed children's lunchbox on the 8th floor corridor of Tower B. Looks like it was left after school.", type: "FOUND" as LostFoundType, location: "Tower B, 8th Floor Corridor", status: "ACTIVE" as LostFoundStatus, expiresAt: daysFromNow(10) },
    { userId: anita?.id!, title: "Reading glasses — Silver frame", description: "Lost my reading glasses somewhere in the garden area. Silver half-frame, prescription lenses. Quite expensive — please help!", type: "LOST" as LostFoundType, location: "Central Garden", status: "ACTIVE" as LostFoundStatus, expiresAt: daysFromNow(7) },
  ].filter(item => item.userId);

  for (const item of lostFoundItems) {
    const existing = await prisma.lostFoundItem.findFirst({ where: { userId: item.userId, title: item.title } });
    if (!existing) {
      await prisma.lostFoundItem.create({ data: item });
    }
  }
  console.log(`   ✅ ${lostFoundItems.length} lost & found items created`);

  // ─── MOVE REQUESTS ─────────────────────────────────────────────
  console.log("\n🚚 Creating move requests...");
  const moveData = [
    { type: "MOVE_IN" as MoveType, unitId: unitC0201?.id!, requestedBy: sumitTayal?.id!, scheduledAt: daysFromNow(10), status: "APPROVED" as MoveStatus, notes: "Moving in new furniture — 2BHK setup. Will use service elevator." },
  ].filter(m => m.unitId && m.requestedBy);

  for (const m of moveData) {
    const existing = await prisma.moveRequest.findFirst({ where: { unitId: m.unitId, requestedBy: m.requestedBy, type: m.type } });
    if (!existing) {
      await prisma.moveRequest.create({ data: m });
    }
  }
  console.log(`   ✅ ${moveData.length} move requests created`);

  // ─── NOTIFICATIONS ─────────────────────────────────────────────
  console.log("\n🔔 Creating notifications...");
  const notificationData = [
    { userId: priya?.id!, type: "NEW_POLL" as NotificationType, title: "New poll: Best time for gardening workshops?", body: "A new poll has been created by Rajesh Kumar. Cast your vote before it closes!", link: "/polls" },
    { userId: amit?.id!, type: "TICKET_UPDATE" as NotificationType, title: "Your ticket has been assigned", body: "Your ticket 'Power outage in B-1201' has been assigned to Deepak Sapra for follow-up.", link: "/help" },
    { userId: deepakSapra?.id!, type: "TICKET_UPDATE" as NotificationType, title: "New ticket assigned to you", body: "Amit Patel's electrical issue ticket has been assigned to you for follow-up.", link: "/help" },
    { userId: neha?.id!, type: "NEW_EVENT" as NotificationType, title: "New event: Kids Cricket Tournament", body: "Sumit Tayal has organized a cricket tournament for kids. RSVP now!", link: "/events" },
    { userId: sumitTayal?.id!, type: "DUE_REMINDER" as NotificationType, title: "Maintenance due reminder", body: "Your maintenance bill for July 2026 (₹8,500) is due in 10 days.", link: "/dues" },
    { userId: deepakSapra?.id!, type: "VISITOR_ARRIVED" as NotificationType, title: "Visitor at the gate", body: "Flipkart Delivery has arrived at the main gate. OTP: 7392", link: "/visitors" },
    { userId: vipul?.id!, type: "COMMUNITY_JOIN_APPROVED" as NotificationType, title: "New community request", body: "Deepak Sapra has been appointed as Infrastructure & Fire Safety head.", link: "/communities" },
    { userId: rajesh?.id!, type: "NOTICE_PUBLISHED" as NotificationType, title: "New notice: Monthly Maintenance Bill", body: "July 2026 maintenance bills have been generated. Check your dues.", link: "/notices" },
    { userId: anita?.id!, type: "POLL_CLOSED" as NotificationType, title: "Poll results: Gym equipment upgrade", body: "The gym equipment upgrade poll has closed. Results are now visible.", link: "/polls" },
    { userId: karan?.id!, type: "APPROVAL_GRANTED" as NotificationType, title: "Booking confirmed", body: "Your rooftop recreation booking for this Saturday evening has been approved.", link: "/facilities" },
  ].filter(n => n.userId);

  for (const n of notificationData) {
    const existing = await prisma.notification.findFirst({ where: { userId: n.userId, title: n.title } });
    if (!existing) {
      await prisma.notification.create({ data: n });
    }
  }
  console.log(`   ✅ ${notificationData.length} notifications created`);

  console.log("\n🎉 DEV seed complete!");
  console.log("   ────────────────────────────────────");
  console.log("   Super Admin: Vipul Taneja (C-1702)");
  console.log("   Infrastructure & Fire Safety Head: Deepak Sapra (C-0301)");
  console.log("   Sports & Recreation Head: Sumit Tayal (C-0201)");
  console.log("   Cultural Activities Head: Meenal Kumar (A-2502)");
}

async function main() {
  const args = process.argv.slice(2);
  const isProd = args.includes("--prod");
  const isDev = args.includes("--dev");

  if (isProd || (!isDev && !isProd)) {
    await seedProd();
  }

  if (isDev) {
    await seedDev();
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
