import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hubHero, hubGallery } from "../src/lib/hub-images";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const defaultSlides = [
  {
    imageUrl: hubHero.src,
    altText: hubHero.alt,
    linkUrl: "/notices",
  },
  {
    imageUrl: hubGallery[0].src,
    altText: hubGallery[0].alt,
    linkUrl: "/facilities",
  },
  {
    imageUrl: hubGallery[1].src,
    altText: hubGallery[1].alt,
    linkUrl: null,
  },
];

export async function seedHubHero() {
  const existing = await db.hubHeroSlide.count();
  if (existing > 0) {
    console.log("  Hub hero slides already seeded — skipping");
    return;
  }

  const admin = await db.user.findFirst({
    where: { globalRole: { in: ["SUPER_ADMIN", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!admin) {
    console.log("  No admin user — skipping hub hero seed");
    return;
  }

  for (let i = 0; i < defaultSlides.length; i++) {
    const slide = defaultSlides[i];
    await db.hubHeroSlide.create({
      data: {
        imageUrl: slide.imageUrl,
        altText: slide.altText,
        linkUrl: slide.linkUrl,
        sortOrder: i,
        createdById: admin.id,
      },
    });
  }

  console.log(`  Seeded ${defaultSlides.length} hub hero slides`);
}

if (require.main === module) {
  seedHubHero()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => db.$disconnect());
}
