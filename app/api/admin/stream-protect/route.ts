import { NextResponse } from "next/server";
import { checkIsFullAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isVideoId, requireSigned } from "@/lib/stream";

export const maxDuration = 120;

// Turns signed-only playback on for every lesson video, so lessons only play through
// /api/lessons/[id]/stream (which checks the purchase). Body: { on?: boolean } (default true).
export async function POST(req: Request) {
  if (!(await checkIsFullAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { on = true } = await req.json().catch(() => ({}));

  const { data: lessons, error } = await supabaseAdmin.from("lessons").select("id, video_url");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Record<string, string> = {};
  for (const l of lessons ?? []) {
    if (!isVideoId(l.video_url)) continue;
    try {
      results[l.video_url] = (await requireSigned(l.video_url, !!on)) ? "protegido" : "aberto";
    } catch (err: any) {
      results[l.video_url] = "erro: " + err.message;
    }
  }
  return NextResponse.json({ count: Object.keys(results).length, results });
}
