import { randomInt } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getExam } from "@/lib/exams";

export type Certificate = {
  code: string;
  student_name: string;
  course_title: string;
  hours: number;
  score: number | null;
  issued_at: string;
};

// Workload printed on the certificate, per course id; anything else uses the default.
const COURSE_HOURS: Record<string, number> = {};
const DEFAULT_HOURS = 10;
export const hoursFor = (courseId: string) => COURSE_HOURS[courseId] ?? DEFAULT_HOURS;

// No 0/O/1/I so the code is easy to read back and type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newCode = () => "IA-" + Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export const CERT_FIELDS = "code, student_name, course_title, hours, score, issued_at";

/** Best passing score of this student in the course's final exam, or null if not approved. */
export async function passedScore(userId: string, courseId: string) {
  const data = await getExam(courseId);
  if (!data) return null;
  const { data: attempts } = await supabaseAdmin
    .from("exam_attempts")
    .select("score")
    .eq("exam_id", data.exam.id)
    .eq("user_id", userId)
    .eq("passed", true)
    .order("score", { ascending: false })
    .limit(1);
  return attempts?.[0]?.score ?? null;
}

export function cleanName(raw: unknown) {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}
