import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function authorizeCronRequest(): Promise<boolean> {
  const authHeader = (await headers()).get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export function withCronAuth(handler: () => Promise<NextResponse>) {
  return async () => {
    if (!(await authorizeCronRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      return await handler();
    } catch {
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  };
}
