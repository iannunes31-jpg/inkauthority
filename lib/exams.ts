import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkIsAdmin } from "@/lib/auth-server";

export const FLAGSHIP_PRODUCT_ID = "marketing_posicionamento";

export type Exam = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number | null;
  active: boolean;
};

export type ExamQuestion = {
  id: string;
  position: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
};

export async function getExam(courseId: string) {
  const { data: exam } = await supabaseAdmin.from("course_exams").select("*").eq("course_id", courseId).maybeSingle();
  if (!exam) return null;
  const { data: questions } = await supabaseAdmin
    .from("exam_questions")
    .select("*")
    .eq("exam_id", exam.id)
    .order("position", { ascending: true });
  return { exam: exam as Exam, questions: (questions ?? []) as ExamQuestion[] };
}

/** Admin, the course itself, an "all courses" purchase, or the flagship workshop. */
export async function canTakeExam(userId: string, courseId: string) {
  if (await checkIsAdmin()) return true;
  const { data } = await supabaseAdmin
    .from("user_purchases")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", [courseId, "all", FLAGSHIP_PRODUCT_ID])
    .limit(1);
  return !!data && data.length > 0;
}

export function grade(questions: ExamQuestion[], answers: Record<string, number>) {
  const results = questions.map((q) => ({
    questionId: q.id,
    selected: answers[q.id],
    correct: answers[q.id] === q.correct_index,
    correctIndex: q.correct_index,
    explanation: q.explanation,
  }));
  const correctCount = results.filter((r) => r.correct).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  return { results, correctCount, score };
}
