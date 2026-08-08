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
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-black">
      {/* Botão de Ferramentas (Fixo sobre o iframe) */}
      <div className="absolute top-8 right-8 lg:right-32 z-50">
        <Link href="/tools">
          <Button className="bg-black/40 hover:bg-primary hover:text-black border border-white/20 backdrop-blur-md text-white font-bold uppercase tracking-widest transition-all shadow-xl shadow-black/50 px-6 py-5 rounded-full">
            Acessar Ferramentas
          </Button>
        </Link>
      </div>

      <iframe 
        src="/isabella.html" 
        className="w-full h-screen border-0 block"
        title="Landing Page"
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}
