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
    
    // Timer contínuo e ultra-resiliente para o botão
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

        // 2. Injeção Nativa do Botão TOOLS (em todos os menus: mobile e desktop)
        const allLinks = Array.from(doc.querySelectorAll('a'));
        
        // Substituir logo do Webflow pelo Sparkle
        // Substituir logo do Webflow pelo Sparkle
        let brand = doc.querySelector('.w-nav-brand');
        if (!brand) {
          // Fallback: tenta achar o link da home que tem uma imagem
          const homeLinks = Array.from(doc.querySelectorAll('a[href="/"], a[href="#"]'));
          brand = homeLinks.find(el => el.querySelector('img') || el.querySelector('svg')) as Element;
        }

        if (brand && !brand.getAttribute('data-logo-updated')) {
          brand.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:28px;height:28px;color:#f9f9f9;">
                <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
              </svg>
              <span style="font-weight:900;font-size:20px;letter-spacing:-1px;color:white;text-transform:uppercase;">Ink Authority</span>
            </div>
          `;
          brand.setAttribute('data-logo-updated', 'true');
        }

        // Aplica o tema Light no iframe de forma resiliente
        const currentTheme = localStorage.getItem("theme");
        let themeStyle = doc.getElementById('theme-style');
        
        if (currentTheme === "light") {
          if (!themeStyle) {
            themeStyle = doc.createElement('style');
            themeStyle.id = 'theme-style';
            doc.head.appendChild(themeStyle);
          }
          themeStyle.textContent = `
            html, body { 
              filter: invert(1) hue-rotate(180deg) brightness(1.2) !important; 
              background-color: #ffffff !important; 
            }
            img, video, iframe, [style*="background-image"], .w-background-video { 
              filter: invert(1) hue-rotate(180deg) !important; 
            }
          `;
        } else if (themeStyle) {
          themeStyle.textContent = '';
        }

        const cursosElements = allLinks.filter(el => (el.textContent || '').toUpperCase().includes('CURSOS') && !el.getAttribute('data-tools-injected'));
        
        if (cursosElements.length > 0) {
          cursosElements.forEach((cursosElement, index) => {
            const parent = cursosElement.parentNode;
            if (!parent) return;

            const newBtn = doc.createElement('a');
            newBtn.id = 'btn-tools-injetado-' + index;
            newBtn.textContent = 'TOOLS';
            newBtn.href = '/tools';
            newBtn.target = '_top';
            
            const computed = window.getComputedStyle(cursosElement);
            newBtn.style.color = computed.color || 'rgba(238, 238, 242, 0.66)';
            newBtn.style.fontSize = computed.fontSize || '11px';
            newBtn.style.fontFamily = computed.fontFamily || 'Jost, sans-serif';
            newBtn.style.fontWeight = computed.fontWeight || '300';
            newBtn.style.letterSpacing = computed.letterSpacing || '0.28em';
            newBtn.style.textTransform = 'uppercase';
            newBtn.style.textDecoration = 'none';
            newBtn.style.cursor = 'pointer';
            newBtn.style.marginLeft = '30px'; 
            newBtn.style.marginRight = '60px'; // Empurra tudo pra esquerda!
            newBtn.style.display = 'inline-block';
            
            newBtn.onmouseover = () => newBtn.style.color = '#ffffff';
            newBtn.onmouseout = () => newBtn.style.color = computed.color || 'rgba(238, 238, 242, 0.66)';
            
            parent.insertBefore(newBtn, cursosElement.nextSibling);
            cursosElement.setAttribute('data-tools-injected', 'true');
          });
          // Removido clearInterval para garantir que injete se o Webflow re-renderizar o menu
        }
      } catch(e) {}
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
