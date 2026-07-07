import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const FAQ_WRITE_LIMIT = 30;
const FAQ_WRITE_WINDOW_MS = 60_000;

export function checkFaqWriteRateLimit(userId: string) {
  return checkRateLimit(`faq-write:${userId}`, FAQ_WRITE_LIMIT, FAQ_WRITE_WINDOW_MS);
}

export { rateLimitResponse };
