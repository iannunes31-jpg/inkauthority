"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function FloatingMenu() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Initial theme sync with iframe
    setTimeout(() => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: savedTheme }, '*');
      }
    }, 1000);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    
    if (newTheme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      document.body.style.backgroundColor = "#050505";
      document.body.style.color = "#ffffff";
    }

    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: newTheme }, '*');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 notranslate items-start">
        <div className="flex gap-3">
          <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50 text-white"
            title="Alternar Modo Claro/Escuro"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .skiptranslate { display: none !important; }
        body { top: 0px !important; }
      `}} />
    </>
  );
}
