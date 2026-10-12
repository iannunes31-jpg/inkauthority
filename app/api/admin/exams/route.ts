import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getExam } from "@/lib/exams";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Without ?courseId: courses to pick from + which already have an exam. With it: the full exam.
export async function GET(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const courseId = new URL(req.url).searchParams.get("courseId");

  if (courseId) {
    const data = await getExam(courseId);
    return NextResponse.json(data ?? { exam: null, questions: [] });
  }

  const [{ data: courses, error }, { data: exams }] = await Promise.all([
    supabaseAdmin.from("courses").select("id, title").order("created_at", { ascending: false }),
    supabaseAdmin.from("course_exams").select("id, course_id, active"),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<string, number> = {};
  if (exams?.length) {
    const { data: qs } = await supabaseAdmin.from("exam_questions").select("exam_id").in("exam_id", exams.map((e) => e.id));
    for (const q of qs ?? []) counts[q.exam_id] = (counts[q.exam_id] ?? 0) + 1;
  }

  return NextResponse.json(
    (courses ?? []).map((c) => {
      const exam = exams?.find((e) => e.course_id === c.id);
      return { id: c.id, title: c.title, hasExam: !!exam, active: !!exam?.active, questionCount: exam ? counts[exam.id] ?? 0 : 0 };
    })
  );
}

type QuestionInput = { question: string; options: string[]; correct_index: number; explanation?: string };

export async function PUT(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const b = await req.json();

  const courseId = String(b.courseId || "").trim();
  if (!courseId) return NextResponse.json({ error: "Escolha o curso." }, { status: 400 });

  const questions: QuestionInput[] = Array.isArray(b.questions) ? b.questions : [];
  for (const [i, q] of questions.entries()) {
    const opts = (q.options ?? []).map((o) => String(o).trim());
    if (!String(q.question ?? "").trim()) return NextResponse.json({ error: `Pergunta ${i + 1} está sem enunciado.` }, { status: 400 });
    if (opts.length < 2) return NextResponse.json({ error: `Pergunta ${i + 1} precisa de pelo menos 2 alternativas.` }, { status: 400 });
    if (opts.some((o) => !o)) return NextResponse.json({ error: `Pergunta ${i + 1} tem uma alternativa em branco.` }, { status: 400 });
    if (!(q.correct_index >= 0 && q.correct_index < opts.length)) {
      return NextResponse.json({ error: `Marque a alternativa correta da pergunta ${i + 1}.` }, { status: 400 });
    }
  }
  if (b.active && questions.length === 0) {
    return NextResponse.json({ error: "Adicione perguntas antes de liberar a prova." }, { status: 400 });
  }

  const passing = Math.min(100, Math.max(1, Math.round(Number(b.passing_score) || 70)));
  const maxAttempts = b.max_attempts === "" || b.max_attempts == null ? null : Math.max(1, Math.floor(Number(b.max_attempts)));

  const { data: exam, error } = await supabaseAdmin
    .from("course_exams")
    .upsert(
      {
        course_id: courseId,
        title: String(b.title || "Prova final").slice(0, 200),
        description: b.description ? String(b.description).slice(0, 2000) : null,
        passing_score: passing,
        max_attempts: maxAttempts,
        active: !!b.active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace the question set; past attempts keep their stored score.
  const { error: delError } = await supabaseAdmin.from("exam_questions").delete().eq("exam_id", exam.id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
  if (questions.length) {
    const rows = questions.map((q, i) => {
      const options = q.options.map((o) => String(o).trim());
      return {
        exam_id: exam.id,
        position: i,
        question: String(q.question).trim(),
        options,
        correct_index: q.correct_index,
        explanation: q.explanation ? String(q.explanation).trim() : null,
      };
    });
    const { error: insError } = await supabaseAdmin.from("exam_questions").insert(rows);
    if (insError) return NextResponse.json({ error: insError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
