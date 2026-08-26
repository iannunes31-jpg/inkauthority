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
    // Carrega o Google Translate na janela principal
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

    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const setupIframe = () => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const doc = iframe.contentDocument;
        if (!doc) return;
        
        if (doc.getElementById('google_translate_element_iframe')) return;

        applyTheme(savedTheme);
        
        const tDiv = doc.createElement('div');
        tDiv.id = "google_translate_element_iframe";
        tDiv.style.display = "none";
        doc.body.appendChild(tDiv);

        const s1 = doc.createElement('script');
        s1.innerHTML = `
            window.googleTranslateElementInit = function() {
                new google.translate.TranslateElement(
                    { pageLanguage: "pt", autoDisplay: false },
                    "google_translate_element_iframe"
                );
            }
        `;
        doc.head.appendChild(s1);

        const s2 = doc.createElement('script');
        s2.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        doc.head.appendChild(s2);

        const style = doc.createElement('style');
        style.innerHTML = `
            .skiptranslate { display: none !important; }
            body { top: 0px !important; }
            html.light body { filter: invert(1) hue-rotate(180deg) contrast(0.95); background-color: #f7f7f7 !important; }
            html.light img, html.light video, html.light iframe { filter: invert(1) hue-rotate(180deg) !important; }
        `;
        doc.head.appendChild(style);
      }
    };

    const iframe = document.querySelector('iframe');
    if (iframe) {
        iframe.addEventListener('load', setupIframe);
        // Em caso de o iframe já ter carregado rápido
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            setupIframe();
        }
    }
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
    if (iframe && iframe.contentDocument) {
        const iHtml = iframe.contentDocument.documentElement;
        if (newTheme === "light") {
            iHtml.classList.remove("dark");
            iHtml.classList.add("light");
        } else {
            iHtml.classList.remove("light");
            iHtml.classList.add("dark");
        }
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
    
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
        const iSelect = iframe.contentDocument.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (iSelect) {
            iSelect.value = langCode;
            iSelect.dispatchEvent(new Event("change"));
        }
    }
    
    setIsTranslateOpen(false);
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 notranslate items-start">
        {isTranslateOpen && (
          <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col gap-1 mb-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 text-white">
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
      
      <style dangerouslySetInnerHTML={{__html: `
        .skiptranslate { display: none !important; }
        body { top: 0px !important; }
      `}} />
    </>
  );
}
