"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonComments } from "@/components/LessonComments";
import { PlayCircle, CheckCircle, ChevronDown, ChevronUp, Layers, BookOpen, Link2, Package, GraduationCap, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { Download, FileText } from "lucide-react";

export default function StudentCoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [exam, setExam] = useState<{ title: string; passed: boolean } | null>(null);

  useEffect(() => {
    fetchCourseData();
    fetch(`/api/exams/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setExam(d.available ? { title: d.exam.title, passed: !!d.passed } : null))
      .catch(() => setExam(null));
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
      
      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch modules and lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", id)
        .order("order_index", { ascending: true });
        
      if (modulesError) throw modulesError;
      
      const orderedModules = modulesData.map((m: any) => ({
        ...m,
        lessons: m.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setModules(orderedModules);

      // Set first lesson active by default (or last watched)
      if (orderedModules.length > 0 && orderedModules[0].lessons.length > 0) {
        const firstLesson = orderedModules[0].lessons[0];
        setActiveLesson(firstLesson);
        setExpandedModules([orderedModules[0].id]);
        saveLastWatched(courseData, firstLesson);
      }
    } catch (err) {
      console.error("Erro ao carregar curso:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveLastWatched = (courseData: any, lesson: any) => {
    try {
      localStorage.setItem("lastWatched", JSON.stringify({
        courseId: courseData.id,
        courseTitle: courseData.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        videoId: lesson.video_url,
        timestamp: Date.now(),
      }));
    } catch {}
  };

  const [autoplay, setAutoplay] = useState(false);
  const handleSelectLesson = (lesson: any, play = false) => {
    setAutoplay(play);
    setActiveLesson(lesson);
    if (course) saveLastWatched(course, lesson);
    const mod = modules.find((m: any) => m.lessons.some((l: any) => l.id === lesson.id));
    if (mod) setExpandedModules((prev) => (prev.includes(mod.id) ? prev : [...prev, mod.id]));
  };

  // The lesson after the current one, across modules.
  const allLessons = modules.flatMap((m: any) => m.lessons);
  const nextLesson = activeLesson ? allLessons[allLessons.findIndex((l: any) => l.id === activeLesson.id) + 1] : undefined;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground flex flex-col items-center">
           <Layers className="w-12 h-12 mb-4 opacity-50" />
           <p>Carregando a sala de aula...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Stream Class não encontrada ou não está disponível.</p>
        <Link href="/dashboard/courses">
          <Button variant="link" className="text-primary mt-4">Voltar às Stream Classes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20 p-3 md:p-4 lg:p-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Lado Esquerdo - Player */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 lg:gap-6">
          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            {activeLesson && !activeLesson.video_url ? (
              // Lesson without a video yet (e.g. a bonus with only a PDF).
              <div
                className="w-full aspect-video relative flex items-center justify-center text-center p-6 bg-black bg-cover bg-center"
                style={course.thumbnail_url ? { backgroundImage: `url(${course.thumbnail_url})` } : undefined}
              >
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                <div className="relative max-w-md">
                  <FileText className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-xl font-bold">{activeLesson.title.trim()}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Array.isArray(activeLesson.support_materials) && activeLesson.support_materials.length > 0
                      ? "O conteúdo desta aula está no material de apoio logo abaixo. O vídeo chega em breve."
                      : "O vídeo desta aula chega em breve."}
                  </p>
                  {nextLesson && (
                    <button onClick={() => handleSelectLesson(nextLesson, true)} className="mt-5 inline-flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full">
                      Próxima aula: {nextLesson.title.trim()}
                    </button>
                  )}
                </div>
              </div>
            ) : activeLesson ? (
              <VideoPlayer
                videoId={activeLesson.video_url}
                lessonId={activeLesson.id}
                poster={course.thumbnail_url}
                autoplay={autoplay}
                next={nextLesson ? { title: nextLesson.title.trim(), onGo: () => handleSelectLesson(nextLesson, true) } : undefined}
                className="w-full aspect-video"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-black/50 text-muted-foreground">
                <p>Nenhuma aula selecionada ou disponível.</p>
              </div>
            )}
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h1 className="text-2xl font-bold">
              {activeLesson ? activeLesson.title.trim() : course.title}
            </h1>
            {activeLesson?.description && (
              <ChatMarkdown text={activeLesson.description} className="text-muted-foreground mt-3 text-[15px]" />
            )}
            {/* The course description belongs to the opening lesson only. */}
            {(!activeLesson || activeLesson.id === modules[0]?.lessons?.[0]?.id) && course.description && (
              <ChatMarkdown text={course.description} className="text-muted-foreground mt-3 text-[15px]" />
            )}

            {activeLesson && Array.isArray(activeLesson.support_materials) && activeLesson.support_materials.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" /> Materiais de apoio
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeLesson.support_materials.map((mat: any, i: number) => (
                    <a
                      key={i}
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate">{mat.name || "Material"}</span>
                        <span className="block text-xs text-muted-foreground">{/\.pdf($|\?)/i.test(mat.url) ? "PDF · clique para abrir" : "Link"}</span>
                      </span>
                      <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {activeLesson && Array.isArray(activeLesson.equipment_links) && activeLesson.equipment_links.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-primary" /> Equipamentos indicados
                </h2>
                <div className="flex flex-col gap-2">
                  {activeLesson.equipment_links.map((eq: any, i: number) => (
                    <a key={i} href={eq.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline truncate">
                      <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {eq.name || eq.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeLesson && <LessonComments lessonId={activeLesson.id} />}
        </div>

        {/* Lado Direito - Módulos + Materiais */}
        <div className="lg:col-span-1 xl:col-span-1 glass rounded-2xl border border-white/10 flex flex-col lg:h-[calc(100vh-120px)] overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-black/40">
            <h2 className="text-lg font-bold">Conteúdo da Stream Class</h2>
            <div className="text-sm text-muted-foreground mt-1">
               {modules.length} {modules.length === 1 ? 'Módulo' : 'Módulos'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {modules.length === 0 ? (
               <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhum módulo cadastrado.
               </div>
            ) : (
              modules.map((mod, index) => {
                const isExpanded = expandedModules.includes(mod.id);
                const isModuleActive = activeLesson && mod.lessons.some((l: any) => l.id === activeLesson.id);

                return (
                  <div key={mod.id} className="border-b border-white/5 last:border-0">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${isModuleActive ? 'bg-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs font-bold text-muted-foreground w-6">M{index + 1}</span>
                        <span className="font-semibold text-sm leading-tight">{mod.title}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-black/30 py-2">
                        {mod.lessons.length === 0 ? (
                           <p className="text-xs text-muted-foreground px-10 py-2">Nenhuma aula neste módulo.</p>
                        ) : (
                          mod.lessons.map((lesson: any, lIndex: number) => {
                            const isCurrent = activeLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleSelectLesson(lesson)}
                                className={`w-full flex items-start gap-3 px-6 py-3 text-left hover:bg-white/5 transition-colors ${isCurrent ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                              >
                                {isCurrent ? (
                                  <PlayCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                                )}
                                <span className={`text-sm leading-tight ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                                  {lIndex + 1}. {lesson.title}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {exam && (
              <Link
                href={`/dashboard/courses/${id}/prova`}
                className="flex items-center gap-3 m-4 p-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 transition-colors"
              >
                <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">{exam.passed ? "Você já foi aprovado ✓" : "Teste o que você aprendeu"}</p>
                </div>
              </Link>
            )}
            {exam?.passed && (
              <Link
                href={`/dashboard/courses/${id}/certificado`}
                className="flex items-center gap-3 mx-4 mb-4 p-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Award className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold">Certificado de conclusão</p>
                  <p className="text-xs text-muted-foreground">Emita e baixe o seu certificado</p>
                </div>
              </Link>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}
