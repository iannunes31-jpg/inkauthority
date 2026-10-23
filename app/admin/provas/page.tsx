"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Plus, Trash2, Loader2, ArrowUp, ArrowDown, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type CourseRow = { id: string; title: string; hasExam: boolean; active: boolean; questionCount: number };
type Question = { question: string; options: string[]; correct_index: number; explanation: string };

const newQuestion = (): Question => ({ question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" });
const input = "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:border-white/30";
const label = "text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block";

export default function AdminProvasPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("Prova final");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("");
  const [active, setActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const loadList = async () => {
    const res = await fetch("/api/admin/exams", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (res.ok) setCourses(data);
    else setMessage(data.error || "Erro ao carregar. Rodou o SQL das provas (supabase-exams.sql)?");
    setLoadingList(false);
  };

  useEffect(() => { loadList(); }, []);

  const openCourse = async (id: string) => {
    setCourseId(id);
    setMessage("");
    if (!id) return;
    setLoadingExam(true);
    const res = await fetch(`/api/admin/exams?courseId=${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    const exam = data.exam;
    setTitle(exam?.title ?? "Prova final");
    setDescription(exam?.description ?? "");
    setPassingScore(String(exam?.passing_score ?? 70));
    setMaxAttempts(exam?.max_attempts != null ? String(exam.max_attempts) : "");
    setActive(!!exam?.active);
    setQuestions(
      (data.questions ?? []).map((q: any) => ({
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation ?? "",
      }))
    );
    setLoadingExam(false);
  };

  const updateQuestion = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const move = (i: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + dir;
      if (j < 0 || j >= qs.length) return qs;
      const copy = [...qs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/exams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        description,
        passing_score: passingScore,
        max_attempts: maxAttempts,
        active,
        questions,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? "Prova salva." : data.error || "Erro ao salvar.");
    if (res.ok) loadList();
  };

  if (loadingList) {
    return <div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Provas finais</h1>
          <p className="text-sm text-muted-foreground">
            O aluno faz a prova no fim do curso e vê a nota na hora. O gabarito fica só no servidor.
          </p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <label className={label}>Curso</label>
        <Select value={courseId} onChange={(e) => openCourse(e.target.value)} className={input}>
          <option value="">{courses.length ? "Escolha um curso…" : "Nenhum curso cadastrado ainda (Admin → Matérias)"}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
              {c.hasExam ? ` — ${c.questionCount} pergunta(s), ${c.active ? "liberada" : "rascunho"}` : " — sem prova"}
            </option>
          ))}
        </Select>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {courseId && (loadingExam ? (
        <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Configurações</h2>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Liberada para os alunos
              </label>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className={label}>Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
              </div>
              <div className="md:col-span-3">
                <label className={label}>Instruções para o aluno (opcional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${input} resize-y`} />
              </div>
              <div>
                <label className={label}>Nota mínima para aprovar (%)</label>
                <input type="number" min="1" max="100" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>Limite de tentativas</label>
                <input type="number" min="1" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} placeholder="Ilimitado" className={input} />
              </div>
            </div>
            {!active && (
              <p className="text-xs text-muted-foreground">
                Em rascunho, só administradores veem a prova (e as tentativas de teste não contam).
              </p>
            )}
          </div>

          {questions.map((q, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Pergunta {i + 1}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Subir"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Descer"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))} className="p-1.5 text-muted-foreground hover:text-red-500" aria-label="Excluir pergunta">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(i, { question: e.target.value })}
                rows={2}
                placeholder="Enunciado da pergunta"
                className={`${input} resize-y`}
              />
              <p className="text-[11px] text-muted-foreground">Marque a bolinha da alternativa correta.</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correct_index === oi}
                      onChange={() => updateQuestion(i, { correct_index: oi })}
                      aria-label={`Alternativa ${oi + 1} é a correta`}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateQuestion(i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                      placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                      className={`${input} ${q.correct_index === oi ? "border-green-500/50" : ""}`}
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() =>
                          updateQuestion(i, {
                            options: q.options.filter((_, k) => k !== oi),
                            correct_index: q.correct_index === oi ? 0 : q.correct_index > oi ? q.correct_index - 1 : q.correct_index,
                          })
                        }
                        className="p-1.5 text-muted-foreground hover:text-red-500"
                        aria-label="Remover alternativa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {q.options.length < 6 && (
                <button onClick={() => updateQuestion(i, { options: [...q.options, ""] })} className="text-xs text-muted-foreground hover:text-foreground">
                  + Adicionar alternativa
                </button>
              )}
              <div>
                <label className={label}>Explicação (aparece depois de aprovado — opcional)</label>
                <input value={q.explanation} onChange={(e) => updateQuestion(i, { explanation: e.target.value })} className={input} />
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setQuestions((qs) => [...qs, newQuestion()])} variant="outline" className="border-white/20">
              <Plus className="w-4 h-4 mr-2" /> Adicionar pergunta
            </Button>
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground font-bold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar prova</>}
            </Button>
            <a
              href={`/dashboard/courses/${courseId}/prova`}
              target="_blank"
              rel="noreferrer"
              className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <CheckCircle2 className="w-4 h-4" /> Ver como aluno
            </a>
          </div>
        </>
      ))}
    </div>
  );
}
