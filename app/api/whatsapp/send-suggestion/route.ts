import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone_number, message } = await req.json();
  if (!phone_number || !message) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const evolutionUrl = process.env.EVOLUTION_API_URL || "https://evolution-api-production-fbfd.up.railway.app";
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Evolution API not configured" }, { status: 500 });

  const res = await fetch(`${evolutionUrl}/message/sendText/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({
      number: phone_number,
      options: { delay: 1500, presence: "composing" },
      textMessage: { text: message },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  // Replace pending copilot suggestion with sent assistant message
  await supabase
    .from("chat_history")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("phone_number", phone_number)
    .eq("role", "copilot");

  await supabase.from("chat_history").insert({
    clerk_user_id: userId,
    phone_number,
    role: "assistant",
    content: message,
  });

  return NextResponse.json({ ok: true });
}
