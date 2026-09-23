"use client";

import { motion } from "motion/react";
import { Settings, Users, Calendar, Ruler, Scissors, Megaphone, Search, Instagram, BarChart2, PenLine, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── SVG Illustrations ───────────────────────────────────────────────────────

function TutorIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Brain/AI circuit */}
      <circle cx="100" cy="60" r="38" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <circle cx="100" cy="60" r="26" fill="#D4AF37" fillOpacity="0.06" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
      {/* Neural nodes */}
      <circle cx="100" cy="60" r="7" fill="#D4AF37" fillOpacity="0.8" />
      <circle cx="74" cy="48" r="4" fill="#D4AF37" fillOpacity="0.5" />
      <circle cx="126" cy="48" r="4" fill="#D4AF37" fillOpacity="0.5" />
      <circle cx="74" cy="72" r="4" fill="#D4AF37" fillOpacity="0.5" />
      <circle cx="126" cy="72" r="4" fill="#D4AF37" fillOpacity="0.5" />
      <circle cx="100" cy="34" r="3.5" fill="#D4AF37" fillOpacity="0.4" />
      <circle cx="100" cy="86" r="3.5" fill="#D4AF37" fillOpacity="0.4" />
      {/* Connections */}
      <line x1="100" y1="60" x2="74" y2="48" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="126" y2="48" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="74" y2="72" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="126" y2="72" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="100" y2="34" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="60" x2="100" y2="86" stroke="#D4AF37" strokeWidth="1" opacity="0.4" />
      {/* Outer nodes */}
      <circle cx="58" cy="40" r="2.5" fill="#D4AF37" fillOpacity="0.3" />
      <circle cx="142" cy="40" r="2.5" fill="#D4AF37" fillOpacity="0.3" />
      <circle cx="58" cy="80" r="2.5" fill="#D4AF37" fillOpacity="0.3" />
      <circle cx="142" cy="80" r="2.5" fill="#D4AF37" fillOpacity="0.3" />
      <line x1="74" y1="48" x2="58" y2="40" stroke="#D4AF37" strokeWidth="0.8" opacity="0.25" />
      <line x1="126" y1="48" x2="142" y2="40" stroke="#D4AF37" strokeWidth="0.8" opacity="0.25" />
      <line x1="74" y1="72" x2="58" y2="80" stroke="#D4AF37" strokeWidth="0.8" opacity="0.25" />
      <line x1="126" y1="72" x2="142" y2="80" stroke="#D4AF37" strokeWidth="0.8" opacity="0.25" />
      {/* Sparkles */}
      <circle cx="155" cy="30" r="2" fill="#D4AF37" opacity="0.5" />
      <circle cx="45" cy="90" r="1.5" fill="#D4AF37" opacity="0.4" />
      <circle cx="160" cy="85" r="1.5" fill="#D4AF37" opacity="0.3" />
    </svg>
  );
}

function DanteIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Phone outline */}
      <rect x="72" y="18" width="56" height="84" rx="10" stroke="#25D366" strokeWidth="1.5" opacity="0.5" />
      <rect x="78" y="26" width="44" height="60" rx="5" fill="#25D366" fillOpacity="0.06" />
      {/* Chat bubbles */}
      <rect x="84" y="32" width="30" height="10" rx="5" fill="#25D366" fillOpacity="0.4" />
      <rect x="82" y="46" width="26" height="10" rx="5" fill="#25D366" fillOpacity="0.25" />
      <rect x="88" y="60" width="22" height="10" rx="5" fill="#25D366" fillOpacity="0.4" />
      <rect x="82" y="74" width="20" height="10" rx="5" fill="#25D366" fillOpacity="0.25" />
      {/* Dots in bubbles */}
      <circle cx="90" cy="37" r="1.5" fill="#25D366" opacity="0.7" />
      <circle cx="96" cy="37" r="1.5" fill="#25D366" opacity="0.7" />
      <circle cx="102" cy="37" r="1.5" fill="#25D366" opacity="0.7" />
      {/* Home button */}
      <circle cx="100" cy="95" r="4" stroke="#25D366" strokeWidth="1" opacity="0.4" />
      {/* Signal waves */}
      <path d="M140 45 Q152 55 140 65" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" fill="none" />
      <path d="M146 39 Q162 55 146 71" stroke="#25D366" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />
      <path d="M60 45 Q48 55 60 65" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" fill="none" />
      <path d="M54 39 Q38 55 54 71" stroke="#25D366" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />
      {/* AI spark */}
      <circle cx="100" cy="55" r="2.5" fill="#25D366" opacity="0.6" />
    </svg>
  );
}

function DecalqueIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Photo frame (before) */}
      <rect x="30" y="22" width="60" height="76" rx="6" stroke="#4F8EF7" strokeWidth="1.5" opacity="0.4" />
      <rect x="36" y="28" width="48" height="40" rx="3" fill="#4F8EF7" fillOpacity="0.06" />
      {/* Rose silhouette in photo */}
      <ellipse cx="60" cy="44" rx="10" ry="13" fill="#4F8EF7" fillOpacity="0.15" stroke="#4F8EF7" strokeWidth="0.8" opacity="0.5" />
      <line x1="60" y1="57" x2="60" y2="78" stroke="#4F8EF7" strokeWidth="1" opacity="0.4" />
      <ellipse cx="60" cy="65" rx="5" ry="3" fill="#4F8EF7" fillOpacity="0.1" />
      {/* Arrow */}
      <path d="M100 60 L115 60" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 55 L115 60 L110 65" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stencil frame (after) */}
      <rect x="120" y="22" width="60" height="76" rx="6" stroke="#4F8EF7" strokeWidth="1.5" opacity="0.7" />
      <rect x="126" y="28" width="48" height="40" rx="3" fill="white" fillOpacity="0.03" />
      {/* Clean line art */}
      <ellipse cx="150" cy="44" rx="10" ry="13" stroke="#4F8EF7" strokeWidth="1.5" fill="none" opacity="0.9" />
      <path d="M145 40 Q150 36 155 40" stroke="#4F8EF7" strokeWidth="1" fill="none" opacity="0.7" />
      <line x1="150" y1="57" x2="150" y2="78" stroke="#4F8EF7" strokeWidth="1.5" opacity="0.9" />
      <path d="M144 65 Q150 62 156 65" stroke="#4F8EF7" strokeWidth="1" fill="none" opacity="0.6" />
      {/* AI star */}
      <circle cx="162" cy="30" r="5" fill="#4F8EF7" fillOpacity="0.2" stroke="#4F8EF7" strokeWidth="1" opacity="0.6" />
      <path d="M162 27 L162.8 29.5 L165.5 29.5 L163.4 31.1 L164.2 33.5 L162 32 L159.8 33.5 L160.6 31.1 L158.5 29.5 L161.2 29.5 Z" fill="#4F8EF7" opacity="0.7" />
    </svg>
  );
}

function DividirIllustration() {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Large original sheet */}
      <rect x="55" y="15" width="90" height="70" rx="4" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.5" fill="#8B5CF6" fillOpacity="0.04" />
      {/* Grid lines splitting it */}
      <line x1="100" y1="15" x2="100" y2="85" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      <line x1="55" y1="50" x2="145" y2="50" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      {/* Corner marks */}
      <circle cx="55" cy="15" r="2.5" fill="#8B5CF6" opacity="0.5" />
      <circle cx="145" cy="15" r="2.5" fill="#8B5CF6" opacity="0.5" />
      <circle cx="55" cy="85" r="2.5" fill="#8B5CF6" opacity="0.5" />
      <circle cx="145" cy="85" r="2.5" fill="#8B5CF6" opacity="0.5" />
      <circle cx="100" cy="50" r="3" fill="#8B5CF6" opacity="0.7" />
      {/* Small sheets below */}
      <rect x="30" y="95" width="30" height="20" rx="3" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" fill="#8B5CF6" fillOpacity="0.08" />
      <rect x="66" y="95" width="30" height="20" rx="3" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" fill="#8B5CF6" fillOpacity="0.08" />
      <rect x="102" y="95" width="30" height="20" rx="3" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" fill="#8B5CF6" fillOpacity="0.08" />
      <rect x="138" y="95" width="30" height="20" rx="3" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" fill="#8B5CF6" fillOpacity="0.08" />
      {/* A4 labels */}
      <text x="37" y="108" fontSize="6" fill="#8B5CF6" opacity="0.6" fontFamily="sans-serif">A4</text>
      <text x="73" y="108" fontSize="6" fill="#8B5CF6" opacity="0.6" fontFamily="sans-serif">A4</text>
      <text x="109" y="108" fontSize="6" fill="#8B5CF6" opacity="0.6" fontFamily="sans-serif">A4</text>
      <text x="145" y="108" fontSize="6" fill="#8B5CF6" opacity="0.6" fontFamily="sans-serif">A4</text>
      {/* Ruler */}
      <line x1="30" y1="90" x2="168" y2="90" stroke="#8B5CF6" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

