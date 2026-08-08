"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PlayCircle, Star, Shield, ArrowRight, Zap, Library, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Busca cursos publicados
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (coursesData) setCourses(coursesData);

      // Busca materiais da biblioteca (limite de 3 para vitrine)
      const { data: libraryData } = await supabase
        .from('library_resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (libraryData) setLibrary(libraryData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckout = (productName: string) => {
    alert(`Redirecionando para o checkout seguro de: ${productName}.`);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow">
             <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Ink Authority</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover:bg-white/5" onClick={() => setIsLoginOpen(true)}>
            Área de Membros
          </Button>
          <Button className="metallic-gradient text-black font-bold hidden sm:flex">
            Ver Produtos
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3 h-3" /> A Plataforma Definitiva
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            Eleve sua <span className="metallic-text">Arte</span><br />
            ao Nível Profissional
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Acesso imediato aos melhores cursos, ferramentas, brushes e contratos para tatuadores que desejam se destacar no mercado.
          </p>
        </motion.div>
      </section>

      {/* Cursos - Vitrine de Cross-sell */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4">Treinamentos Completos</h2>
          <p className="text-muted-foreground">Escolha o curso que vai transformar a sua técnica hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-black relative border-b border-white/10 overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <PlayCircle className="w-12 h-12 text-white/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest">
                  Curso
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-3 leading-tight">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1 line-clamp-3">
                  {course.description || "Treinamento completo focado na evolução técnica e teórica do tatuador."}
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Acesso imediato
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Suporte VIP (Tutor IA)
                  </div>
                </div>
                <Button 
                  onClick={() => handleCheckout(course.title)}
                  className="w-full metallic-gradient text-black font-bold py-6 text-lg rounded-xl hover:scale-105 transition-transform"
                >
                  Comprar Agora <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-3 text-center py-20 text-muted-foreground">
              Em breve novos cursos disponíveis.
            </div>
          )}
        </div>
      </section>

      {/* Biblioteca - Cross-sell */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/5 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4">Biblioteca Pro</h2>
            <p className="text-muted-foreground">Acelere seu fluxo de trabalho com materiais prontos.</p>
          </div>
          <Button onClick={() => handleCheckout("Acesso Completo à Biblioteca")} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
            Comprar Acesso Completo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {library.map((item) => (
            <div key={item.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors flex flex-col">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Arquivo {item.resource_type}</p>
              
              <Button 
                onClick={() => handleCheckout(item.title)}
                className="mt-auto w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Comprar Avulso
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© 2026 Ink Authority. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Desenvolvido para criadores e tatuadores profissionais.</p>
      </footer>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}
