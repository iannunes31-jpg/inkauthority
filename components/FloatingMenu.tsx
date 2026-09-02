"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Globe } from "lucide-react";

// Master dictionary for top Navbar and Parent DOM elements
const masterDict: Record<string, Record<string, string>> = {
  en: {
    "HOME": "HOME",
    "CURSOS": "COURSES",
    "TOOLS": "TOOLS",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Sign In",
    "Acesso Antecipado": "Early Access",
    "Acesso antecipado": "Early Access",
    "Painel do Aluno": "Student Dashboard",
    "Painel Admin": "Admin Panel",
    "Sair da conta": "Sign Out",
    "Pesquisar...": "Search...",
    "Minha Conta": "My Account"
  },
  es: {
    "HOME": "INICIO",
    "CURSOS": "CURSOS",
    "TOOLS": "HERRAMIENTAS",
    "DASHBOARD": "PANEL",
    "Entrar": "Iniciar Sesión",
    "Acesso Antecipado": "Acceso Anticipado",
    "Acesso antecipado": "Acceso anticipado",
    "Painel do Aluno": "Panel del Alumno",
    "Painel Admin": "Panel de Admin",
    "Sair da conta": "Cerrar sesión",
    "Pesquisar...": "Buscar...",
    "Minha Conta": "Mi Cuenta"
  },
  fr: {
    "HOME": "ACCUEIL",
    "CURSOS": "COURS",
    "TOOLS": "OUTILS",
    "DASHBOARD": "TABLEAU DE BORD",
    "Entrar": "Se Connecter",
    "Acesso Antecipado": "Accès Anticipé",
    "Acesso antecipado": "Accès anticipé",
    "Painel do Aluno": "Espace Étudiant",
    "Painel Admin": "Panneau Admin",
    "Sair da conta": "Se Déconnecter",
    "Pesquisar...": "Rechercher...",
    "Minha Conta": "Mon Compte"
  },
  de: {
    "HOME": "START",
    "CURSOS": "KURSE",
    "TOOLS": "WERKZEUGE",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Anmelden",
    "Acesso Antecipado": "Frühzeitiger Zugang",
    "Acesso antecipado": "Frühzeitiger Zugang",
    "Painel do Aluno": "Studenten-Dashboard",
    "Painel Admin": "Admin-Bereich",
    "Sair da conta": "Abmelden",
    "Pesquisar...": "Suchen...",
    "Minha Conta": "Mein Konto"
  },
  it: {
    "HOME": "HOME",
    "CURSOS": "CORSI",
    "TOOLS": "STRUMENTI",
    "DASHBOARD": "DASHBOARD",
    "Entrar": "Accedi",
    "Acesso Antecipado": "Accesso Anticipado",
    "Acesso antecipado": "Accesso anticipado",
    "Painel do Aluno": "Pannello Studente",
    "Painel Admin": "Pannello Admin",
    "Sair da conta": "Disconnetti",
    "Pesquisar...": "Cerca...",
    "Minha Conta": "Il Mio Account"
  },
  ja: {
    "HOME": "ホーム",
    "CURSOS": "コース",
    "TOOLS": "ツール",
    "DASHBOARD": "ダッシュボード",
    "Entrar": "ログイン",
    "Acesso Antecipado": "早期アクセス",
    "Acesso antecipado": "早期アクセス",
    "Painel do Aluno": "受講生パネル",
    "Painel Admin": "管理者パネル",
    "Sair da conta": "ログアウト",
    "Pesquisar...": "検索...",
    "Minha Conta": "マイアカウント"
  },
  ru: {
    "HOME": "ГЛАВНАЯ",
    "CURSOS": "КУРСЫ",
    "TOOLS": "ИНСТРУМЕНТЫ",
    "DASHBOARD": "ДАШБОРД",
    "Entrar": "Войти",
    "Acesso Antecipado": "Ранний Доступ",
    "Acesso antecipado": "Ранний доступ",
    "Painel do Aluno": "Кабинет ученика",
    "Painel Admin": "Панель админа",
    "Sair da conta": "Выйти",
    "Pesquisar...": "Поиск...",
    "Minha Conta": "Мой аккаунт"
  }
};

const reverseMap: Record<string, string> = {};
for (const lang in masterDict) {
  for (const pt in masterDict[lang]) {
    const val = masterDict[lang][pt];
    if (val && val !== pt) {
      reverseMap[val.toLowerCase()] = pt;
    }
  }
}

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

  const translateParentDOM = (targetLang: string) => {
    if (typeof document === "undefined") return;
    const walk = (node: Node) => {
      if (node.nodeType === 3) {
        const val = node.nodeValue;
        if (!val || !val.trim()) return;

        const anyNode = node as any;
        if (anyNode._parentOrig === undefined) {
          const norm = val.trim();
          const pt = reverseMap[norm.toLowerCase()];
          anyNode._parentOrig = pt ? val.replace(norm, pt) : val;
        }

        const orig = anyNode._parentOrig;
        let res = orig;
        if (targetLang && targetLang !== "pt" && masterDict[targetLang]) {
          const norm = orig.trim();
          if (masterDict[targetLang][norm]) {
            res = orig.replace(norm, masterDict[targetLang][norm]);
          }
        }

        if (res !== node.nodeValue) {
          node.nodeValue = res;
        }
      } else if (node.nodeType === 1) {
        const el = node as HTMLElement;
        if (el.tagName !== "SCRIPT" && el.tagName !== "STYLE" && !el.classList.contains("notranslate")) {
          for (let i = 0; i < node.childNodes.length; i++) {
            walk(node.childNodes[i]);
          }
        }
      }
    };

    const nav = document.querySelector("nav");
    if (nav) walk(nav);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const savedLang = localStorage.getItem("lang") || "pt";
    translateParentDOM(savedLang);
    syncLang(savedLang);

    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      const currentLang = localStorage.getItem("lang") || "pt";
      translateParentDOM(currentLang);
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: currentTheme }, '*');
          iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: currentLang }, '*');
        }
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    if (newTheme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
      document.body.style.backgroundColor = "#f6f7f9";
      document.body.style.color = "#111116";
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      document.body.style.backgroundColor = "#050505";
      document.body.style.color = "#ffffff";
    }

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: newTheme }, '*');
      }
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const syncLang = (langCode: string) => {
    translateParentDOM(langCode);
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_LANG', lang: langCode }, '*');
      }
    });
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
