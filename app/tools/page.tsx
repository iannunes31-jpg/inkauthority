"use client";

import {
  CheckCircle, ArrowRight, Bot, Contrast, Grid3x3,
  Megaphone, Search, Instagram, Music2, BarChart2, PenLine,
  Users, Crown, Sparkles
} from "lucide-react";
import { PLANS, PlanId, COMBO_ITEMS, COMBO_FULL_PRICE, COMBO_SAVINGS, formatBRL } from "@/lib/pricing";
import { useAuth } from "@clerk/nextjs";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { openCheckout } from "@/components/CheckoutHost";
import { motion } from "motion/react";

export default function ToolsPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleCheckout = (productId: PlanId) => {
    if (!isSignedIn) { setIsLoginOpen(true); return; }
    openCheckout(productId);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/20 h-20 flex items-center justify-between px-6 lg:px-12 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary neon-glow">
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>
          <span className="font-black text-xl tracking-tighter uppercase">Ink Authority</span>
        </div>
        <Button variant="ghost" onClick={() => window.location.href = "/"}>Voltar</Button>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-16 px-6 lg:px-12 text-center max-w-4xl mx-auto">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary block mb-4">Ferramentas</span>
        <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-5 metallic-text">
          Especialistas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Inteligência artificial e utilitários práticos criados especificamente para tatuadores — do atendimento ao cliente até a criação de campanhas.
        </p>
      </section>

      {/* ===== GRÁTIS ===== */}
      <section className="px-6 lg:px-12 pb-16 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-green-400">Grátis</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <motion.div whileHover={{ y: -2 }} className="glass rounded-3xl border border-primary/30 p-8 flex flex-col md:flex-row items-center gap-8 bg-primary/5">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">Tutor IA Especialista</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mentor particular disponível 24h. Tire dúvidas técnicas, receba sugestões de agulhas e pigmentos e tenha ajuda no planejamento das suas sessões.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <span className="text-3xl font-black text-green-400">Grátis</span>
            <Button onClick={() => isSignedIn ? window.location.href = "/dashboard/tools/tutor" : setIsLoginOpen(true)}
              className="metallic-gradient text-black font-bold px-8 h-12 rounded-xl text-[11px] tracking-widest uppercase whitespace-nowrap">
              Acessar Tutor <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ===== ASSINATURAS MENSAIS ===== */}
      <section className="px-6 lg:px-12 pb-16 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary">Assinaturas mensais</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dante */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-[#25D366]/30 p-8 flex flex-col bg-[#25D366]/5">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center mb-6">
              <Bot className="w-7 h-7 text-[#25D366]" />
            </div>
            <h3 className="text-2xl font-black mb-2">Dante · Assistente de WhatsApp</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              IA que atende seus clientes no WhatsApp 24h: responde dúvidas, faz orçamentos, agenda horários e faz a triagem sem você precisar estar online.
            </p>
            <div className="space-y-2.5 mb-8">
              {["Orçamentos Automáticos", "Agendamento de Horários", "Triagem de Clientes 24h", "Modo Copilot ou Automático"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="w-4 h-4 text-[#25D366] shrink-0" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="mb-4 text-center">
                <span className="text-3xl font-black">{formatBRL(PLANS.dante_whatsapp.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <Button onClick={() => handleCheckout("dante_whatsapp")}
                className="w-full bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold h-12 rounded-xl text-[11px] tracking-widest uppercase">
                Assinar Dante <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Especialistas Artísticos */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-[#4F8EF7]/30 p-8 flex flex-col bg-[#4F8EF7]/5">
            <div className="w-14 h-14 rounded-2xl bg-[#4F8EF7]/20 flex items-center justify-center mb-6">
              <Contrast className="w-7 h-7 text-[#4F8EF7]" />
            </div>
            <h3 className="text-2xl font-black mb-2">Especialistas Artísticos</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              Prepare a arte para a sessão: decalque pronto para o papel térmico e divisão de projetos grandes em folhas A4 sem perder a escala.
            </p>
            <div className="space-y-2.5 mb-8">
              {[
                { icon: <Contrast className="w-4 h-4 text-[#4F8EF7] shrink-0" />, label: "Gerador de Decalque com IA" },
                { icon: <Grid3x3 className="w-4 h-4 text-[#8B5CF6] shrink-0" />, label: "Dividir Folhas para Impressão" },
                { icon: <CheckCircle className="w-4 h-4 text-[#4F8EF7] shrink-0" />, label: "Linhas, sombras ou traço fino" },
                { icon: <CheckCircle className="w-4 h-4 text-[#4F8EF7] shrink-0" />, label: "Download em PNG e PDF" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-foreground/80">
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="mb-4 text-center">
                <span className="text-3xl font-black">{formatBRL(PLANS.artisticos_premium.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <Button onClick={() => handleCheckout("artisticos_premium")}
                className="w-full bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] hover:opacity-90 text-white font-bold h-12 rounded-xl text-[11px] tracking-widest uppercase">
                Assinar Artísticos <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Especialistas em Anúncios */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-purple-400/30 p-8 flex flex-col bg-purple-500/5">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Megaphone className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black mb-2">Especialistas em Anúncios</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              7 agentes de IA para criar campanhas no Google, Meta e TikTok, analisar resultados, gerar conteúdo e criar artes prontas para divulgar.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                { icon: <Users className="w-3.5 h-3.5" />, label: "Público", color: "text-purple-400" },
                { icon: <Search className="w-3.5 h-3.5" />, label: "Google Ads", color: "text-blue-400" },
                { icon: <Instagram className="w-3.5 h-3.5" />, label: "Meta Ads", color: "text-pink-400" },
                { icon: <Music2 className="w-3.5 h-3.5" />, label: "TikTok Ads", color: "text-cyan-400" },
                { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Análise", color: "text-green-400" },
                { icon: <PenLine className="w-3.5 h-3.5" />, label: "Conteúdo", color: "text-amber-400" },
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Criativos", color: "text-rose-400" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-2 text-xs text-foreground/70 bg-white/5 rounded-xl px-3 py-2">
                  <span className={a.color}>{a.icon}</span> {a.label}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="mb-4 text-center">
                <span className="text-3xl font-black">{formatBRL(PLANS.anuncios_premium.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <Button onClick={() => handleCheckout("anuncios_premium")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold h-12 rounded-xl text-[11px] tracking-widest uppercase">
                Assinar Anúncios <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== COMBO ===== */}
      <section className="px-6 lg:px-12 pb-24 max-w-3xl mx-auto">
        <div className="glass rounded-3xl border border-primary/30 p-10 bg-primary/5 text-center">
          <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Combo IA Completo</h2>
          <p className="text-muted-foreground mb-8">
            Dante, Especialistas Artísticos e Especialistas em Anúncios em uma única assinatura. Cancele quando quiser.
          </p>
          <div className="max-w-md mx-auto space-y-2 mb-6 text-left">
            {COMBO_ITEMS.map((id) => (
              <div key={id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground/80">{PLANS[id].name}</span>
                <span className="ml-auto text-muted-foreground line-through">{formatBRL(PLANS[id].price)}/mês</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/10">
              <span className="text-muted-foreground">Assinando separado</span>
              <span className="ml-auto text-muted-foreground line-through">{formatBRL(COMBO_FULL_PRICE)}/mês</span>
            </div>
          </div>
          <p className="mb-2">
            <span className="text-5xl font-black">{formatBRL(PLANS.combo_ia.price)}</span>
            <span className="text-muted-foreground">/mês</span>
          </p>
          <p className="text-sm font-bold text-primary mb-8">Você economiza {formatBRL(COMBO_SAVINGS)} por mês</p>
          <Button onClick={() => handleCheckout("combo_ia")}
            className="metallic-gradient text-black font-bold px-10 h-14 rounded-xl hover:scale-[1.02] transition-transform text-[12px] tracking-widest uppercase shadow-2xl shadow-primary/20">
            Assinar Combo · {formatBRL(PLANS.combo_ia.price)}/mês <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <footer className="py-10 border-t border-border/20 text-center text-sm text-muted-foreground">
        <p>© 2026 Ink Authority. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Desenvolvido para criadores e tatuadores profissionais.</p>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialView="register" />
    </main>
  );
}
