import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: messages } = await supabase
    .from("chat_history")
    .select("phone_number, role, content, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: true });

  if (!messages) return NextResponse.json([]);

  const grouped = new Map<string, any>();
  for (const msg of messages) {
    if (!grouped.has(msg.phone_number)) {
      grouped.set(msg.phone_number, {
        phone_number: msg.phone_number,
        last_message: "",
        last_time: "",
        has_pending: false,
        messages: [],
      });
    }
    const conv = grouped.get(msg.phone_number)!;
    conv.messages.push(msg);
    conv.last_message = msg.content;
    conv.last_time = msg.created_at;
    if (msg.role === "copilot") conv.has_pending = true;
  }

  const result = Array.from(grouped.values()).sort((a, b) => {
    if (a.has_pending && !b.has_pending) return -1;
    if (!a.has_pending && b.has_pending) return 1;
    return b.last_time.localeCompare(a.last_time);
  });

  return NextResponse.json(result);
}
