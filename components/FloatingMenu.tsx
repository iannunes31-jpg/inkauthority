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
    // Carrega o Google Translate
    const addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    document.body.appendChild(addScript);
    
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "pt", autoDisplay: false },
        "google_translate_element"
      );
    };

    // Aplica o tema salvo
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
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
      document.body.style.backgroundColor = "#000000";
      document.body.style.color = "#ffffff";
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const changeLanguage = (langCode: string) => {
    const selectField = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectField) {
      selectField.value = langCode;
      selectField.dispatchEvent(new Event("change"));
    }
    setIsTranslateOpen(false);
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 notranslate">
        {/* Dropdown de Idiomas */}
        {isTranslateOpen && (
          <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-1 mb-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
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
          {/* Botão de Tradução */}
          <button
            onClick={() => setIsTranslateOpen(!isTranslateOpen)}
            className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50"
            title="Mudar Idioma"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Botão de Tema */}
          <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg hover:scale-105 active:scale-95 bg-black/50"
            title="Alternar Modo Claro/Escuro"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Oculta os banners nativos do Google Translate */
        .skiptranslate { display: none !important; }
        body { top: 0px !important; }
      `}} />
    </>
  );
}
