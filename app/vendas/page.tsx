"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Bot, Megaphone, Contrast, Grid3x3, MessageCircle,
  CheckCircle, ArrowRight, Star, ChevronDown,
  Users, BarChart2, Search, Instagram, Music2, PenLine,
  Zap, Globe, Sun, Moon, Play, BookOpen, TrendingUp,
  Shield, Clock, Award, Sparkles, X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { LoginModal } from "@/components/LoginModal";
import { Stream } from "@cloudflare/stream-react";
import { cn } from "@/lib/utils";

// ─────────── Translations ───────────
const T: Record<string, Record<string, string>> = {
  pt: {
    nav_what: "O Que É",
    nav_tools: "Ferramentas",
    nav_course: "Workshop",
    nav_pricing: "Preços",
    nav_cta: "Começar Agora",
    hero_tag: "Plataforma Exclusiva Para Tatuadores",
    hero_h1a: "Transforme Seu",
    hero_h1b: "Talento",
    hero_h1c: "em Negócio",
    hero_sub: "A única plataforma que une workshop de marketing, tutoria com IA e ferramentas de criação — tudo pensado para tatuadores que querem faturar mais.",
    hero_cta: "Ver Planos e Preços",
    hero_cta2: "Conhecer a Plataforma",
    stat_artists: "Tatuadores Ativos",
    stat_countries: "Países",
    stat_tools: "Ferramentas de IA",
    stat_rating: "Avaliação Média",
    what_tag: "O Que é a Ink Authority",
    what_title: "Não é só um workshop. É uma plataforma completa.",
    what_desc: "A Ink Authority reúne tudo que um tatuador profissional precisa para crescer: um workshop de marketing e posicionamento, tutores com inteligência artificial, agentes de anúncios, gerador de decalque com IA e muito mais.",
    tools_tag: "Ferramentas",
    tools_title: "Tudo que você precisa para crescer",
    course_tag: "Workshop Exclusivo",
    course_title: "Marketing & Posicionamento para Tatuadores",
    course_desc: "Aprenda os segredos exatos para se posicionar como autoridade no mercado, atrair clientes que pagam bem e transformar sua arte num negócio lucrativo.",
    course_includes: "O que está incluído",
    course_price_label: "Acesso Vitalício",
    course_price: "R$ 997",
    course_cta: "Garantir Vaga no Workshop",
    course_f1: "Posicionamento e autoridade de marca",
    course_f2: "Estruturação das redes sociais",
    course_f3: "Criação de conteúdo que converte",
    course_f4: "Técnicas de vendas e conversão",
    course_f5: "Tráfego pago do zero ao avançado",
    course_f6: "Comunidade exclusiva de tatuadores",
    course_f7: "Análise de perfil gratuita (primeiros 20)",
    premium_tag: "Especialistas IA · R$ 97/mês",
    premium_title: "Inteligência Artificial para o seu Estúdio",
    premium_sub: "7 ferramentas em um só plano. Cancele quando quiser.",
    tutor_title: "Tutor IA Especialista",
    tutor_desc: "Seu mentor particular disponível 24h. Tire dúvidas técnicas, receba sugestões de agulhas, pigmentos e planejamento de sessão em tempo real.",
    ads_title: "Central de Anúncios",
    ads_desc: "6 agentes de IA especializados em marketing para tatuadores. Google Ads, Meta Ads, TikTok, análise de campanhas e criação de conteúdo.",
    stencil_title: "Gerador de Decalque com IA",
    stencil_desc: "Transforme fotos ou desenhos em traçados profissionais prontos para imprimir. Powered by Gemini 2.5 Flash.",
    split_title: "Dividir Folhas para Impressão",
    split_desc: "Divida projetos grandes em folhas A4 para imprimir e montar — até 10 folhas, escala personalizada.",
    wa_title: "Assistente WhatsApp",
    wa_desc: "IA que atende seus clientes no WhatsApp automaticamente. Orçamentos, agendamentos e triagem 24h por dia.",
    wa_price: "R$ 357/mês",
    agents_tag: "Central de Anúncios",
    agents_title: "6 Agentes de Marketing com IA",
    agents_sub: "Especialistas em atrair clientes para o seu estúdio nas principais plataformas digitais.",
    pricing_tag: "Planos",
    pricing_title: "Escolha seu nível",
    pricing_free: "Gratuito",
    pricing_free_desc: "Para começar",
    pricing_prem: "Premium",
    pricing_prem_desc: "Para crescer rápido",
    pricing_course: "Workshop + Premium",
    pricing_course_desc: "Pacote completo",
    pricing_mo: "/mês",
    pricing_life: "vitalício",
    pricing_cta_free: "Criar Conta Grátis",
    pricing_cta_prem: "Assinar Premium",
    pricing_cta_pack: "Garantir Pacote Completo",
    faq_tag: "Dúvidas Frequentes",
    faq_title: "Respostas rápidas",
    final_title: "Pronto para transformar seu negócio?",
    final_sub: "Mais de 1.200 tatuadores já usam a Ink Authority para crescer. Seja o próximo.",
    final_cta: "Começar Agora",
    footer_rights: "Todos os direitos reservados.",
    footer_made: "Desenvolvido para tatuadores profissionais.",
  },
  en: {
    nav_what: "What Is It",
    nav_tools: "Tools",
    nav_course: "Course",
    nav_pricing: "Pricing",
    nav_cta: "Get Started",
    hero_tag: "Exclusive Platform For Tattoo Artists",
    hero_h1a: "Turn Your",
    hero_h1b: "Talent",
    hero_h1c: "into Business",
    hero_sub: "The only platform that combines a marketing course, AI tutoring, and creation tools — all built for tattoo artists who want to earn more.",
    hero_cta: "See Plans & Pricing",
    hero_cta2: "Explore the Platform",
    stat_artists: "Active Artists",
    stat_countries: "Countries",
    stat_tools: "AI Tools",
    stat_rating: "Average Rating",
    what_tag: "What is Ink Authority",
    what_title: "Not just a course. A complete platform.",
    what_desc: "Ink Authority brings together everything a professional tattoo artist needs to grow: a marketing and positioning course, AI tutors, ad agents, an AI stencil generator, and much more.",
    tools_tag: "Tools",
    tools_title: "Everything you need to grow",
    course_tag: "Exclusive Course",
    course_title: "Marketing & Positioning for Tattoo Artists",
    course_desc: "Learn the exact secrets to position yourself as a market authority, attract clients who pay well, and turn your art into a profitable business.",
    course_includes: "What's included",
    course_price_label: "Lifetime Access",
    course_price: "R$ 997",
    course_cta: "Secure My Spot",
    course_f1: "Brand positioning and authority",
    course_f2: "Social media structuring",
    course_f3: "Converting content creation",
    course_f4: "Sales and conversion techniques",
    course_f5: "Paid traffic from zero to advanced",
    course_f6: "Exclusive tattoo artist community",
    course_f7: "Free profile analysis (first 20)",
    premium_tag: "AI Specialists · R$ 97/mo",
    premium_title: "Artificial Intelligence for Your Studio",
    premium_sub: "7 tools in one plan. Cancel anytime.",
    tutor_title: "Specialist AI Tutor",
    tutor_desc: "Your private mentor available 24/7. Get technical answers, needle and pigment suggestions, and session planning in real time.",
    ads_title: "Ads Center",
    ads_desc: "6 AI agents specialized in marketing for tattoo artists. Google Ads, Meta Ads, TikTok, campaign analysis, and content creation.",
    stencil_title: "AI Stencil Generator",
    stencil_desc: "Turn photos or drawings into professional print-ready outlines. Powered by Gemini 2.5 Flash.",
    split_title: "Split Sheets for Printing",
    split_desc: "Split large projects into A4 sheets to print and assemble — up to 10 sheets, custom scale.",
    wa_title: "WhatsApp Assistant",
    wa_desc: "AI that serves your clients on WhatsApp automatically. Quotes, scheduling, and screening 24/7.",
    wa_price: "R$ 357/mo",
    agents_tag: "Ads Center",
    agents_title: "6 Marketing Agents with AI",
    agents_sub: "Specialists in attracting clients to your studio on the major digital platforms.",
    pricing_tag: "Plans",
    pricing_title: "Choose your level",
    pricing_free: "Free",
    pricing_free_desc: "To get started",
    pricing_prem: "Premium",
    pricing_prem_desc: "To grow fast",
    pricing_course: "Course + Premium",
    pricing_course_desc: "Complete package",
    pricing_mo: "/mo",
    pricing_life: "lifetime",
    pricing_cta_free: "Create Free Account",
    pricing_cta_prem: "Subscribe Premium",
    pricing_cta_pack: "Get Complete Package",
    faq_tag: "FAQ",
    faq_title: "Quick answers",
    final_title: "Ready to transform your business?",
    final_sub: "Over 1,200 tattoo artists already use Ink Authority to grow. Be next.",
    final_cta: "Get Started Now",
    footer_rights: "All rights reserved.",
    footer_made: "Built for professional tattoo artists.",
  },
  es: {
    nav_what: "Qué Es",
    nav_tools: "Herramientas",
    nav_course: "Workshop",
    nav_pricing: "Precios",
    nav_cta: "Empezar Ahora",
    hero_tag: "Plataforma Exclusiva Para Tatuadores",
    hero_h1a: "Convierte Tu",
    hero_h1b: "Talento",
    hero_h1c: "en Negocio",
    hero_sub: "La única plataforma que une un workshop de marketing, tutoría con IA y herramientas de creación — todo pensado para tatuadores que quieren ganar más.",
    hero_cta: "Ver Planes y Precios",
    hero_cta2: "Conocer la Plataforma",
    stat_artists: "Tatuadores Activos",
    stat_countries: "Países",
    stat_tools: "Herramientas de IA",
    stat_rating: "Calificación Promedio",
    what_tag: "Qué es Ink Authority",
    what_title: "No es solo un workshop. Es una plataforma completa.",
    what_desc: "Ink Authority reúne todo lo que un tatuador profesional necesita para crecer: un workshop de marketing y posicionamiento, tutores con IA, agentes de anuncios, generador de calcomanías con IA y mucho más.",
    tools_tag: "Herramientas",
    tools_title: "Todo lo que necesitas para crecer",
    course_tag: "Workshop Exclusivo",
    course_title: "Marketing y Posicionamiento para Tatuadores",
    course_desc: "Aprende los secretos exactos para posicionarte como autoridad, atraer clientes que pagan bien y convertir tu arte en un negocio rentable.",
    course_includes: "Qué incluye",
    course_price_label: "Acceso de por vida",
    course_price: "R$ 997",
    course_cta: "Asegurar mi Cupo",
    course_f1: "Posicionamiento y autoridad de marca",
    course_f2: "Estructuración de redes sociales",
    course_f3: "Creación de contenido que convierte",
    course_f4: "Técnicas de ventas y conversión",
    course_f5: "Tráfico pago del cero al avanzado",
    course_f6: "Comunidad exclusiva de tatuadores",
    course_f7: "Análisis de perfil gratis (primeros 20)",
    premium_tag: "Especialistas IA · R$ 97/mes",
    premium_title: "Inteligencia Artificial para tu Estudio",
    premium_sub: "7 herramientas en un plan. Cancela cuando quieras.",
    tutor_title: "Tutor IA Especialista",
    tutor_desc: "Tu mentor particular disponible 24h. Resuelve dudas técnicas, recibe sugerencias de agujas, pigmentos y planificación de sesión.",
    ads_title: "Central de Anuncios",
    ads_desc: "6 agentes de IA especializados en marketing para tatuadores. Google Ads, Meta Ads, TikTok, análisis de campañas y creación de contenido.",
    stencil_title: "Generador de Calcomanías con IA",
    stencil_desc: "Convierte fotos o dibujos en trazados profesionales listos para imprimir. Impulsado por Gemini 2.5 Flash.",
    split_title: "Dividir Hojas para Impresión",
    split_desc: "Divide proyectos grandes en hojas A4 para imprimir y armar — hasta 10 hojas, escala personalizada.",
    wa_title: "Asistente WhatsApp",
    wa_desc: "IA que atiende a tus clientes en WhatsApp automáticamente. Presupuestos, citas y filtrado 24/7.",
    wa_price: "R$ 357/mes",
    agents_tag: "Central de Anuncios",
    agents_title: "6 Agentes de Marketing con IA",
    agents_sub: "Especialistas en atraer clientes a tu estudio en las principales plataformas digitales.",
    pricing_tag: "Planes",
    pricing_title: "Elige tu nivel",
    pricing_free: "Gratuito",
    pricing_free_desc: "Para comenzar",
    pricing_prem: "Premium",
    pricing_prem_desc: "Para crecer rápido",
    pricing_course: "Workshop + Premium",
    pricing_course_desc: "Paquete completo",
    pricing_mo: "/mes",
    pricing_life: "de por vida",
    pricing_cta_free: "Crear Cuenta Gratis",
    pricing_cta_prem: "Suscribirse Premium",
    pricing_cta_pack: "Obtener Paquete Completo",
    faq_tag: "Preguntas Frecuentes",
    faq_title: "Respuestas rápidas",
    final_title: "¿Listo para transformar tu negocio?",
    final_sub: "Más de 1.200 tatuadores ya usan Ink Authority para crecer. Sé el siguiente.",
    final_cta: "Empezar Ahora",
    footer_rights: "Todos los derechos reservados.",
    footer_made: "Desarrollado para tatuadores profesionales.",
  },
};

