"use client";

import { motion } from "motion/react";
import { PlayCircle, Clock, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyCoursesPage() {
  const purchasedCourses = [
    {
      id: 1,
      title: "Marketing e Posicionamento PRO",
      thumbnail: "/isabella_poster.jpg",
      progress: 65,
      totalModules: 8,
      completedModules: 5,
      lastAccessed: "Há 2 dias"
    },
    // Adicione mais cursos aqui futuramente
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Meus Cursos</h1>
        <p className="text-muted-foreground">Continue de onde parou e acompanhe sua evolução.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchasedCourses.map((course) => (
          <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass rounded-2xl border border-white/5 overflow-hidden group cursor-pointer h-full flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
                
                {/* Etiqueta de Status */}
                {course.progress === 100 ? (
                  <div className="absolute top-3 right-3 bg-primary text-black text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
                    <Award className="w-3 h-3" /> Concluído
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-white/10">
                    <Clock className="w-3 h-3" /> Em andamento
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-2 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                
                <div className="text-xs text-muted-foreground mb-4">
                  {course.completedModules} de {course.totalModules} módulos concluídos
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-white/50 mb-1">
                    <span>Progresso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full relative"
                      style={{ width: `${course.progress}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Card de Adicionar Mais Cursos */}
        <Link href="/courses">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass rounded-2xl border border-white/5 border-dashed overflow-hidden group cursor-pointer h-full min-h-[300px] flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-all p-6"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <span className="text-2xl text-white/50 group-hover:text-primary transition-colors">+</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Explorar Novos Cursos</h3>
            <p className="text-xs text-muted-foreground">Descubra novas especializações e suba de nível no seu estúdio.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
