"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Clock, Award, Layers, Lock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";
import { isAdminUser } from "@/lib/admin";

export default function MyCoursesPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(user?.primaryEmailAddress?.emailAddress, user?.publicMetadata);

  useEffect(() => {
    if (userId) {
      fetchCoursesAndAccess();
    }
  }, [userId]);

  const fetchCoursesAndAccess = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch courses — admins see all, regular users see only published
      const adminCheck = isAdminUser(user?.primaryEmailAddress?.emailAddress, user?.publicMetadata);
      let query = supabase
        .from('courses')
        .select('*, modules(order_index, lessons(video_url, order_index))')
        .order('created_at', { ascending: false });
      if (!adminCheck) query = query.eq('is_published', true);
      const { data: coursesData, error: coursesError } = await query;

      if (coursesError) throw coursesError;

      // Enrich each course with firstVideoId from first lesson
      const enriched = (coursesData || []).map((c: any) => {
        const sortedMods = (c.modules || []).sort((a: any, b: any) => a.order_index - b.order_index);
        const firstLesson = sortedMods[0]
          ? (sortedMods[0].lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)[0]
          : null;
        return { ...c, firstVideoId: firstLesson?.video_url || null, moduleCount: c.modules?.length || 0 };
      });

      // 2. Fetch user purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('user_purchases')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_type', 'course');

      if (purchasesError) throw purchasesError;

      const purchasedIds = purchasesData.map(p => p.product_id);
      
      setCourses(enriched);
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
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Workshop</h1>
        <p className="text-muted-foreground">Acesse seus treinamentos ou descubra novos conteúdos para evoluir sua arte.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando acervo...</div>
      ) : courses.length === 0 ? (
         <div className="text-center py-20 glass rounded-2xl border border-white/10">
            <Layers className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <h2 className="text-xl font-bold mb-2">Nenhum workshop disponível</h2>
            <p className="text-muted-foreground text-sm">O administrador ainda não publicou nenhum workshop.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const hasAccess = isAdmin || hasFullAccess || purchasedCourseIds.includes(course.id);
            const thumbSrc = course.thumbnail_url ||
              (course.firstVideoId
                ? `https://videodelivery.net/${course.firstVideoId}/thumbnails/thumbnail.jpg?time=3s&height=400`
                : null);

            return (
              <Link
                href={hasAccess ? `/dashboard/courses/${course.id}` : "#"}
                key={course.id}
                onClick={hasAccess ? undefined : (e) => handleLockedClick(e, course)}
              >
                <div className={`glass rounded-2xl border ${hasAccess ? 'border-white/5 hover:border-primary/40' : 'border-white/5 opacity-80'} overflow-hidden group cursor-pointer h-full flex flex-col hover:-translate-y-1 transition-all duration-300 relative`}>

                  {/* Thumbnail */}
                  <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={course.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${hasAccess ? 'opacity-70 group-hover:opacity-90' : 'opacity-30 grayscale'}`}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Layers className="w-10 h-10 text-white/10" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {/* Play / Lock overlay */}
                    {hasAccess ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl">
                          <PlayCircle className="w-7 h-7 text-black ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-white/50" />
                        </div>
                      </div>
                    )}

                    {/* Badge */}
                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider backdrop-blur-md border ${hasAccess ? 'bg-white/10 border-white/10 text-white' : 'bg-primary/20 border-primary/30 text-primary'}`}>
                      {hasAccess ? <><Clock className="w-3 h-3" /> Acessar</> : 'Bloqueado'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className={`font-bold text-base mb-1 leading-tight transition-colors line-clamp-2 ${hasAccess ? 'group-hover:text-primary' : 'text-white/60'}`}>
                      {course.title}
                    </h3>
                    <div className="text-xs text-muted-foreground mb-4">
                      {course.moduleCount} {course.moduleCount === 1 ? 'Módulo' : 'Módulos'}
                    </div>

                    {!hasAccess && (
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 text-primary text-sm font-bold bg-primary/10 py-2 rounded-xl group-hover:bg-primary group-hover:text-black transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                          <span>Desbloquear Workshop</span>
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
