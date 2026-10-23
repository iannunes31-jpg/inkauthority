"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, PlayCircle, Save, X, Layers, Settings, Trash2, Link2, BookOpen, Subtitles, Pencil } from "lucide-react";
import Link from "next/link";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MaterialsEditor, type Material } from "@/components/admin/MaterialsEditor";

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
  const [eqName, setEqName] = useState("");
  const [eqUrl, setEqUrl] = useState("");
  // Caption state per lesson: real progress from the server (steps done out of 3).
  type CaptionState = { progress: number; step: string; running?: boolean; done?: boolean; error?: string };
  const [captions, setCaptions] = useState<Record<string, CaptionState>>({});
  const setCap = (lessonId: string, patch: CaptionState) => setCaptions(prev => ({ ...prev, [lessonId]: patch }));

  const handleGenerateCaptions = async (lesson: any) => {
    if (!lesson.video_url) return alert("Essa aula não tem vídeo cadastrado.");
    setCap(lesson.id, { progress: 0, step: "Preparando", running: true });
    let translate = false;
    try {
      // The server does one step per call; keep calling while it reports progress (up to ~20 min).
      for (let i = 0; i < 90; i++) {
        const res: Response = await fetch("/api/admin/generate-captions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: lesson.video_url, translate }),
        });
        const data: any = await res.json().catch(() => ({ error: `Erro ${res.status}` }));
        if (data.status === "done") return setCap(lesson.id, { progress: 100, step: "PT · EN · ES", done: true });
        if (data.status !== "processing") return setCap(lesson.id, { progress: 0, step: "", error: data.error || "Erro desconhecido" });
        setCap(lesson.id, { progress: data.progress ?? 0, step: data.step ?? "Processando", running: true });
        translate = data.next === "translate";
        // Translation starts right away; transcription runs on Cloudflare, so check back in a bit.
        if (!translate) await new Promise((r) => setTimeout(r, 12000));
      }
      setCap(lesson.id, { progress: 0, step: "", error: "Demorou demais. Clique de novo para continuar de onde parou." });
    } catch {
      setCap(lesson.id, { progress: 0, step: "", error: "Erro de conexão. Clique de novo para continuar." });
    }
  };

  // On load, show which lessons already have captions.
  useEffect(() => {
    const lessons = modules.flatMap((m: any) => m.lessons ?? []).filter((l: any) => l.video_url && !captions[l.id]);
    lessons.forEach(async (l: any) => {
      const res = await fetch(`/api/admin/generate-captions?videoId=${l.video_url}`).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (data?.complete) setCaptions(prev => (prev[l.id] ? prev : { ...prev, [l.id]: { progress: 100, step: "PT · EN · ES", done: true } }));
    });
  }, [modules]);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // Saves one course field right away, undoing the change on screen if it fails.
  const updateCourse = async (patch: Record<string, unknown>, failMsg: string) => {
    const previous = course;
    setCourse((c: any) => ({ ...c, ...patch }));
    const res = await fetch("/api/admin/courses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => null);
    const body = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setCourse(previous);
      alert(body?.error || failMsg);
      return false;
    }
    if (body?.id) setCourse(body);
    return true;
  };
  const updateCover = (url: string) => updateCourse({ thumbnail_url: url }, "Não foi possível salvar a capa. Tente de novo.");

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const saveTitle = async () => {
    if (titleDraft.trim() && titleDraft.trim() !== course.title.trim()) {
      if (!(await updateCourse({ title: titleDraft }, "Não foi possível renomear o curso."))) return;
    }
    setEditingTitle(false);
  };

  const togglePublished = () => {
    const publish = !course.is_published;
    if (publish && !modules.some((m: any) => m.lessons?.length)) {
      return alert("Adicione pelo menos uma aula antes de publicar.");
    }
    if (!publish && !confirm("Voltar para rascunho? O curso deixa de aparecer para venda até ser publicado de novo.")) return;
    updateCourse({ is_published: publish }, "Não foi possível alterar o status do curso.");
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // Fetch course
      const courseRes = await fetch(`/api/admin/courses?id=${id}`, { cache: "no-store" });
      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.error);
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

  // Set while the lesson modal edits an existing lesson instead of creating one.
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const handleEditLesson = (moduleId: string, lesson: any) => {
    setEditingLessonId(lesson.id);
    setActiveModuleId(moduleId);
    setNewLessonTitle(lesson.title?.trim() ?? "");
    setNewLessonVideoId(lesson.video_url || null);
    setMaterials(Array.isArray(lesson.support_materials) ? lesson.support_materials : []);
    setEquipment(Array.isArray(lesson.equipment_links) ? lesson.equipment_links : []);
    setEqName(""); setEqUrl("");
    setIsLessonModalOpen(true);
  };

  const [editingModule, setEditingModule] = useState<{ id: string; title: string } | null>(null);
  const saveModuleTitle = async () => {
    if (!editingModule) return;
    const res = await fetch("/api/admin/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingModule),
    }).catch(() => null);
    if (!res?.ok) return alert((await res?.json().catch(() => ({})))?.error || "Não foi possível renomear o módulo.");
    setEditingModule(null);
    fetchCourseData();
  };

  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const saveDescription = async () => {
    if (await updateCourse({ description: descriptionDraft }, "Não foi possível salvar a descrição.")) setEditingDescription(false);
  };

  const handleOpenLessonModal = (moduleId: string) => {
    setEditingLessonId(null);
    setActiveModuleId(moduleId);
    setNewLessonTitle("");
    setNewLessonVideoId(null);
    setMaterials([]);
    setEquipment([]);
    setEqName(""); setEqUrl("");
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!newLessonTitle || !newLessonVideoId || !activeModuleId) return;
    setIsSavingLesson(true);
    try {
      const targetModule = modules.find(m => m.id === activeModuleId);
      const nextIndex = targetModule?.lessons?.length || 0;

      const fields = { title: newLessonTitle, video_url: newLessonVideoId, support_materials: materials, equipment_links: equipment };
      const res = await fetch("/api/admin/lessons", {
        method: editingLessonId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLessonId ? { id: editingLessonId, ...fields } : { module_id: activeModuleId, order_index: nextIndex, ...fields }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditingLessonId(null);
      setIsLessonModalOpen(false);
      fetchCourseData();
    } catch (err) {
      console.error("Erro ao salvar aula:", err);
      alert("Erro ao salvar aula");
    } finally {
      setIsSavingLesson(false);
    }
  };

  // Editing the materials of a lesson that already exists.
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editMaterials, setEditMaterials] = useState<Material[]>([]);
  const [savingMaterials, setSavingMaterials] = useState(false);

  const openMaterials = (lesson: any) => {
    setEditingLesson(lesson);
    setEditMaterials(Array.isArray(lesson.support_materials) ? lesson.support_materials : []);
  };

  const saveMaterials = async () => {
    if (!editingLesson) return;
    setSavingMaterials(true);
    const res = await fetch("/api/admin/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingLesson.id, support_materials: editMaterials }),
    }).catch(() => null);
    setSavingMaterials(false);
    if (!res?.ok) return alert("Não foi possível salvar os materiais. Tente de novo.");
    setEditingLesson(null);
    fetchCourseData();
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
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <div className="flex gap-2 mb-1">
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                maxLength={120}
                autoFocus
                className="bg-black/50 text-lg font-bold h-11"
              />
              <Button onClick={saveTitle} className="metallic-gradient text-black font-bold h-11">Salvar</Button>
              <Button variant="ghost" onClick={() => setEditingTitle(false)} className="h-11">Cancelar</Button>
            </div>
          ) : (
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              {course.title}
              <button
                onClick={() => { setTitleDraft(course.title.trim()); setEditingTitle(true); }}
                className="text-muted-foreground hover:text-foreground"
                title="Editar nome do curso (aparece no certificado)"
                aria-label="Editar nome do curso"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </h2>
          )}
          {editingDescription ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                maxLength={5000}
                rows={5}
                autoFocus
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-y"
                placeholder="Descrição que o aluno vê na página do curso"
              />
              <div className="flex gap-2">
                <Button onClick={saveDescription} className="metallic-gradient text-black font-bold">Salvar descrição</Button>
                <Button variant="ghost" onClick={() => setEditingDescription(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-start gap-2">
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl">{course.description || "Sem descrição"}</p>
              <button
                onClick={() => { setDescriptionDraft(course.description ?? ""); setEditingDescription(true); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 border border-white/10 rounded-md px-2 py-1"
              >
                <Pencil className="w-3 h-3" /> Editar descrição
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass rounded-xl p-4 border border-white/10 text-center">
             <div className="mb-4 text-left">
                <ImageUpload value={course.thumbnail_url || ""} onChange={updateCover} />
             </div>
             <span
               className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border mb-3 ${
                 course.is_published ? "bg-green-500/15 text-green-400 border-green-500/40" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/40"
               }`}
             >
               <span className={`w-2 h-2 rounded-full ${course.is_published ? "bg-green-400" : "bg-yellow-400"}`} />
               {course.is_published ? "Publicado" : "Rascunho"}
             </span>
             <Button
               onClick={togglePublished}
               variant={course.is_published ? "outline" : "default"}
               className={course.is_published ? "w-full border-white/15 text-xs" : "w-full metallic-gradient text-black font-bold"}
             >
               {course.is_published ? "Voltar para rascunho" : "Publicar curso"}
             </Button>
             {!course.is_published && (
               <p className="text-[11px] text-muted-foreground mt-2">Em rascunho o curso não pode ser comprado.</p>
             )}
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
                   {editingModule?.id === mod.id ? (
                     <div className="flex items-center gap-2 flex-1 mr-4">
                       <Input
                         value={editingModule?.title ?? ""}
                         onChange={(e) => setEditingModule({ id: mod.id, title: e.target.value })}
                         onKeyDown={(e) => { if (e.key === "Enter") saveModuleTitle(); if (e.key === "Escape") setEditingModule(null); }}
                         autoFocus
                         className="bg-black/50 font-bold h-9"
                       />
                       <Button size="sm" onClick={saveModuleTitle} className="metallic-gradient text-black font-bold h-9">Salvar</Button>
                       <Button size="sm" variant="ghost" onClick={() => setEditingModule(null)} className="h-9">Cancelar</Button>
                     </div>
                   ) : (
                     <h3 className="text-lg font-bold flex items-center gap-2">
                       <span className="bg-white/10 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                       {mod.title}
                       <button onClick={() => setEditingModule({ id: mod.id, title: mod.title.trim() })} className="text-muted-foreground hover:text-foreground" title="Renomear módulo" aria-label="Renomear módulo">
                         <Pencil className="w-3.5 h-3.5" />
                       </button>
                     </h3>
                   )}
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
                           <div className="flex items-center gap-3 min-w-0">
                              <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-sm font-medium whitespace-nowrap truncate">{lIndex + 1}. {lesson.title}</span>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                              {captions[lesson.id] && (() => {
                                const c = captions[lesson.id];
                                if (c.error) return <span className="text-[10px] text-red-400 font-medium max-w-[220px] truncate" title={c.error}>{c.error}</span>;
                                if (c.done) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 whitespace-nowrap">✓ Legendas {c.step}</span>;
                                return (
                                  <div className="w-44" title={c.step}>
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                      <span className="truncate">{c.step}</span>
                                      <span className="font-semibold text-foreground">{c.progress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                                      <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(c.progress, 3)}%` }} />
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                                    </div>
                                  </div>
                                );
                              })()}
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleEditLesson(mod.id, lesson)}
                                className="text-muted-foreground hover:text-primary h-8 text-xs gap-1.5"
                                title="Editar aula (título, vídeo, materiais, equipamentos)"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Editar
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => openMaterials(lesson)}
                                className="text-muted-foreground hover:text-primary h-8 text-xs gap-1.5"
                                title="Materiais de apoio (PDFs e links)"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Materiais{Array.isArray(lesson.support_materials) && lesson.support_materials.length > 0 ? ` (${lesson.support_materials.length})` : ""}
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleGenerateCaptions(lesson)}
                                disabled={!!captions[lesson.id]?.running}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all h-8 text-xs gap-1.5"
                                title="Gerar legendas automáticas (PT/EN/ES)"
                              >
                                <Subtitles className="w-3.5 h-3.5" />
                                Legendas
                              </Button>
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

      {/* Modal Materiais de uma aula existente */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setEditingLesson(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-white" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-1">Materiais de apoio</h3>
            <p className="text-sm text-muted-foreground mb-5">{editingLesson.title}</p>
            <MaterialsEditor value={editMaterials} onChange={setEditMaterials} />
            <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-white/5">
              <Button variant="outline" onClick={() => setEditingLesson(null)}>Cancelar</Button>
              <Button onClick={saveMaterials} disabled={savingMaterials} className="metallic-gradient text-black font-bold">
                {savingMaterials ? "Salvando..." : "Salvar materiais"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="text-xl font-bold mb-4">{editingLessonId ? "Editar Aula" : "Nova Aula"}</h3>
            
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
                 <MaterialsEditor value={materials} onChange={setMaterials} />
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
                 {isSavingLesson ? "Salvando..." : editingLessonId ? "Salvar alterações" : "Salvar Aula"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
