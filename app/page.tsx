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
            nav, .w-nav, [role="navigation"], header { display: none !important; }
            /* Remove margem do topo que o Webflow adiciona */
            body { padding-top: 0 !important; margin-top: 0 !important; }
          `;
          doc.head.appendChild(s);
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

      {/* OVERLAY DO MENU — fica por cima do iframe, substitui o nav do Webflow */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
        style={{ height: '72px', background: 'rgba(8,8,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* LOGO */}
        <a href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 28, height: 28, color: '#f9f9f9' }}>
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px', color: 'white', textTransform: 'uppercase' }}>Ink Authority</span>
        </a>

        {/* LINKS DO MEIO */}
        <div className="flex items-center gap-8">
          <a href="/" style={navLinkStyle}>HOME</a>
          <a href="/#cursos" style={navLinkStyle}>CURSOS</a>
          <a href="/tools" style={navLinkStyle}>TOOLS</a>
        </div>

        {/* BOTÕES DA DIREITA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoginOpen(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(238,238,242,0.7)', fontSize: 13, fontWeight: 300, letterSpacing: '0.1em', cursor: 'pointer', padding: '8px 16px' }}
          >
            Entrar
          </button>
          <a
            href="https://pay.hotmart.com/ink-authority"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'white', color: 'black', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', padding: '10px 22px', borderRadius: 9999, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Matricule-se
          </a>
        </div>
      </div>

      {/* IFRAME — com paddingTop pra não ficar atrás do menu */}
      <iframe 
        id="landing-iframe"
        src="/isabella.html" 
        className="w-full border-0 block relative z-10"
        style={{ height: 'calc(100vh)', marginTop: 72 }}
        title="Landing Page"
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: 'rgba(238, 238, 242, 0.7)',
  fontSize: 12,
  fontWeight: 300,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'color 0.2s',
};
