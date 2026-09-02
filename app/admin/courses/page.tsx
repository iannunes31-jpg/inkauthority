"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Video, Search, ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetches courses and a count of modules per course using a subquery
      const { data, error } = await supabase
        .from('courses')
        .select(`*, modules(count)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data);
    } catch (err) {
      console.error("Erro ao carregar cursos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este curso inteiro, com todos os módulos e aulas?")) return;
    try {
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir curso");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Cursos & Módulos</h2>
          <p className="text-muted-foreground font-light">Gerencie a estrutura da sua plataforma EAD.</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="metallic-gradient text-black font-bold">
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        </Link>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar curso..."
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Curso</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Módulos</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground animate-pulse">
                    <p>Carregando...</p>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum curso cadastrado ainda.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        {course.thumbnail_url ? (
                           <div className="w-16 h-10 rounded-md bg-black border border-white/10 overflow-hidden flex-shrink-0">
                             <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="Capa" />
                           </div>
                        ) : (
                           <div className="w-16 h-10 rounded-md bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                             <Video className="w-4 h-4 text-muted-foreground" />
                           </div>
                        )}
                        <div>
                          <span className="font-medium text-white line-clamp-1">{course.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{course.description || 'Sem descrição'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground text-sm">
                       <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {course.modules[0]?.count || 0}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${course.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {course.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/courses/${course.id}`}>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
