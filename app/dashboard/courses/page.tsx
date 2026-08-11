"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Clock, Award, Layers, Lock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";

export default function MyCoursesPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = 
    user?.primaryEmailAddress?.emailAddress === "yurilojavirtual@gmail.com" || 
    user?.primaryEmailAddress?.emailAddress === "o9.yuri@gmail.com";

  useEffect(() => {
    if (userId) {
      fetchCoursesAndAccess();
    }
  }, [userId]);

  const fetchCoursesAndAccess = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*, modules(count)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      
      // 2. Fetch user purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('user_purchases')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_type', 'course');

      if (purchasesError) throw purchasesError;

      const purchasedIds = purchasesData.map(p => p.product_id);
      
      setCourses(coursesData || []);
      setPurchasedCourseIds(purchasedIds);
      setHasFullAccess(purchasedIds.includes('all'));

    } catch (err) {
      console.error("Erro ao buscar cursos e acessos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockedClick = async (e: React.MouseEvent, course: any) => {
    e.preventDefault();
    try {
      // alert(\`Redirecionando para o checkout da matéria: \${course.title}...\`);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: course.title, 
          price: course.price || 97.00, // Preço padrão caso não esteja cadastrado
          productId: course.id,
          productType: 'course',
          isSubscription: false, 
          returnUrl: '/dashboard/courses' 
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar checkout: ' + (data.error || 'Desconhecido'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao iniciar checkout.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Matérias Disponíveis</h1>
        <p className="text-muted-foreground">Acesse seus treinamentos ou descubra novos conteúdos para evoluir sua arte.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando acervo...</div>
      ) : courses.length === 0 ? (
         <div className="text-center py-20 glass rounded-2xl border border-white/10">
            <Layers className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <h2 className="text-xl font-bold mb-2">Nenhuma matéria disponível</h2>
            <p className="text-muted-foreground text-sm">O administrador ainda não publicou nenhuma matéria.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const hasAccess = isAdmin || hasFullAccess || purchasedCourseIds.includes(course.id);

            return (
              <Link 
                href={hasAccess ? `/dashboard/courses/${course.id}` : "#"} 
                key={course.id}
                onClick={hasAccess ? undefined : (e) => handleLockedClick(e, course)}
              >
                <div 
                  className={`glass rounded-2xl border ${hasAccess ? 'border-white/5 hover:border-primary/50' : 'border-white/5 opacity-80'} overflow-hidden group cursor-pointer h-full flex flex-col hover:-translate-y-1 transition-all duration-300 relative`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/10">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className={`w-full h-full object-cover transition-opacity ${hasAccess ? 'opacity-80 group-hover:opacity-100' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'}`}
                      />
                    ) : (
                       <Layers className="w-8 h-8 text-white/20" />
                    )}
                    
                    {hasAccess ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Lock className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                    
                    {/* Etiqueta de Status */}
                    {hasAccess ? (
                      <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-white/10">
                        <Clock className="w-3 h-3" /> Acessar
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-primary/20">
                        Bloqueado
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className={`font-bold text-lg mb-2 leading-tight transition-colors line-clamp-2 ${hasAccess ? 'group-hover:text-primary' : 'text-white/70'}`}>
                      {course.title}
                    </h3>
                    
                    <div className="text-xs text-muted-foreground mb-4">
                      {course.modules?.[0]?.count || 0} Módulos
                    </div>

                    {!hasAccess && (
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 text-primary text-sm font-bold bg-primary/10 py-2 rounded-lg group-hover:bg-primary group-hover:text-black transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                          <span>Desbloquear Matéria</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
