import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkIsAdmin } from "@/lib/auth-server";
import { canTakeExam, getExam, grade } from "@/lib/exams";

type Params = { params: Promise<{ courseId: string }> };

async function attemptsOf(examId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("exam_attempts")
    .select("score, passed, created_at")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// Questions without the answer key, plus this student's previous attempts.
export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const data = await getExam(courseId);
  const isAdmin = await checkIsAdmin();
  if (!data || data.questions.length === 0 || (!data.exam.active && !isAdmin)) {
    return NextResponse.json({ available: false });
  }
  if (!(await canTakeExam(userId, courseId))) {
    return NextResponse.json({ available: false, error: "Você ainda não tem acesso a este curso." }, { status: 403 });
  }

  const attempts = await attemptsOf(data.exam.id, userId);
  const { exam } = data;
  const passed = attempts.some((a) => a.passed);
  const attemptsLeft = exam.max_attempts == null ? null : Math.max(0, exam.max_attempts - attempts.length);

  return NextResponse.json({
    available: true,
    preview: !exam.active,
    exam: {
      title: exam.title,
      description: exam.description,
      passing_score: exam.passing_score,
      max_attempts: exam.max_attempts,
      question_count: data.questions.length,
    },
    questions: data.questions.map((q) => ({ id: q.id, question: q.question, options: q.options })),
    attempts,
    passed,
    canAttempt: !passed && (attemptsLeft == null || attemptsLeft > 0),
    attemptsLeft,
  });
}

// Grades on the server and records the attempt.
export async function POST(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await params;

  const data = await getExam(courseId);
  const isAdmin = await checkIsAdmin();
  if (!data || data.questions.length === 0 || (!data.exam.active && !isAdmin)) {
    return NextResponse.json({ error: "Prova indisponível." }, { status: 404 });
  }
  if (!(await canTakeExam(userId, courseId))) {
    return NextResponse.json({ error: "Você ainda não tem acesso a este curso." }, { status: 403 });
  }

  const attempts = await attemptsOf(data.exam.id, userId);
  if (attempts.some((a) => a.passed)) return NextResponse.json({ error: "Você já foi aprovado nesta prova." }, { status: 400 });
  if (data.exam.max_attempts != null && attempts.length >= data.exam.max_attempts) {
    return NextResponse.json({ error: "Você já usou todas as tentativas." }, { status: 400 });
  }

  const { answers } = (await req.json()) as { answers?: Record<string, number> };
  const clean: Record<string, number> = {};
  for (const q of data.questions) {
    const v = Number(answers?.[q.id]);
    if (!Number.isInteger(v) || v < 0 || v >= q.options.length) {
      return NextResponse.json({ error: "Responda todas as perguntas antes de enviar." }, { status: 400 });
    }
    clean[q.id] = v;
  }

  const { results, correctCount, score } = grade(data.questions, clean);
  const passed = score >= data.exam.passing_score;

  // Admin previews of an inactive exam don't count as attempts.
  if (data.exam.active) {
    await supabaseAdmin.from("exam_attempts").insert({ exam_id: data.exam.id, user_id: userId, score, passed, answers: clean });
  }

  const attemptsLeft =
    data.exam.max_attempts == null ? null : Math.max(0, data.exam.max_attempts - attempts.length - (data.exam.active ? 1 : 0));
  // The answer key is only revealed once the student passed or has no attempts left.
  const reveal = passed || attemptsLeft === 0;

  return NextResponse.json({
    score,
    passed,
    correctCount,
    total: data.questions.length,
    passingScore: data.exam.passing_score,
    attemptsLeft,
    review: results.map((r) => ({
      questionId: r.questionId,
      correct: r.correct,
      ...(reveal ? { correctIndex: r.correctIndex, explanation: r.explanation } : {}),
    })),
  });
}
