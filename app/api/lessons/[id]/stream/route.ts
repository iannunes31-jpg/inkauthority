import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canTakeExam } from "@/lib/exams";
import { isVideoId, signedToken } from "@/lib/stream";

type Params = { params: Promise<{ id: string }> };

// Playback token for a lesson video, only for students with access to its course (or admins).
export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: lesson } = await supabaseAdmin
    .from("lessons")
    .select("video_url, modules(course_id)")
    .eq("id", id)
    .maybeSingle();
  const courseId = (lesson?.modules as any)?.course_id;
  if (!lesson || !courseId) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });

  // Same rule as the final exam: bought this course, "all", or the Stream Class.
  if (!(await canTakeExam(userId, courseId))) {
    return NextResponse.json({ error: "Você ainda não tem acesso a esta Stream Class." }, { status: 403 });
  }
  if (!isVideoId(lesson.video_url)) return NextResponse.json({ token: null });

  try {
    const token = await signedToken(lesson.video_url);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err: any) {
    console.error("[lesson stream] token failed:", err.message);
    return NextResponse.json({ error: "Não foi possível carregar a aula. Tente de novo." }, { status: 502 });
  }
}
