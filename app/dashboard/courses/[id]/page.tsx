"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonComments } from "@/components/LessonComments";
import { PlayCircle, CheckCircle, ChevronDown, ChevronUp, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentCoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    fetchCourseData();
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

      // Set first lesson active by default
      if (orderedModules.length > 0 && orderedModules[0].lessons.length > 0) {
        setActiveLesson(orderedModules[0].lessons[0]);
        setExpandedModules([orderedModules[0].id]);
      }
    } catch (err) {
      console.error("Erro ao carregar curso:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <p>Curso não encontrado ou não está disponível.</p>
        <Link href="/dashboard/courses">
          <Button variant="link" className="text-primary mt-4">Voltar aos Cursos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20 p-4 lg:p-6 h-[calc(100vh-80px)]">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
        {/* Lado Esquerdo - Player */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            {activeLesson ? (
              <VideoPlayer 
                videoId={activeLesson.video_url} 
                poster={course.thumbnail_url} 
                className="w-full aspect-video"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-black/50 text-muted-foreground">
                <p>Nenhuma aula selecionada ou disponível.</p>
              </div>
            )}
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h1 className="text-2xl font-bold mb-2">
              {activeLesson ? activeLesson.title : course.title}
            </h1>
            <p className="text-muted-foreground">
               {course.description || "Nenhuma descrição fornecida para este curso."}
            </p>
          </div>

          {activeLesson && <LessonComments lessonId={activeLesson.id} />}
        </div>

        {/* Lado Direito - Módulos */}
        <div className="lg:col-span-1 xl:col-span-1 glass rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-black/40">
            <h2 className="text-lg font-bold">Conteúdo do Curso</h2>
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
                                onClick={() => setActiveLesson(lesson)}
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
          </div>
        </div>
      </div>

    </div>
  );
}
