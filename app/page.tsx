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
    <main className="min-h-screen w-full m-0 p-0 overflow-hidden bg-black">
      <iframe 
        src="/isabella.html" 
        className="w-full h-screen border-0"
        title="Landing Page"
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </main>
  );
}
