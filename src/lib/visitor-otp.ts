import crypto from "crypto";
import { Prisma } from "@/generated/prisma/client";

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

const OTP_UNIQUE_RETRY_LIMIT = 5;

/**
 * Runs `create` with a fresh OTP, retrying on a unique-constraint collision against
 * the partial unique index on (otp) WHERE status = 'ACTIVE' (see migration
 * 20260707223016_visitor_pass_otp_unique_active). Collisions should be exceedingly
 * rare (1-in-900,000 per active pass), so a handful of retries is more than enough.
 */
export async function createVisitorPassWithUniqueOtp<T>(
  create: (otp: string) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= OTP_UNIQUE_RETRY_LIMIT; attempt++) {
    try {
      return await create(generateOtp());
    } catch (err) {
      const isUniqueViolation =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isUniqueViolation || attempt === OTP_UNIQUE_RETRY_LIMIT) throw err;
    }
  }
  throw new Error("unreachable");
}