function AnunciosIllustration() {
  return (
    <svg viewBox="0 0 300 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Central megaphone */}
      <path d="M140 45 L168 32 L168 78 L140 65 Z" fill="#A855F7" fillOpacity="0.2" stroke="#A855F7" strokeWidth="1.5" opacity="0.7" />
      <rect x="126" y="45" width="15" height="20" rx="3" fill="#A855F7" fillOpacity="0.15" stroke="#A855F7" strokeWidth="1.2" opacity="0.6" />
      <path d="M140 68 L136 82" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Sound waves */}
      <path d="M175 47 Q183 55 175 63" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M181 41 Q193 55 181 69" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Platform icons floating */}
      {/* Google */}
      <circle cx="55" cy="35" r="14" fill="#4285F4" fillOpacity="0.15" stroke="#4285F4" strokeWidth="1" opacity="0.6" />
      <text x="49" y="40" fontSize="10" fill="#4285F4" opacity="0.8" fontFamily="sans-serif" fontWeight="bold">G</text>
      {/* Instagram */}
      <rect x="85" y="75" width="28" height="28" rx="7" fill="#E4405F" fillOpacity="0.12" stroke="#E4405F" strokeWidth="1" opacity="0.6" />
      <circle cx="99" cy="89" r="6" stroke="#E4405F" strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="107" cy="81" r="2" fill="#E4405F" opacity="0.6" />
      {/* TikTok */}
      <circle cx="225" cy="35" r="14" fill="#00F2EA" fillOpacity="0.1" stroke="#00F2EA" strokeWidth="1" opacity="0.5" />
      <path d="M221 29 Q224 27 224 31 L224 38 Q227 39 229 37" stroke="#00F2EA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Meta */}
      <rect x="220" y="72" width="28" height="28" rx="7" fill="#0866FF" fillOpacity="0.12" stroke="#0866FF" strokeWidth="1" opacity="0.6" />
      <path d="M228 86 Q234 80 240 86 Q246 92 240 98" stroke="#0866FF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Connecting lines */}
      <line x1="68" y1="40" x2="126" y2="53" stroke="#A855F7" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
      <line x1="110" y1="83" x2="130" y2="68" stroke="#EC4899" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
      <line x1="213" y1="40" x2="168" y2="50" stroke="#A855F7" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
      <line x1="222" y1="80" x2="168" y2="68" stroke="#EC4899" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
      {/* Sparkles */}
      <circle cx="115" cy="30" r="2" fill="#EC4899" opacity="0.5" />
      <circle cx="195" cy="92" r="2" fill="#A855F7" opacity="0.4" />
      <circle cx="60" cy="70" r="1.5" fill="#A855F7" opacity="0.4" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Ferramentas</h1>
        <p className="text-muted-foreground">Inteligência artificial e utilitários práticos para o dia a dia do seu estúdio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Tutor IA ── */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-[#D4AF37]/30 transition-all flex flex-col h-full relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(212,175,55,0.15), 0 0 24px 4px rgba(212,175,55,0.12)" }}
        >
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none">
            <TutorIllustration />
          </div>
          <div className="relative z-10 mt-28">
            <h2 className="text-xl font-bold mb-3">Tutor IA Especialista</h2>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Seu mentor particular 24 horas por dia. Nossa IA sugere agulhas, pigmentos e ajuda no planejamento cirúrgico.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Bate-papo Interativo
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Avaliação de Trabalhos
              </div>
              <Link href="/dashboard/tools/tutor" className="mt-4 block w-full">
                <Button className="w-full metallic-gradient text-black font-bold uppercase tracking-widest text-[10px]">
                  Acessar Tutor
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Dante (WhatsApp) ── */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-[#25D366]/30 transition-all flex flex-col h-full relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(37,211,102,0.15), 0 0 24px 4px rgba(37,211,102,0.12)" }}
        >
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none">
            <DanteIllustration />
          </div>
          <div className="relative z-10 mt-28">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xl font-bold">Dante</h2>
              <span className="text-[9px] font-bold tracking-widest uppercase bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/30">WhatsApp IA</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e cadastra o cliente direto na sua agenda.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Settings className="w-4 h-4 text-[#25D366]" /> Configurar Número
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Calendar className="w-4 h-4 text-[#25D366]" /> Integração de Agenda
              </div>
              <Link href="/dashboard/tools/whatsapp" className="mt-4 block w-full">
                <Button className="w-full bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold uppercase tracking-widest text-[10px]">
                  Acessar Dante
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Gerador de Decalque ── */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-[#4F8EF7]/30 transition-all flex flex-col h-full relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(79,142,247,0.15), 0 0 24px 4px rgba(79,142,247,0.12)" }}
        >
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none">
            <DecalqueIllustration />
          </div>
          <div className="relative z-10 mt-28">
            <h2 className="text-xl font-bold mb-3">Gerador de Decalque</h2>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Transforme uma foto ou desenho em um traçado limpo, pronto para imprimir no papel de decalque.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Scissors className="w-4 h-4 text-[#4F8EF7]" /> Detecção de Contorno
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <svg className="w-4 h-4 text-[#4F8EF7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>
                Geração com IA Gemini
              </div>
              <Link href="/dashboard/tools/decalque" className="mt-4 block w-full">
                <Button className="w-full font-bold uppercase tracking-widest text-[10px] bg-[#4F8EF7] text-black hover:bg-[#4F8EF7]/90">
                  Acessar Ferramenta
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Dividir Folhas ── */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-[#8B5CF6]/30 transition-all flex flex-col h-full relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.15), 0 0 24px 4px rgba(139,92,246,0.12)" }}
        >
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none">
            <DividirIllustration />
          </div>
          <div className="relative z-10 mt-28">
            <h2 className="text-xl font-bold mb-3">Dividir Folhas para Impressão</h2>
            <p className="text-sm text-muted-foreground mb-6 font-light">
              Divida um projeto grande em folhas A4 para imprimir e montar peça por peça, sem perder a escala.
            </p>
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <Ruler className="w-4 h-4 text-[#8B5CF6]" /> Escala Personalizada
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                Guias de Montagem
              </div>
              <Link href="/dashboard/tools/dividir-folhas" className="mt-4 block w-full">
                <Button className="w-full font-bold uppercase tracking-widest text-[10px] bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90">
                  Acessar Ferramenta
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Central de Anúncios ── */}
        <motion.div
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-purple-400/30 transition-all flex flex-col h-full md:col-span-2 relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(168,85,247,0.15), 0 0 32px 6px rgba(168,85,247,0.10), 0 0 32px 6px rgba(236,72,153,0.08)" }}
        >
          <div className="absolute inset-x-0 top-0 h-28 pointer-events-none opacity-90">
            <AnunciosIllustration />
          </div>
          <div className="relative z-10 mt-24">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Central de Anúncios</h2>
              <span className="text-[9px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-400/20">Novo</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5 font-light">
              6 agentes de IA para criar campanhas, analisar público, gerar conteúdo e otimizar resultados no Google, Meta e TikTok.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: <Users className="w-3.5 h-3.5" />, label: "Agente de Público", color: "text-purple-400 bg-purple-500/15" },
                { icon: <Search className="w-3.5 h-3.5" />, label: "Google Ads", color: "text-blue-400 bg-blue-500/15" },
                { icon: <Instagram className="w-3.5 h-3.5" />, label: "Meta Ads", color: "text-pink-400 bg-pink-500/15" },
                { icon: <Music2 className="w-3.5 h-3.5" />, label: "TikTok Ads", color: "text-cyan-400 bg-cyan-500/15" },
                { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Análise", color: "text-green-400 bg-green-500/15" },
                { icon: <PenLine className="w-3.5 h-3.5" />, label: "Conteúdo", color: "text-amber-400 bg-amber-500/15" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2 text-[11px] font-semibold rounded-xl px-3 py-2 ${item.color.split(" ")[1]}`}>
                  <span className={item.color.split(" ")[0]}>{item.icon}</span>
                  <span className="text-foreground/70">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <Link href="/dashboard/tools/anuncios" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold uppercase tracking-widest text-[10px] h-11">
                  Acessar Central de Anúncios
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
