"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PlayCircle, BookOpen, Compass, ChevronRight, Radio, Users, Bot, Download, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";

// Quick-access cards for every area of the platform, shown on the
// dashboard home so a new user (with nothing "in progress" yet) still
// sees everything that's available instead of an empty page.
const platformAreas = [
  { name: "Ao Vivo", path: "/dashboard/lives", icon: Radio, description: "Assista transmissões e mentorias ao vivo com a comunidade." },
  { name: "Comunidade", path: "/dashboard/community", icon: Users, description: "Compartilhe resultados e conecte-se com outros artistas." },
  { name: "Especialistas", path: "/dashboard/tools", icon: Bot, description: "Tutor IA e assistente de WhatsApp para automatizar seu estúdio." },
  { name: "Minhas Matérias", path: "/dashboard/courses", icon: Compass, description: "Explore as matérias disponíveis e continue seus estudos." },
  { name: "Biblioteca", path: "/dashboard/library", icon: Download, description: "Baixe materiais, e-books e guias exclusivos." },
  { name: "Meu Perfil", path: "/dashboard/profile", icon: User, description: "Gerencie sua conta e informações de segurança." },
];

export default function Dashboard() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const { data: purchases, error: purchasesErr } = await supabase
        .from('user_purchases')
        .select('product_id')
        .eq('user_id', userId)
        .eq('product_type', 'course');

      if (!purchasesErr && purchases && purchases.length > 0) {
        const courseIds = purchases.map(p => p.product_id);
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        setInProgressCourses(coursesData || []);
      } else {
        setInProgressCourses([]);
      }
    } catch (err) {
      console.error("Erro ao carregar progresso do aluno:", err);
      setInProgressCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const studentName = user?.firstName || "Aluno";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter">
          Bem-vindo de volta, {studentName}.
        </h1>
        <p className="text-muted-foreground font-light">
          Acompanhe seu progresso de aprendizado na Ink Authority.
        </p>
      </div>

      {/* Seção Meu Aprendizado (Dinamico) */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Meu Aprendizado em Andamento
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground animate-pulse glass rounded-2xl">
            Carregando seu progresso...
          </div>
        ) : inProgressCourses.length === 0 ? (
          <div className="glass p-10 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum curso em andamento</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6 font-light">
              Seu progresso de estudo aparecerá aqui conforme você acessar e concluir as aulas das matérias disponíveis.
            </p>
            <Link href="/dashboard/courses">
              <Button size="lg" className="rounded-full font-bold px-8 bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                Explorar Matérias Disponíveis
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map((course, i) => (
              <motion.div 
                key={course.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button size="icon" className="rounded-full w-12 h-12 bg-cyan-400 text-black hover:bg-cyan-300 shadow-lg">
                        <PlayCircle className="w-6 h-6 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-[12px] text-muted-foreground line-clamp-2 mb-4 font-light">
                      {course.description || "Curso da metodologia Ink Authority."}
                    </p>
                  </div>

                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button size="sm" className="w-full rounded-xl bg-white/5 hover:bg-cyan-400 hover:text-black transition-colors font-bold text-xs">
                      Continuar Estudando <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Explorar a Plataforma -- acesso rápido a tudo que existe no app */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Explorar a Plataforma
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformAreas.map((area, i) => (
            <Link key={area.path} href={area.path}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300 h-full flex flex-col group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                    <area.icon className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
                </div>
                <h3 className="font-bold text-lg mb-1">{area.name}</h3>
                <p className="text-[13px] text-muted-foreground font-light leading-relaxed">
                  {area.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
