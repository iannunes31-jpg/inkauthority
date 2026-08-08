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
    
    // Timer para garantir que o iframe carregou
    const iframeTimer = setInterval(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc && doc.body) {
            
            // 1. Mutar vídeos
            const vids = doc.querySelectorAll('video');
            vids.forEach(v => {
              if (!v.muted) {
                v.muted = true;
                v.play().catch(() => {});
              }
            });

            // 2. Tornar fundo transparente
            if (!doc.getElementById('custom-bg-style')) {
              const style = doc.createElement('style');
              style.id = 'custom-bg-style';
              style.textContent = `
                html, body, section, div[style*="background:#08080a"], div[style*="background-color:#08080a"], div[style*="background: #08080a"] {
                  background-color: transparent !important;
                  background: transparent !important;
                }
              `;
              doc.head.appendChild(style);
            }
          }
        } catch(e) {}
      }
    }, 500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(iframeTimer);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-[#050505]">

      {/* Botão de Ferramentas (Fixo próximo ao menu nativo) */}
      <div className="fixed top-[32px] right-[350px] lg:right-[380px] z-[999999]">
        <Link href="/tools" className="text-white/80 hover:text-white font-bold text-[11px] lg:text-[13px] uppercase tracking-[0.1em] transition-colors">
          Ferramentas
        </Link>
      </div>
      
      {/* NOVO FUNDO DE ALTA QUALIDADE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradiente Base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] via-[#050505] to-black opacity-80" />
        
        {/* Malha/Grid Sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Luzes de Estúdio (Orbs) */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] right-[-20%] w-[50vw] h-[50vw] bg-primary/10 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-white/5 blur-[130px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
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
