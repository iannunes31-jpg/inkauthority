"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "openLogin") {
        setIsLoginOpen(true);
      }
    };
    window.addEventListener("message", handleMessage);
    
    // Timer para garantir que o iframe carregou e mutar o vídeo
    const muteTimer = setInterval(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            // Garante que o vídeo toque nativamente sem scripts agressivos
            const vids = doc.querySelectorAll('video');
            vids.forEach(v => {
              if (!v.muted) {
                v.muted = true;
                v.play().catch(() => {});
              }
            });
          }
        } catch(e) {}
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(muteTimer);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-black to-[#050505]">
      {/* Efeito de Fundo enquanto o Iframe Carrega */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* Botão de Ferramentas (Fixo e centralizado no topo para não quebrar o menu nativo) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999]">
        <Link href="/tools">
          <Button className="bg-black/60 hover:bg-primary hover:text-black border border-white/10 backdrop-blur-md text-white font-black uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(0,0,0,0.8)] px-8 py-6 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Acessar Ferramentas
          </Button>
        </Link>
      </div>

      <iframe 
        src="/isabella.html" 
        className="w-full h-screen border-0 block relative z-10"
        title="Landing Page"
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}
