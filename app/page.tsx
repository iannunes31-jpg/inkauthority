"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginView, setLoginView] = useState<"login" | "register">("login");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "openLogin") {
        setLoginView("login");
        setIsLoginOpen(true);
      }
    };
    window.addEventListener("message", handleMessage);

    // Oculta o nav original do Webflow e injeta tema
    const hideWebflowNav = setInterval(() => {
      const iframe = document.querySelector('iframe#landing-iframe') as HTMLIFrameElement;
      if (!iframe) return;
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || !doc.body) return;

        if (!doc.getElementById('ink-overrides')) {
          const s = doc.createElement('style');
          s.id = 'ink-overrides';
          s.textContent = `
            /* Esconde o nav original do Webflow */
            nav, .w-nav, [role="navigation"], header, .navbar, .nav-container, .navigation { display: none !important; }
            div[class*="nav"], div[class*="Nav"], div[class*="header"] { display: none !important; }
            /* Remove margem do topo que o Webflow adiciona */
            body { padding-top: 0 !important; margin-top: 0 !important; }
          `;
          doc.head.appendChild(s);
          
          // Adiciona listener para scroll
          iframe.contentWindow?.addEventListener('message', (e) => {
            if (e.data === 'scrollToCursos') {
              // Webflow usa IDs ou atributos para as seções
              const section = doc.getElementById('cursos') || doc.querySelector('[data-scroll="cursos"]') || doc.querySelector('.section-cursos');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              } else {
                // Fallback: rola um pouco para baixo
                iframe.contentWindow?.scrollTo({ top: 800, behavior: 'smooth' });
              }
            }
          });
        }

        // Aplica tema Light/Dark dentro do iframe
        const currentTheme = localStorage.getItem('theme');
        let themeStyle = doc.getElementById('ink-theme');
        if (!themeStyle) {
          themeStyle = doc.createElement('style');
          themeStyle.id = 'ink-theme';
          doc.head.appendChild(themeStyle);
        }
        if (currentTheme === 'light') {
          themeStyle.textContent = `
            html { filter: invert(1) hue-rotate(180deg); background: #fff !important; }
            img, video, iframe { filter: invert(1) hue-rotate(180deg); }
          `;
        } else {
          themeStyle.textContent = '';
        }
      } catch(e) {}
    }, 500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(hideWebflowNav);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-[#050505]">
      
      {/* FUNDO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] via-[#050505] to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-white/5 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] right-[-20%] w-[50vw] h-[50vw] bg-primary/10 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-white/5 blur-[130px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>



      {/* IFRAME — com paddingTop pra não ficar atrás do menu */}
      <iframe 
        id="landing-iframe"
        src="/isabela.html" 
        className="w-full border-0 block relative z-10"
        style={{ height: 'calc(100vh)', marginTop: 72 }}
        title="Landing Page"
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialView={loginView}
      />
    </main>
  );
}


