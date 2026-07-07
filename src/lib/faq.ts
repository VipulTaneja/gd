import { db } from "@/lib/db";
import { validateRichTextBody } from "@/lib/rich-text";
import { uniqueItemSlug, uniqueSectionSlug } from "@/lib/faq-slugs";

export type FaqItemDto = {
  id: string;
  question: string;
  slug: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
};

export type FaqSectionDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  items: FaqItemDto[];
};

const sectionInclude = {
  items: { orderBy: { sortOrder: "asc" as const } },
} as const;

export async function countPublishedFaqItems(): Promise<number> {
  return db.faqItem.count({
    where: {
      isPublished: true,
      section: { isPublished: true },
    },
  });
}

export async function listPublicFaq(): Promise<FaqSectionDto[]> {
  const sections = await db.faqSection.findMany({
    where: {
      isPublished: true,
      items: { some: { isPublished: true } },
    },
    include: {
      items: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  return sections.map(mapSection);
}

export async function listManageFaq(): Promise<FaqSectionDto[]> {
  const sections = await db.faqSection.findMany({
    include: sectionInclude,
    orderBy: { sortOrder: "asc" },
  });
  return sections.map(mapSection);
}

function mapSection(s: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  items: {
    id: string;
    question: string;
    slug: string;
    answer: string;
    sortOrder: number;
    isPublished: boolean;
  }[];
}): FaqSectionDto {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description,
    sortOrder: s.sortOrder,
    isPublished: s.isPublished,
    items: s.items.map((i) => ({
      id: i.id,
      question: i.question,
      slug: i.slug,
      answer: i.answer,
      sortOrder: i.sortOrder,
      isPublished: i.isPublished,
    })),
  };
}

export async function createFaqSection(
  userId: string,
  data: { title: string; description?: string | null; isPublished?: boolean },
) {
  const title = data.title.trim();
  if (!title) throw new Error("Title is required");

  const maxOrder = await db.faqSection.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 10;

  const slug = await uniqueSectionSlug(title, undefined, async (s) => {
    const existing = await db.faqSection.findUnique({ where: { slug: s } });
    return !!existing;
  });

  return db.faqSection.create({
    data: {
      title,
      slug,
      description: data.description?.trim() || null,
      isPublished: data.isPublished ?? false,
      sortOrder,
      createdById: userId,
      lastEditedById: userId,
    },
    include: sectionInclude,
  });
}

export async function updateFaqSection(
  userId: string,
  id: string,
  data: { title?: string; description?: string | null; isPublished?: boolean },
) {
  const existing = await db.faqSection.findUnique({ where: { id } });
  if (!existing) throw new Error("Section not found");

  const title = data.title?.trim() ?? existing.title;
  if (!title) throw new Error("Title is required");

  return db.faqSection.update({
    where: { id },
    data: {
      title,
      description:
        data.description !== undefined ? data.description?.trim() || null : undefined,
      isPublished: data.isPublished,
      lastEditedById: userId,
    },
    include: sectionInclude,
  });
}

export async function deleteFaqSection(id: string) {
  return db.faqSection.delete({ where: { id } });
}

export async function createFaqItem(
  userId: string,
  data: { sectionId: string; question: string; answer: string; isPublished?: boolean },
) {
  const question = data.question.trim();
  if (!question) throw new Error("Question is required");
  if (question.length > 500) throw new Error("Question must be 500 characters or less");

  const parsed = validateRichTextBody(data.answer);
  if (!parsed.ok) throw new Error(parsed.error);

  const section = await db.faqSection.findUnique({ where: { id: data.sectionId } });
  if (!section) throw new Error("Section not found");

  const maxOrder = await db.faqItem.aggregate({
    where: { sectionId: data.sectionId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 10;

  const slug = await uniqueItemSlug(
    question,
    data.sectionId,
    undefined,
    async (sectionId, s) => {
      const existing = await db.faqItem.findUnique({
        where: { sectionId_slug: { sectionId, slug: s } },
      });
      return !!existing;
    },
  );

  return db.faqItem.create({
    data: {
      sectionId: data.sectionId,
      question,
      slug,
      answer: parsed.html,
      sortOrder,
      isPublished: data.isPublished ?? false,
      createdById: userId,
      lastEditedById: userId,
    },
  });
}

export async function updateFaqItem(
  userId: string,
  id: string,
  data: { question?: string; answer?: string; isPublished?: boolean },
) {
  const existing = await db.faqItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");

  let answer = existing.answer;
  if (data.answer !== undefined) {
    const parsed = validateRichTextBody(data.answer);
    if (!parsed.ok) throw new Error(parsed.error);
    answer = parsed.html;
  }

  const question = data.question?.trim() ?? existing.question;
  if (!question) throw new Error("Question is required");
  if (question.length > 500) throw new Error("Question must be 500 characters or less");

  return db.faqItem.update({
    where: { id },
    data: {
      question,
      answer,
      isPublished: data.isPublished,
      lastEditedById: userId,
    },
  });
}

export async function deleteFaqItem(id: string) {
  return db.faqItem.delete({ where: { id } });
}

export async function reorderFaqSections(ids: string[]) {
  await db.$transaction(
    ids.map((id, index) =>
      db.faqSection.update({
        where: { id },
        data: { sortOrder: (index + 1) * 10 },
      }),
    ),
  );
}

export async function reorderFaqItems(sectionId: string, ids: string[]) {
  await db.$transaction(
    ids.map((id, index) =>
      db.faqItem.update({
        where: { id, sectionId },
        data: { sortOrder: (index + 1) * 10 },
      }),
    ),
  );
}
