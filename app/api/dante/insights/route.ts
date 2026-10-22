import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userHasAccess, planRequired } from "@/lib/access-server";
import { getInsights } from "@/lib/dante-insights";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await userHasAccess(userId, "dante"))) return planRequired();

  const { histories: _h, ...data } = await getInsights(userId);
  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
