import { NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { generateStaffPasses } from "@/lib/staff-passes";

async function run() {
  const created = await generateStaffPasses();
  return NextResponse.json({ success: true, created });
}

export async function GET() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await run();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await run();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
