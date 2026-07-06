/** Normalize a phone string for wa.me links (digits only, default +91 for 10-digit India numbers). */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11) return digits;
  return null;
}

export function whatsAppHref(phone: string, text?: string): string | null {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  const base = `https://wa.me/${normalized}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
