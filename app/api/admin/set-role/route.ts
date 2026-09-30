import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: role || null },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("set-role error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
