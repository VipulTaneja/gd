import { headers } from "next/headers";

export async function authorizeCronRequest(): Promise<boolean> {
  const authHeader = (await headers()).get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}
