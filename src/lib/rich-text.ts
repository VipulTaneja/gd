import DOMPurify from "isomorphic-dompurify";

export const RICH_TEXT_HTML_MAX = 50_000;
export const RICH_TEXT_PLAIN_MAX = 10_000;

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "h2",
    "h3",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS).trim();
}

export function richTextToPlain(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/\u00a0/g, " ")
    .trim();
}

export function isLikelyHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

export function isRichTextEmpty(html: string): boolean {
  const plain = richTextToPlain(html);
  return !plain && !html.includes("<img");
}

export function plainTextToHtml(text: string): string {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  if (paragraphs.length === 0) return "";
  return paragraphs
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function prepareRichTextForDisplay(content: string): string {
  if (!content) return "";
  if (isLikelyHtml(content)) return sanitizeRichText(content);
  return sanitizeRichText(plainTextToHtml(content));
}

export type RichTextValidationResult =
  | { ok: true; html: string; plain: string }
  | { ok: false; error: string };

export function validateRichTextBody(
  body: unknown,
  maxPlainLength = RICH_TEXT_PLAIN_MAX,
): RichTextValidationResult {
  if (typeof body !== "string" || !body.trim()) {
    return { ok: false, error: "Body is required" };
  }

  const html = sanitizeRichText(body);
  if (html.length > RICH_TEXT_HTML_MAX) {
    return { ok: false, error: "Content is too long" };
  }

  const plain = richTextToPlain(html);
  if (isRichTextEmpty(html)) {
    return { ok: false, error: "Body is required" };
  }

  if (plain.length > maxPlainLength) {
    return {
      ok: false,
      error: `Body must be ${maxPlainLength.toLocaleString()} characters or less`,
    };
  }

  return { ok: true, html, plain };
}

export function mediaUrlFromKey(key: string): string {
  return `/api/media?key=${encodeURIComponent(key)}`;
}
