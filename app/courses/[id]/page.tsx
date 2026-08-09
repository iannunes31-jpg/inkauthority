"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { 
  Play, Pause, Volume2, Maximize, Settings, 
  ChevronLeft, CheckCircle, Circle, FileText, 
  Download, MessageSquare, Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function CoursePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"conteudo" | "materiais" | "anotacoes">("conteudo");
  const [activeLesson, setActiveLesson] = useState(2); // Example active lesson

  const modules = [
    {
      id: 1,
      title: "Módulo 1: Fundamentos de Marketing",
      lessons: [
        { id: 1, title: "O que é Posicionamento High-Ticket", duration: "15:20", completed: true },
        { id: 2, title: "Definindo seu Cliente Ideal", duration: "22:45", completed: false },
        { id: 3, title: "Construindo sua Marca", duration: "18:10", completed: false },
      ]
    },
    {
      id: 2,
      title: "Módulo 2: Instagram para Tatuadores",
      lessons: [
        { id: 4, title: "Estratégia de Conteúdo", duration: "25:30", completed: false },
        { id: 5, title: "Fotografia e Edição", duration: "30:15", completed: false },
        { id: 6, title: "Atração de Clientes no Direct", duration: "28:40", completed: false },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      {/* Top Bar for Player Mode */}
      <div className="h-16 border-b border-white/5 glass flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-sm tracking-tight">Marketing & Posicionamento: O Guia Completo</h1>
            <p className="text-[11px] text-muted-foreground font-light uppercase tracking-wider">Definindo seu Cliente Ideal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex rounded-full text-[10px] uppercase font-bold tracking-widest border-white/10 hover:bg-white/5">
            <CheckCircle className="w-3 h-3 mr-2" />
            Mark as Done
          </Button>
          <Button size="sm" className="rounded-full px-6 text-[10px] uppercase font-bold tracking-widest">
            Next Lesson
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area (Video) */}
        <div className="flex-1 flex flex-col relative bg-black">
          {/* Mock Video Player */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/tattoo_video/1920/1080" 
              alt="Video frame" 
              fill 
              className="object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            
            {/* Play Button Overlay */}
            <button 
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/50 text-white hover:scale-110 transition-transform">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-2" />}
              </div>
            </button>

            {/* Video Controls (Mock) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative">
                <div className="absolute left-0 top-0 h-full bg-primary rounded-full w-1/3 neon-glow" />
                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-primary"><Play className="w-5 h-5" /></button>
                  <button className="text-white hover:text-primary"><Volume2 className="w-5 h-5" /></button>
                  <span className="text-xs font-medium text-white/80">07:23 / 22:45</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-white/80 hover:text-white text-xs font-bold">1.5x</button>
                  <button className="text-white hover:text-primary"><Settings className="w-5 h-5" /></button>
                  <button className="text-white hover:text-primary"><Maximize className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata underneath */}
          <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-background">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tighter">Definindo seu Cliente Ideal</h2>
            
            <div className="flex items-center gap-6 pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image src="https://picsum.photos/seed/artist/100/100" alt="Isabela Badini" fill referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Isabela Badini</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Master Instructor</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Star className="w-3 h-3 text-primary" />
                4.9 Rating
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
              <p>Nesta aula fundamental, vamos explorar a importância do posicionamento para atrair clientes high-ticket. Aprenderemos como identificar seu público alvo e como comunicar o valor da sua arte.</p>
              <p>Você entenderá a diferença entre ser apenas mais um tatuador e se tornar uma autoridade no seu nicho, justificando orçamentos maiores.</p>
            </div>
          </div>
        </div>

        {/* Sidebar / Tabs Area */}
        <div className="w-full lg:w-96 border-l border-white/5 glass flex flex-col h-[calc(100vh-4rem)]">
          {/* Tabs */}
          <div className="flex items-center border-b border-white/5 px-2 pt-2">
            {[
              { id: "conteudo", label: "Conteúdo" },
              { id: "materiais", label: "Materiais" },
              { id: "anotacoes", label: "Anotações" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary neon-glow"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === "conteudo" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">
                        {module.title}
                      </h4>
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson.id)}
                            className={cn(
                              "w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-300",
                              activeLesson === lesson.id 
                                ? "bg-white/5 border border-white/10" 
                                : "hover:bg-white/5 border border-transparent"
                            )}
                          >
                            <div className="mt-0.5">
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "text-[13px] font-medium leading-tight mb-1",
                                activeLesson === lesson.id ? "text-white" : "text-muted-foreground"
                              )}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center text-[10px] text-muted-foreground font-mono">
                                <Play className="w-3 h-3 mr-1" /> {lesson.duration}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "materiais" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground px-2 mb-4">Arquivos disponíveis para esta aula:</p>
                  
                  {[
                    { name: "Guia de Posicionamento.pdf", size: "2.4 MB" },
                    { name: "Templates de Bio do Instagram.pdf", size: "5.1 MB" },
                    { name: "Exercício Prático de Precificação.pdf", size: "1.2 MB" }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/10">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
