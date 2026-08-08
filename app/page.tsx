"use client";

import { useState, useEffect, useRef } from "react";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { PlayCircle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchProducts();

    // Evento de mensagem vindo do iframe caso tenha algum botão de login antigo
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "openLogin") {
        setIsLoginOpen(true);
      }
    };
    window.addEventListener("message", handleMessage);
    
    // Timer seguro para ajustar a altura do iframe UMA VEZ após carregamento
    // Isso evita o loop infinito de rolagem (ResizeObserver infinite loop)
    const adjustTimer = setTimeout(() => {
      if (iframeRef.current) {
        try {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc) {
            // Pegamos o offsetHeight que é mais estável
            const height = Math.max(
              doc.body.scrollHeight, 
              doc.documentElement.scrollHeight,
              doc.body.offsetHeight, 
              doc.documentElement.offsetHeight
            );
            if (height > 500) {
              iframeRef.current.style.height = `${height}px`;
            }
          }
        } catch(e) {}
      }
    }, 2500); // Aguarda 2.5s para garantir que os assets pesados carregaram

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(adjustTimer);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (coursesData) setCourses(coursesData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckout = (productName: string) => {
    alert(`Redirecionando para o checkout seguro de: ${productName}.`);
  };

  const scrollToCourses = () => {
    const el = document.getElementById('produtos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      
      {/* Novo Menu Superior (Substitui o menu do iframe) */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5 h-[80px] flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow">
             <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Ink Authority</span>
        </div>
        
        {/* Navegação Central */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-bold text-white/80 hover:text-primary transition-colors">
            HOME
          </button>
          <button onClick={scrollToCourses} className="text-sm font-bold text-white/80 hover:text-primary transition-colors">
            CURSOS
          </button>
          <Link href="/tools" className="text-sm font-bold text-white/80 hover:text-primary transition-colors">
            FERRAMENTAS
          </Link>
        </nav>

        {/* Botões da Direita */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover:bg-white/5 text-sm" onClick={() => setIsLoginOpen(true)}>
            Área de Membros
          </Button>
          <Button onClick={scrollToCourses} className="metallic-gradient text-black font-bold hidden sm:flex">
            Ver Produtos
          </Button>
        </div>
      </header>

      {/* Landing Page Original (Iframe com o Vídeo) */}
      <div className="w-full pt-[80px] relative">
        <iframe 
          ref={iframeRef}
          src="/isabella.html" 
          className="w-full min-h-screen border-0 block"
          title="Landing Page"
          scrolling="no"
        />
      </div>

      {/* Cursos - Vitrine de Cross-sell */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto relative z-10" id="produtos">
        <div className="mb-16 text-center">
          <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4">Treinamentos Completos</h2>
          <p className="text-muted-foreground">Escolha o curso que vai transformar a sua técnica hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors bg-white/[0.02]">
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

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center text-sm text-muted-foreground bg-black relative z-10">
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