function useT() {
  const [lang, setLang] = useState("pt");
  useEffect(() => {
    const stored = localStorage.getItem("inkLang") || "pt";
    setLang(stored in T ? stored : "pt");
    const handler = () => {
      const s = localStorage.getItem("inkLang") || "pt";
      setLang(s in T ? s : "pt");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return (key: string) => T[lang]?.[key] ?? T["pt"]?.[key] ?? key;
}

// ─────────── Animation helpers ───────────
function FadeUp({ children, delay = 0, className = "" }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ─────────── FAQ Item ───────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border rounded-2xl overflow-hidden transition-colors", open ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/5")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-semibold text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-sm text-muted-foreground px-5 pb-5 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────── Main Page ───────────
export default function VendasPage() {
  const t = useT();
  const { isSignedIn } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("pt");
  const [langOpen, setLangOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]);

  useEffect(() => {
    const stored = localStorage.getItem("inkTheme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
    const storedLang = localStorage.getItem("inkLang") || "pt";
    setLang(storedLang in T ? storedLang : "pt");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("inkTheme", next);
  };

  const switchLang = (code: string) => {
    setLang(code);
    localStorage.setItem("inkLang", code);
    setLangOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const LANGS = [
    { code: "pt", label: "Português" }, { code: "en", label: "English" }, { code: "es", label: "Español" },
  ];

  const handleCTA = async (productId: string, returnUrl = "/dashboard") => {
    if (!isSignedIn) { setIsLoginOpen(true); return; }
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, returnUrl }),
    });
    const d = await res.json();
    if (d.url) window.location.href = d.url;
  };

  const AGENTS = [
    { icon: <Users className="w-5 h-5" />, label: "Agente de Público", labelEn: "Audience Agent", color: "purple", desc: "Define personas, nichos e comportamento do cliente ideal" },
    { icon: <Search className="w-5 h-5" />, label: "Google Ads", labelEn: "Google Ads", color: "blue", desc: "Palavras-chave, anúncios e estratégias de busca" },
    { icon: <Instagram className="w-5 h-5" />, label: "Meta Ads", labelEn: "Meta Ads", color: "pink", desc: "Facebook e Instagram: criativos, públicos e campanhas" },
    { icon: <Music2 className="w-5 h-5" />, label: "TikTok Ads", labelEn: "TikTok Ads", color: "cyan", desc: "Vídeos virais, Spark Ads e estratégia orgânica" },
    { icon: <BarChart2 className="w-5 h-5" />, label: "Análise de Campanha", labelEn: "Campaign Analysis", color: "green", desc: "CTR, ROAS, CPC — interpreta seus dados e sugere melhorias" },
    { icon: <PenLine className="w-5 h-5" />, label: "Criação de Conteúdo", labelEn: "Content Creation", color: "amber", desc: "Roteiros, legendas, calendário editorial e hashtags" },
  ];

  const colorMap: Record<string, string> = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-400/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-400/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-400/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-400/20",
    green: "bg-green-500/10 text-green-400 border-green-400/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-400/20",
  };

  const FAQS = [
    { q: "O que está incluído no plano Premium?", a: "Tutor IA Especialista, Central de Anúncios com 6 agentes, Gerador de Decalque com IA (Gemini 2.5) e Dividir Folhas — tudo por R$ 97/mês. Cancele quando quiser." },
    { q: "Qual a diferença entre o Workshop e o Premium?", a: "O Workshop de Marketing & Posicionamento tem acesso vitalício (R$ 997) e foca em estratégia e vendas. O Premium (R$ 97/mês) dá acesso às ferramentas de IA para o dia a dia. Recomendamos os dois juntos." },
    { q: "As ferramentas funcionam para qualquer estilo de tatuagem?", a: "Sim! Todos os agentes e o tutor são treinados para atender tatuadores de todos os estilos — realismo, blackwork, old school, aquarela, geométrico, etc." },
    { q: "Posso cancelar o Premium quando quiser?", a: "Sim. O plano Premium é uma assinatura mensal sem fidelidade. Cancele a qualquer momento diretamente na plataforma." },
    { q: "O Gerador de Decalque substitui o papel de decalque?", a: "Não — ele gera o traçado/arte que você vai imprimir no papel de decalque. A IA extrai os contornos da imagem com precisão profissional, pronto para você imprimir e transferir para a pele." },
    { q: "O Assistente WhatsApp funciona com meu número atual?", a: "Sim. O assistente se conecta ao seu número do WhatsApp Business e passa a atender os clientes automaticamente. A configuração é simples e guiada." },
  ];

  return (
    <div className={cn("min-h-screen text-foreground overflow-x-hidden", theme === "light" ? "bg-[#f8f8f6]" : "bg-[#080808]")}
      style={{ colorScheme: theme }}>

      {/* ─── NAVBAR ─── */}
      <motion.nav style={{ backgroundColor: navBg }}
        className="fixed top-0 left-0 right-0 z-50 h-18 flex items-center justify-between px-6 lg:px-12 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-primary">
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>
          <span className="font-black text-lg tracking-tighter uppercase">Ink Authority</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "#what", label: t("nav_what") },
            { href: "#tools", label: t("nav_tools") },
            { href: "#course", label: t("nav_course") },
            { href: "#pricing", label: t("nav_pricing") },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Lang switcher */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-white/5">
              <Globe className="w-4 h-4" />
              <span className="uppercase font-bold">{lang}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 bg-background border border-border/30 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => switchLang(l.code)}
                    className={cn("w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors", lang === l.code ? "text-primary" : "text-muted-foreground")}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button onClick={() => isSignedIn ? window.location.href = "/dashboard" : setIsLoginOpen(true)}
            className="metallic-gradient text-black font-bold text-[10px] tracking-widest uppercase px-5 h-9 rounded-full">
            {t("nav_cta")} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-[100px]" />
          <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]" />
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary mb-6 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {t("hero_tag")}
          <Sparkles className="w-3.5 h-3.5" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-[108px] font-black uppercase tracking-tighter leading-none mb-8 max-w-6xl">
          {t("hero_h1a")}{" "}
          <span className="metallic-text neon-glow">{t("hero_h1b")}</span>
          <br />
          {t("hero_h1c")}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          {t("hero_sub")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-20">
          <Button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="metallic-gradient text-black font-bold h-14 px-8 rounded-2xl text-[12px] tracking-widest uppercase hover:scale-[1.03] transition-transform shadow-2xl shadow-primary/20">
            {t("hero_cta")} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" })}
            className="h-14 px-8 rounded-2xl text-[12px] tracking-widest uppercase border-white/20 hover:bg-white/5">
            {t("hero_cta2")}
          </Button>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 w-full max-w-3xl">
          {[
            { n: "1.200+", l: t("stat_artists") },
            { n: "12", l: t("stat_countries") },
            { n: "7", l: t("stat_tools") },
            { n: "4.9★", l: t("stat_rating") },
          ].map((s) => (
            <div key={s.l} className="bg-background/80 backdrop-blur-sm px-6 py-5 text-center">
              <p className="text-2xl font-black text-primary mb-1">{s.n}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.l}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 text-muted-foreground/40">
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ─── WHAT IS ─── */}
      <section id="what" className="py-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">{t("what_tag")}</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">{t("what_title")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("what_desc")}</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: <BookOpen className="w-4 h-4" />, text: "Workshop de Marketing & Posicionamento" },
                { icon: <Bot className="w-4 h-4" />, text: "Tutor IA disponível 24h" },
                { icon: <Megaphone className="w-4 h-4" />, text: "6 Agentes de Anúncios com IA" },
                { icon: <Contrast className="w-4 h-4" />, text: "Gerador de Decalque com Gemini 2.5" },
                { icon: <MessageCircle className="w-4 h-4" />, text: "Assistente WhatsApp Automático" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />
              <div className="relative glass rounded-3xl border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
                <Stream
                  src="f2a135026e57c0f0fe20dd0b355c0202"
                  controls
                  responsive={false}
                  className="w-full aspect-video"
                />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── COURSE ─── */}
      <section id="course" className="py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">{t("course_tag")}</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{t("course_title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("course_desc")}</p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeUp>
              <div className="glass rounded-3xl border border-primary/30 p-8 h-full bg-primary/5 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Marketing & Posicionamento</h3>
                  <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{t("course_desc")}</p>

                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t("course_includes")}</p>
                  <div className="space-y-3">
                    {[t("course_f1"), t("course_f2"), t("course_f3"), t("course_f4"), t("course_f5"), t("course_f6"), t("course_f7")].map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="flex flex-col gap-5 h-full">
                <div className="glass rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center flex-1">
                  <Award className="w-10 h-10 text-primary mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("course_price_label")}</p>
                  <p className="text-5xl font-black mb-2">{t("course_price")}</p>
                  <p className="text-muted-foreground text-sm mb-6">ou 12x de R$ 99,70</p>
                  <Button onClick={() => handleCTA("marketing_posicionamento", "/dashboard")}
                    className="w-full metallic-gradient text-black font-bold h-13 rounded-2xl text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform">
                    {t("course_cta")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Acesso imediato após o pagamento
                  </p>
                </div>

                <div className="glass rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm font-bold">4.9/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "Depois do workshop minha agenda encheu em 3 semanas. Os conteúdos são práticos e diretos — sem enrolação."
                  </p>
                  <p className="text-xs font-bold mt-3">— Marina S., Tatuadora SP</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─── PREMIUM TOOLS ─── */}
      <section id="tools" className="py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-primary/3 to-transparent">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">{t("premium_tag")}</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{t("premium_title")}</h2>
            <p className="text-muted-foreground">{t("premium_sub")}</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Tutor IA */}
            <FadeUp>
              <div className="glass rounded-3xl border border-primary/30 p-8 h-full bg-primary/5 hover:border-primary/50 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                    Premium
                  </span>
                </div>
                <h3 className="text-xl font-black mb-3">{t("tutor_title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t("tutor_desc")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Agulhas e Pigmentos", "Planejamento de Sessão", "Técnicas Avançadas", "Avaliação de Trabalhos"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Central de Anúncios */}
            <FadeUp delay={0.1}>
              <div className="glass rounded-3xl border border-purple-400/30 p-8 h-full bg-purple-500/5 hover:border-purple-400/50 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-400/20">
                    Novo
                  </span>
                </div>
                <h3 className="text-xl font-black mb-3">{t("ads_title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t("ads_desc")}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {AGENTS.map((a) => (
                    <div key={a.label} className={cn("text-[10px] font-bold px-2 py-1.5 rounded-lg border flex items-center gap-1", colorMap[a.color])}>
                      {a.icon && <span className="scale-75">{a.icon}</span>}
                      <span className="truncate">{lang === "en" ? a.labelEn : a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Gerador de Decalque */}
            <FadeUp delay={0.15}>
              <div className="glass rounded-3xl border border-white/10 p-8 h-full hover:border-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Contrast className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-400/20 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Gemini 2.5
                  </span>
                </div>
                <h3 className="text-xl font-black mb-3">{t("stencil_title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("stencil_desc")}</p>
              </div>
            </FadeUp>

            {/* Dividir Folhas */}
            <FadeUp delay={0.2}>
              <div className="glass rounded-3xl border border-white/10 p-8 h-full hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Grid3x3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black mb-3">{t("split_title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("split_desc")}</p>
              </div>
            </FadeUp>
          </div>

          {/* WhatsApp - full width */}
          <FadeUp delay={0.25}>
            <div className="glass rounded-3xl border border-[#25D366]/30 p-8 flex flex-col md:flex-row items-center gap-8 bg-[#25D366]/5">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">{t("wa_title")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("wa_desc")}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {["Orçamentos 24h", "Agendamento Automático", "Triagem de Clientes", "Integração de Agenda"].map((f) => (
                    <span key={f} className="text-xs bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] px-3 py-1 rounded-full font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="text-center">
                  <span className="text-3xl font-black">{t("wa_price")}</span>
                </div>
                <Button onClick={() => handleCTA("whatsapp_premium")}
                  className="bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold px-8 h-12 rounded-2xl text-[11px] tracking-widest uppercase whitespace-nowrap">
                  Assinar Assistente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── 6 AGENTS ─── */}
      <section className="py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-purple-400 block mb-4">{t("agents_tag")}</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{t("agents_title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("agents_sub")}</p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((agent, i) => (
              <FadeUp key={agent.label} delay={i * 0.08}>
                <div className={cn("glass rounded-2xl border p-6 h-full hover:-translate-y-1 transition-all", colorMap[agent.color].replace("bg-", "border-").replace("/10", "/30"))}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", colorMap[agent.color])}>
                    {agent.icon}
                  </div>
                  <h4 className="font-black mb-2">{lang === "en" ? agent.labelEn : agent.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">{t("pricing_tag")}</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{t("pricing_title")}</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <FadeUp>
              <div className="glass rounded-3xl border border-white/10 p-7 flex flex-col h-full">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{t("pricing_free")}</p>
                <p className="text-sm text-muted-foreground mb-6">{t("pricing_free_desc")}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black">R$ 0</span>
                </div>
                <div className="space-y-2.5 mb-8 flex-1">
                  {["Tutor IA Especialista", "Gerador de Decalque", "Dividir Folhas para Impressão", "Acesso à Comunidade"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-foreground/70">
                      <CheckCircle className="w-3.5 h-3.5 text-primary/60 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Button onClick={() => isSignedIn ? window.location.href = "/dashboard" : setIsLoginOpen(true)}
                  variant="outline" className="w-full h-11 rounded-xl text-[10px] tracking-widest uppercase border-white/20">
                  {t("pricing_cta_free")}
                </Button>
              </div>
            </FadeUp>

            {/* Premium */}
            <FadeUp delay={0.1}>
              <div className="glass rounded-3xl border border-primary/50 p-7 flex flex-col h-full bg-primary/5 relative overflow-hidden scale-[1.02]">
                <div className="absolute top-4 right-4 bg-primary text-black text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-black" /> Popular
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{t("pricing_prem")}</p>
                <p className="text-sm text-muted-foreground mb-6">{t("pricing_prem_desc")}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black">R$ 97</span>
                  <span className="text-muted-foreground text-sm">{t("pricing_mo")}</span>
                </div>
                <div className="space-y-2.5 mb-8 flex-1">
                  {["Tutor IA Especialista", "Central de Anúncios (6 agentes)", "Gerador de Decalque IA", "Dividir Folhas para Impressão", "Suporte Prioritário", "Acesso a Novidades em 1°"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleCTA("tools_premium")}
                  className="w-full metallic-gradient text-black font-bold h-12 rounded-xl text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-transform">
                  {t("pricing_cta_prem")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </FadeUp>

            {/* Course + Premium */}
            <FadeUp delay={0.2}>
              <div className="glass rounded-3xl border border-purple-400/30 p-7 flex flex-col h-full bg-purple-500/5">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">{t("pricing_course")}</p>
                <p className="text-sm text-muted-foreground mb-6">{t("pricing_course_desc")}</p>
                <div className="mb-2">
                  <span className="text-4xl font-black">R$ 997</span>
                  <span className="text-xs text-muted-foreground ml-1">{t("pricing_life")}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">+ R$ 97/mês Premium</p>
                <div className="space-y-2.5 mb-8 flex-1">
                  {["Tudo do plano Premium", "Workshop Marketing & Posicionamento", "Acesso Vitalício ao Workshop", "Comunidade Exclusiva", "🎁 Análise de Perfil Gratuita"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleCTA("marketing_posicionamento")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold h-12 rounded-xl text-[10px] tracking-widest uppercase">
                  {t("pricing_cta_pack")} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-28 px-6 lg:px-12 max-w-3xl mx-auto">
        <FadeUp className="text-center mb-12">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">{t("faq_tag")}</span>
          <h2 className="text-4xl font-black uppercase tracking-tighter">{t("faq_title")}</h2>
        </FadeUp>
        <div className="space-y-3">
          {FAQS.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 px-6 lg:px-12 text-center max-w-4xl mx-auto">
        <FadeUp>
          <div className="glass rounded-3xl border border-primary/30 p-16 bg-primary/5 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/15 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/15 rounded-full blur-[80px]" />
            <div className="relative">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-5">{t("final_title")}</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">{t("final_sub")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => isSignedIn ? window.location.href = "/dashboard" : setIsLoginOpen(true)}
                  className="metallic-gradient text-black font-bold h-14 px-10 rounded-2xl text-[12px] tracking-widest uppercase hover:scale-[1.03] transition-transform shadow-2xl shadow-primary/25">
                  {t("final_cta")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Cancele quando quiser · Sem fidelidade
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 border-t border-border/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>
          <span className="font-black text-sm tracking-tighter uppercase">Ink Authority</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Ink Authority. {t("footer_rights")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("footer_made")}</p>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialView="register" />
    </div>
  );
}
