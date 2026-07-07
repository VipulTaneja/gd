export function slugify(text: string, maxLen = 80): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (base || "item").slice(0, maxLen);
}

export async function uniqueSectionSlug(
  title: string,
  existingSlug: string | undefined,
  checkTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (existingSlug) return existingSlug;
  const slug = slugify(title);
  let candidate = slug;
  let n = 2;
  while (await checkTaken(candidate)) {
    candidate = `${slug}-${n}`;
    n++;
  }
  return candidate;
}

export async function uniqueItemSlug(
  question: string,
  sectionId: string,
  existingSlug: string | undefined,
  checkTaken: (sectionId: string, slug: string) => Promise<boolean>,
): Promise<string> {
  if (existingSlug) return existingSlug;
  const slug = slugify(question);
  let candidate = slug;
  let n = 2;
  while (await checkTaken(sectionId, candidate)) {
    candidate = `${slug}-${n}`;
    n++;
  }
  return candidate;
}
