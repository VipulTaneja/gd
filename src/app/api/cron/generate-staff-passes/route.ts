import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";
import { generateStaffPasses } from "@/lib/staff-passes";

async function run() {
  const created = await generateStaffPasses();
  return NextResponse.json({ success: true, created });
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
