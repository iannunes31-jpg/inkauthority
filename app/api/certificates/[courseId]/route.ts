import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkIsAdmin } from "@/lib/auth-server";
import { CERT_FIELDS, cleanName, hoursFor, newCode, passedScore } from "@/lib/certificates";

type Params = { params: Promise<{ courseId: string }> };

async function courseTitle(courseId: string) {
  const { data } = await supabaseAdmin.from("courses").select("title").eq("id", courseId).maybeSingle();
  return data?.title ?? "Stream Class Ink Authority";
}

// The student's certificate for this course, or whether they can issue one.
export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const { data: certificate, error } = await supabaseAdmin
    .from("certificates")
    .select(CERT_FIELDS)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) {
    console.error("[certificates] read failed:", error.message);
    return NextResponse.json({ error: "Não foi possível carregar o certificado." }, { status: 500 });
  }
  if (certificate) return NextResponse.json({ certificate });

  const score = await passedScore(userId, courseId);
  const user = await currentUser();
  return NextResponse.json({
    certificate: null,
    eligible: score != null,
    isAdmin: await checkIsAdmin(),
    suggestedName: cleanName(user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ")),
    courseTitle: await courseTitle(courseId),
    hours: hoursFor(courseId),
  });
}

// Issues the certificate once, only after the final exam was passed. The name is locked after that.
export async function POST(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const score = await passedScore(userId, courseId);
  if (score == null) return NextResponse.json({ error: "O certificado é liberado depois da aprovação na prova final." }, { status: 403 });

  const { name } = await req.json().catch(() => ({}));
  const studentName = cleanName(name);
  if (studentName.split(" ").length < 2) {
    return NextResponse.json({ error: "Informe seu nome completo (nome e sobrenome)." }, { status: 400 });
  }

  const row = {
    user_id: userId,
    course_id: courseId,
    student_name: studentName,
    course_title: await courseTitle(courseId),
    hours: hoursFor(courseId),
    score,
  };
  // A code collision is practically impossible, but retry instead of failing.
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabaseAdmin.from("certificates").insert({ ...row, code: newCode() }).select(CERT_FIELDS).single();
    if (!error) return NextResponse.json({ certificate: data });
    if (error.code === "23505" && /user_id/.test(error.message + error.details)) {
      const { data: existing } = await supabaseAdmin.from("certificates").select(CERT_FIELDS).eq("user_id", userId).eq("course_id", courseId).single();
      return NextResponse.json({ certificate: existing });
    }
    if (error.code !== "23505") {
      console.error("[certificates] issue failed:", error.message);
      return NextResponse.json({ error: "Não foi possível emitir o certificado. Tente de novo." }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Não foi possível emitir o certificado. Tente de novo." }, { status: 500 });
}
