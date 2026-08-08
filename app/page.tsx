"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";

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
            // Garante que o vídeo toque
            const vids = doc.querySelectorAll('video');
            vids.forEach(v => {
              if (!v.muted) {
                v.muted = true;
                v.play().catch(() => {});
              }
            });

            // Injeta o link FERRAMENTAS no menu superior (depois de CURSOS)
            if (!doc.querySelector('#injected-ferramentas')) {
              const links = Array.from(doc.querySelectorAll('a'));
              const cursosLink = links.find(a => a.textContent && a.textContent.toUpperCase().includes('CURSOS'));
              
              if (cursosLink && cursosLink.parentElement) {
                const ferramentasLink = doc.createElement('a');
                ferramentasLink.id = 'injected-ferramentas';
                ferramentasLink.href = '/tools';
                ferramentasLink.textContent = 'FERRAMENTAS';
                ferramentasLink.className = cursosLink.className; 
                // Dá um espaço à esquerda para não ficar colado
                ferramentasLink.style.marginLeft = '20px'; 
                ferramentasLink.target = '_parent'; // Abre na janela principal
                
                // Insere logo depois do botão CURSOS
                cursosLink.parentElement.insertBefore(ferramentasLink, cursosLink.nextSibling);
              }
            }
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
    <main className="min-h-screen w-full m-0 p-0 overflow-hidden bg-black">
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
