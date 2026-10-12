"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Loader2, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExamData = {
  available: boolean;
  error?: string;
  preview?: boolean;
  exam?: { title: string; description: string | null; passing_score: number; max_attempts: number | null; question_count: number };
  questions?: { id: string; question: string; options: string[] }[];
  attempts?: { score: number; passed: boolean; created_at: string }[];
  passed?: boolean;
  canAttempt?: boolean;
  attemptsLeft?: number | null;
};

type Result = {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  passingScore: number;
  attemptsLeft: number | null;
  review: { questionId: string; correct: boolean; correctIndex?: number; explanation?: string | null }[];
};

export default function CourseExamPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setResult(null);
    setAnswers({});
    setError("");
    const res = await fetch(`/api/exams/${id}`, { cache: "no-store" });
    setData(await res.json().catch(() => ({ available: false })));
  };

  useEffect(() => { load(); }, [id]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/exams/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) { setError(body.error || "Não foi possível enviar a prova."); return; }
    setResult(body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = (
    <Link href={`/dashboard/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
      <ArrowLeft className="w-4 h-4" /> Voltar ao curso
    </Link>
  );

  if (!data) {
    return <div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!data.available || !data.exam || !data.questions) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {back}
        <div className="glass p-10 rounded-2xl border border-white/10 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{data.error || "A prova deste curso ainda não está disponível."}</p>
        </div>
      </div>
    );
  }

  const { exam, questions } = data;
  const answeredAll = questions.every((q) => answers[q.id] !== undefined);
  const reviewOf = (qid: string) => result?.review.find((r) => r.questionId === qid);
  const bestScore = data.attempts?.length ? Math.max(...data.attempts.map((a) => a.score)) : null;

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20">
      {back}

      <div className="mb-8">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-2 block">Avaliação final</span>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{exam.title}</h1>
        {exam.description && <p className="text-muted-foreground mb-3">{exam.description}</p>}
        <p className="text-sm text-muted-foreground">
          {exam.question_count} perguntas · nota mínima {exam.passing_score}%
          {exam.max_attempts != null && ` · ${data.attemptsLeft ?? 0} de ${exam.max_attempts} tentativa(s) restante(s)`}
        </p>
        {data.preview && (
          <p className="mt-3 text-xs rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-3 py-2">
            Prévia de administrador: a prova ainda não foi liberada e esta tentativa não será registrada.
          </p>
        )}
      </div>

      {result && (
        <div className={cn("glass p-6 rounded-2xl border mb-8 text-center", result.passed ? "border-green-500/40" : "border-red-500/40")}>
          {result.passed ? <Trophy className="w-10 h-10 text-green-500 mx-auto mb-3" /> : <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />}
          <p className="text-4xl font-black mb-1">{result.score}%</p>
          <p className="text-sm text-muted-foreground mb-2">
            {result.correctCount} de {result.total} acertos · mínimo {result.passingScore}%
          </p>
          <p className={cn("font-bold", result.passed ? "text-green-500" : "text-red-500")}>
            {result.passed ? "Parabéns, você foi aprovado!" : "Ainda não foi dessa vez."}
          </p>
          {!result.passed && (result.attemptsLeft == null || result.attemptsLeft > 0) && (
            <Button onClick={load} variant="outline" className="mt-4 border-white/20">
              <RotateCcw className="w-4 h-4 mr-2" /> Tentar de novo
            </Button>
          )}
        </div>
      )}

      {!result && data.passed && (
        <div className="glass p-6 rounded-2xl border border-green-500/40 mb-8 text-center">
          <Trophy className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-green-500">Você já foi aprovado nesta prova{bestScore != null ? ` com ${bestScore}%` : ""}.</p>
        </div>
      )}

      {!result && !data.passed && !data.canAttempt && (
        <div className="glass p-6 rounded-2xl border border-white/10 mb-8 text-center">
          <p className="text-muted-foreground">Você já usou todas as tentativas{bestScore != null ? `. Melhor nota: ${bestScore}%` : ""}.</p>
        </div>
      )}

      {(data.canAttempt || result) && (
        <div className="space-y-5">
          {questions.map((q, i) => {
            const review = reviewOf(q.id);
            return (
              <div
                key={q.id}
                className={cn(
                  "glass p-6 rounded-2xl border",
                  review ? (review.correct ? "border-green-500/40" : "border-red-500/40") : "border-white/10"
                )}
              >
                <p className="font-semibold mb-4">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    const isCorrect = review?.correctIndex === oi;
                    return (
                      <button
                        key={oi}
                        disabled={!!result}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={cn(
                          "w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                          isCorrect ? "border-green-500 bg-green-500/10" :
                          selected && review && !review.correct ? "border-red-500 bg-red-500/10" :
                          selected ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"
                        )}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {review?.explanation && <p className="text-xs text-muted-foreground mt-3">{review.explanation}</p>}
              </div>
            );
          })}

          {!result && (
            <div className="pt-2">
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              <Button
                onClick={submit}
                disabled={!answeredAll || submitting}
                className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : answeredAll ? "Enviar prova" : `Responda todas as perguntas (${Object.keys(answers).length}/${questions.length})`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
