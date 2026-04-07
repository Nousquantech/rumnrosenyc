import { NextResponse } from "next/server";

import { getCategoryGroups } from "@/lib/data";

export async function GET() {
  const groups = await getCategoryGroups();
  return NextResponse.json({ groups });
}
