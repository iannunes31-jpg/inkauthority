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
    
    // Timer contínuo e resiliente para injetar o botão nativamente
    const injectInterval = setInterval(() => {
      const iframe = document.querySelector('iframe');
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || !doc.body) return;

        // 1. Tornar fundo transparente
        if (!doc.getElementById('custom-bg-style')) {
          const style = doc.createElement('style');
          style.id = 'custom-bg-style';
          style.textContent = `
            html, body, section, div[style*="background:#08080a"], div[style*="background-color:#08080a"] {
              background-color: transparent !important;
              background: transparent !important;
            }
          `;
          doc.head.appendChild(style);
        }

        // 2. Injeção Nativa do Botão FERRAMENTAS
        if (!doc.getElementById('btn-ferramentas-injetado')) {
          // Pega todos os links da página
          const allLinks = Array.from(doc.querySelectorAll('a, div, span'));
          
          // Acha o que contém "CURSOS" (case-insensitive, tolerando espaços)
          const cursosElement = allLinks.find(el => {
            const text = el.textContent || '';
            return text.toUpperCase().includes('CURSOS') && el.children.length === 0;
          });

          if (cursosElement && cursosElement.parentNode) {
            const parent = cursosElement.parentNode;
            
            const newBtn = doc.createElement('a');
            newBtn.id = 'btn-ferramentas-injetado';
            newBtn.textContent = 'FERRAMENTAS';
            newBtn.href = '/tools'; // Navegação direta
            newBtn.target = '_top'; // Força a navegação na janela principal
            
            // Copia o visual original
            const computed = window.getComputedStyle(cursosElement);
            newBtn.style.color = computed.color || 'rgba(238, 238, 242, 0.66)';
            newBtn.style.fontSize = computed.fontSize || '11px';
            newBtn.style.fontFamily = computed.fontFamily || 'Jost, sans-serif';
            newBtn.style.fontWeight = computed.fontWeight || '300';
            newBtn.style.letterSpacing = computed.letterSpacing || '0.28em';
            newBtn.style.textTransform = 'uppercase';
            newBtn.style.textDecoration = 'none';
            newBtn.style.cursor = 'pointer';
            newBtn.style.marginLeft = '30px'; // Espaço garantido
            
            newBtn.onmouseover = () => newBtn.style.color = '#ffffff';
            newBtn.onmouseout = () => newBtn.style.color = computed.color || 'rgba(238, 238, 242, 0.66)';
            
            // Insere DEPOIS do CURSOS
            parent.insertBefore(newBtn, cursosElement.nextSibling);
            
            // O Flexbox do Webflow agora vai gerenciar o espaço perfeitamente!
            clearInterval(injectInterval);
          }
        }
      } catch(e) {
        console.error("Iframe injection error:", e);
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(injectInterval);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-[#050505]">
      
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
