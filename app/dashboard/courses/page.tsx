"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Clock, Award, Layers } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedCourses();
  }, []);

  const fetchPublishedCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*, modules(count)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data);
    } catch (err) {
      console.error("Erro ao buscar cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Meus Cursos</h1>
        <p className="text-muted-foreground">Continue de onde parou e acompanhe sua evolução.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando seus cursos...</div>
      ) : courses.length === 0 ? (
         <div className="text-center py-20 glass rounded-2xl border border-white/10">
            <Layers className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <h2 className="text-xl font-bold mb-2">Nenhum curso disponível</h2>
            <p className="text-muted-foreground text-sm">O administrador ainda não publicou nenhum curso.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
              <div 
                className="glass rounded-2xl border border-white/5 overflow-hidden group cursor-pointer h-full flex flex-col hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/10">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                     <Layers className="w-8 h-8 text-white/20" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Etiqueta de Status mockada como em andamento */}
                  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-white/10">
                    <Clock className="w-3 h-3" /> Acessar
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    {course.modules?.[0]?.count || 0} Módulos Disponíveis
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
