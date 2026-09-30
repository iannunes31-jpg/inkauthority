"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, PlayCircle, Save, X, Layers, Settings, Trash2, Link2, BookOpen, Subtitles } from "lucide-react";
import Link from "next/link";
import { VideoUploader } from "@/components/admin/VideoUploader";

export default function CourseManagerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideoId, setNewLessonVideoId] = useState<string | null>(null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [materials, setMaterials] = useState<{ name: string; url: string }[]>([]);
  const [equipment, setEquipment] = useState<{ name: string; url: string }[]>([]);
  const [matName, setMatName] = useState("");
  const [matUrl, setMatUrl] = useState("");
  const [eqName, setEqName] = useState("");
  const [eqUrl, setEqUrl] = useState("");
  const [generatingCaptions, setGeneratingCaptions] = useState<string | null>(null);
  const [captionStatus, setCaptionStatus] = useState<Record<string, string>>({});

  const handleGenerateCaptions = async (lesson: any) => {
    if (!lesson.video_url) return alert("Essa aula não tem vídeo cadastrado.");
    setGeneratingCaptions(lesson.id);
    setCaptionStatus(prev => ({ ...prev, [lesson.id]: "Gerando..." }));
    try {
      const res = await fetch("/api/admin/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: lesson.video_url }),
      });
      const data = await res.json();
      if (data.status === "done") {
        setCaptionStatus(prev => ({ ...prev, [lesson.id]: "✓ PT / EN / ES" }));
      } else if (data.status === "processing") {
        setCaptionStatus(prev => ({ ...prev, [lesson.id]: "⏳ " + data.message }));
      } else {
        setCaptionStatus(prev => ({ ...prev, [lesson.id]: "Erro: " + data.error }));
      }
    } catch {
      setCaptionStatus(prev => ({ ...prev, [lesson.id]: "Erro de conexão" }));
    } finally {
      setGeneratingCaptions(null);
    }
  };

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

      // Fetch modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", id)
        .order("order_index", { ascending: true });
        
      if (modulesError) throw modulesError;
      
      // Order lessons inside modules
      const orderedModules = modulesData.map((m: any) => ({
        ...m,
        lessons: m.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setModules(orderedModules);
    } catch (err) {
      console.error("Erro ao buscar dados do curso:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle) return;
    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: id, title: newModuleTitle, order_index: modules.length }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setNewModuleTitle("");
      setIsModuleModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error("Erro ao adicionar módulo:", err);
      alert("Erro ao adicionar módulo");
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja apagar este módulo e todas as aulas dele?")) return;
    try {
      const res = await fetch(`/api/admin/modules?id=${moduleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchCourseData();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir módulo");
    }
  };

  const handleOpenLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setNewLessonTitle("");
    setNewLessonVideoId(null);
    setMaterials([]);
    setEquipment([]);
    setMatName(""); setMatUrl("");
    setEqName(""); setEqUrl("");
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!newLessonTitle || !newLessonVideoId || !activeModuleId) return;
    setIsSavingLesson(true);
    try {
      const targetModule = modules.find(m => m.id === activeModuleId);
      const nextIndex = targetModule?.lessons?.length || 0;

      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: activeModuleId,
          title: newLessonTitle,
          video_url: newLessonVideoId,
          order_index: nextIndex,
          support_materials: materials,
          equipment_links: equipment,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setIsLessonModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error("Erro ao salvar aula:", err);
      alert("Erro ao salvar aula");
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta aula?")) return;
    try {
      const res = await fetch(`/api/admin/lessons?id=${lessonId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchCourseData();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir aula");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-muted-foreground">Curso não encontrado.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{course.title}</h2>
          <p className="text-muted-foreground font-light flex items-center gap-2">
            <Settings className="w-4 h-4" /> Gerenciador de Conteúdo do Curso
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass rounded-xl p-4 border border-white/10 text-center">
             {course.thumbnail_url ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 border border-white/10">
                   <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="aspect-video w-full rounded-lg bg-black/50 mb-4 border border-white/10 flex items-center justify-center">
                   <Layers className="w-8 h-8 text-white/20" />
                </div>
             )}
             <p className="text-sm font-semibold">{course.is_published ? "🟢 Publicado" : "🟡 Rascunho"}</p>
          </div>
          
          <Button 
            className="w-full metallic-gradient text-black font-bold" 
            onClick={() => setIsModuleModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Módulo
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {modules.length === 0 ? (
             <div className="glass p-10 rounded-2xl border border-white/10 text-center text-muted-foreground">
               <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <h3 className="text-lg font-bold text-white mb-2">Nenhum Módulo Ainda</h3>
               <p className="text-sm mb-4">Crie seu primeiro módulo para começar a adicionar as aulas.</p>
             </div>
          ) : (
            modules.map((mod: any, index: number) => (
              <div key={mod.id} className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-black/60 p-4 border-b border-white/10 flex items-center justify-between">
                   <h3 className="text-lg font-bold flex items-center gap-2">
                     <span className="bg-white/10 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                     {mod.title}
                   </h3>
                   <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={() => handleOpenLessonModal(mod.id)} className="text-primary hover:text-primary/80 hover:bg-primary/10">
                       <Plus className="w-4 h-4 mr-1" /> Nova Aula
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(mod.id)} className="text-muted-foreground hover:text-red-400">
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                </div>
                <div className="p-2">
                   {(!mod.lessons || mod.lessons.length === 0) ? (
                      <div className="p-6 text-center text-sm text-white/40">Este módulo não tem aulas.</div>
                   ) : (
                      mod.lessons.map((lesson: any, lIndex: number) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg group transition-colors">
                           <div className="flex items-center gap-3">
                              <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-sm font-medium">{lIndex + 1}. {lesson.title}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              {captionStatus[lesson.id] && (
                                <span className="text-[10px] text-primary font-medium">{captionStatus[lesson.id]}</span>
                              )}
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleGenerateCaptions(lesson)}
                                disabled={generatingCaptions === lesson.id}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all h-8 text-xs gap-1.5"
                                title="Gerar legendas automáticas (PT/EN/ES)"
                              >
                                <Subtitles className="w-3.5 h-3.5" />
                                {generatingCaptions === lesson.id ? "Gerando..." : "Legendas"}
                              </Button>
                              <span className="text-xs font-mono text-white/20 hidden md:block">{lesson.video_url}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                      ))
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Criar Módulo */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Novo Módulo</h3>
            <Input 
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="Ex: Módulo 1 - Fundamentos" 
              className="bg-black/50 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModuleModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddModule} disabled={!newModuleTitle} className="metallic-gradient text-black">Criar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Aula */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsLessonModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
               <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Nova Aula</h3>
            
            <div className="space-y-4 mb-6">
               <div>
                 <label className="text-sm text-muted-foreground mb-1 block">Título da Aula</label>
                 <Input 
                   value={newLessonTitle}
                   onChange={(e) => setNewLessonTitle(e.target.value)}
                   placeholder="Ex: Aula 1 - Biossegurança" 
                   className="bg-black/50"
                 />
               </div>

               <div>
                 <label className="text-sm text-muted-foreground mb-1 block">Vídeo (Cloudflare Stream)</label>
                 {!newLessonVideoId ? (
                   <div className="space-y-3">
                     <VideoUploader onSuccess={(id) => setNewLessonVideoId(id)} />
                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <div className="h-px flex-1 bg-white/10" />
                       <span>ou cole o ID diretamente</span>
                       <div className="h-px flex-1 bg-white/10" />
                     </div>
                     <div className="flex gap-2">
                       <Input
                         placeholder="ID do Cloudflare Stream (ex: f2a135026e57...)"
                         className="bg-black/50 font-mono text-xs"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             const val = (e.target as HTMLInputElement).value.trim();
                             if (val) setNewLessonVideoId(val);
                           }
                         }}
                       />
                       <Button
                         variant="outline"
                         size="sm"
                         className="border-white/10 shrink-0"
                         onClick={(e) => {
                           const input = (e.currentTarget.previousSibling as HTMLInputElement);
                           const val = input?.value.trim();
                           if (val) setNewLessonVideoId(val);
                         }}
                       >
                         Usar ID
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4 flex flex-col items-center text-center">
                     <p className="text-green-400 font-bold mb-2">Vídeo Configurado!</p>
                     <p className="text-xs text-muted-foreground mb-4">ID: {newLessonVideoId}</p>
                     <Button variant="outline" size="sm" onClick={() => setNewLessonVideoId(null)} className="border-white/10">
                       Substituir
                     </Button>
                   </div>
                 )}
               </div>
            </div>

               {/* Materiais de Apoio */}
               <div>
                 <label className="text-sm text-muted-foreground mb-2 flex items-center gap-1 block">
                   <BookOpen className="w-4 h-4" /> Materiais de Apoio <span className="text-white/30">(opcional)</span>
                 </label>
                 <div className="space-y-2 mb-2">
                   {materials.map((m, i) => (
                     <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                       <span className="flex-1 truncate font-medium">{m.name}</span>
                       <span className="text-white/40 truncate flex-1">{m.url}</span>
                       <button onClick={() => setMaterials(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 shrink-0">
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <Input value={matName} onChange={e => setMatName(e.target.value)} placeholder="Nome do material" className="bg-black/50 text-xs h-9" />
                   <Input value={matUrl} onChange={e => setMatUrl(e.target.value)} placeholder="URL (link)" className="bg-black/50 text-xs h-9" />
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     className="border-white/10 shrink-0 h-9"
                     onClick={() => {
                       if (matName.trim() && matUrl.trim()) {
                         setMaterials(prev => [...prev, { name: matName.trim(), url: matUrl.trim() }]);
                         setMatName(""); setMatUrl("");
                       }
                     }}
                   >
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
               </div>

               {/* Links de Equipamento */}
               <div>
                 <label className="text-sm text-muted-foreground mb-2 flex items-center gap-1 block">
                   <Link2 className="w-4 h-4" /> Links de Equipamento <span className="text-white/30">(opcional)</span>
                 </label>
                 <div className="space-y-2 mb-2">
                   {equipment.map((e, i) => (
                     <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
                       <span className="flex-1 truncate font-medium">{e.name}</span>
                       <span className="text-white/40 truncate flex-1">{e.url}</span>
                       <button onClick={() => setEquipment(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 shrink-0">
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <Input value={eqName} onChange={e => setEqName(e.target.value)} placeholder="Nome do equipamento" className="bg-black/50 text-xs h-9" />
                   <Input value={eqUrl} onChange={e => setEqUrl(e.target.value)} placeholder="URL (link para compra)" className="bg-black/50 text-xs h-9" />
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     className="border-white/10 shrink-0 h-9"
                     onClick={() => {
                       if (eqName.trim() && eqUrl.trim()) {
                         setEquipment(prev => [...prev, { name: eqName.trim(), url: eqUrl.trim() }]);
                         setEqName(""); setEqUrl("");
                       }
                     }}
                   >
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
               </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={() => setIsLessonModalOpen(false)}>Cancelar</Button>
              <Button
                 onClick={handleSaveLesson}
                 disabled={!newLessonTitle || !newLessonVideoId || isSavingLesson}
                 className="metallic-gradient text-black font-bold"
              >
                 {isSavingLesson ? "Salvando..." : "Salvar Aula"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
