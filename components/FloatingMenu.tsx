"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";

export function FloatingMenu() {
  const [theme, setTheme] = useState("dark");
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  const languages = [
    { code: "pt", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "ja", name: "日本語" },
    { code: "ru", name: "Русский" }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const savedLang = localStorage.getItem("lang") || "pt";
    syncLang(savedLang);

    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      const currentLang = localStorage.getItem("lang") || "pt";
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: currentTheme }, '*');
        iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: currentLang }, '*');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    
    if (newTheme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111116";
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

  const syncLang = (langCode: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: langCode }, '*');
    }
  };

  const changeLanguage = (langCode: string) => {
    localStorage.setItem("lang", langCode);
    syncLang(langCode);
    setIsTranslateOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 notranslate items-start">
      {isTranslateOpen && (
        <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-1 mb-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-white min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="text-left px-4 py-2 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={() => setIsTranslateOpen(!isTranslateOpen)}
          className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50 text-white"
          title="Mudar Idioma"
        >
          <Globe className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50 text-white"
          title="Alternar Modo Claro/Escuro"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
        </button>
      </div>
    </div>
  );
}
