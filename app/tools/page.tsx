"use client";

import {
  CheckCircle, ArrowRight, Bot, Contrast, Grid3x3,
  Megaphone, Search, Instagram, Music2, BarChart2, PenLine,
  Users, Zap, Lock, Star
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "motion/react";

export default function ToolsPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleCheckout = async (productId: string, productType = "tools") => {
    if (!isSignedIn) { setIsLoginOpen(true); return; }
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productType, returnUrl: "/dashboard/tools" }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro ao iniciar checkout.");
    } catch { alert("Erro de conexão ao iniciar checkout."); }
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

      {/* ===== PLANO PREMIUM ===== */}
      <section className="px-6 lg:px-12 pb-20 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary">Plano Premium · R$ 97/mês</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tutor IA */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-primary/40 p-8 flex flex-col relative overflow-hidden bg-primary/5">
            <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Star className="w-3 h-3" /> Mais Vendido
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-2">Tutor IA Especialista</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              Mentor particular disponível 24h. Tire dúvidas técnicas em tempo real, receba sugestões precisas de agulhas e pigmentos para cada projeto e tenha ajuda no planejamento das suas sessões.
            </p>
            <div className="space-y-2.5 mb-8">
              {["Planejamento de Sessão", "Análise de Pigmentos", "Mentoria Técnica 24h", "Avaliação de Trabalhos"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <Button onClick={() => handleCheckout("tools_premium")}
                className="w-full metallic-gradient text-black font-bold h-12 rounded-xl hover:scale-[1.02] transition-transform text-[11px] tracking-widest uppercase">
                Assinar Premium <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">Incluído no plano Premium · R$ 97/mês</p>
            </div>
          </motion.div>

          {/* Central de Anúncios */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-purple-400/40 p-8 flex flex-col relative overflow-hidden bg-purple-500/5">
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Novo
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Megaphone className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black mb-2">Central de Anúncios</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              6 agentes de IA especializados em marketing para tatuadores. Crie campanhas no Google, Meta e TikTok, analise seus resultados e gere conteúdo — tudo em um só lugar.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                { icon: <Users className="w-3.5 h-3.5" />, label: "Agente de Público", color: "text-purple-400" },
                { icon: <Search className="w-3.5 h-3.5" />, label: "Google Ads", color: "text-blue-400" },
                { icon: <Instagram className="w-3.5 h-3.5" />, label: "Meta Ads", color: "text-pink-400" },
                { icon: <Music2 className="w-3.5 h-3.5" />, label: "TikTok Ads", color: "text-cyan-400" },
                { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Análise de Campanha", color: "text-green-400" },
                { icon: <PenLine className="w-3.5 h-3.5" />, label: "Criação de Conteúdo", color: "text-amber-400" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-2 text-xs text-foreground/70 bg-white/5 rounded-xl px-3 py-2">
                  <span className={a.color}>{a.icon}</span> {a.label}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <Button onClick={() => handleCheckout("tools_premium")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold h-12 rounded-xl text-[11px] tracking-widest uppercase">
                Assinar Premium <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">Incluído no plano Premium · R$ 97/mês</p>
            </div>
          </motion.div>
        </div>

        {/* Assistente WhatsApp - full width */}
        <motion.div whileHover={{ y: -2 }} className="glass rounded-3xl border border-[#25D366]/30 p-8 flex flex-col md:flex-row items-center gap-8 bg-[#25D366]/5">
          <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" />
            </svg>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">Assistente WhatsApp</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              IA que atende seus clientes no WhatsApp automaticamente — responde dúvidas, faz orçamentos, agenda horários e triagem de clientes 24h por dia sem você precisar estar online.
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              {["Orçamentos Automáticos", "Agendamento de Horários", "Triagem de Clientes 24h", "Integração de Agenda"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-foreground/70 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-3 py-1">
                  <CheckCircle className="w-3 h-3 text-[#25D366]" /> {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <span className="text-3xl font-black">R$ 357</span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <Button onClick={() => handleCheckout("whatsapp_premium")}
              className="bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold px-8 h-12 rounded-xl text-[11px] tracking-widest uppercase whitespace-nowrap">
              Assinar Assistente <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ===== FERRAMENTAS GRATUITAS ===== */}
      <section className="px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-foreground/50">Ferramentas Gratuitas</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gerador de Decalque */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-white/10 hover:border-primary/40 p-8 flex flex-col transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Contrast className="w-7 h-7 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black">Gerador de Decalque</h3>
              <span className="text-[9px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-400/20 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> IA
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              Transforme qualquer foto ou desenho em um traçado limpo pronto para imprimir no papel de decalque. Usa o Gemini 2.5 Flash para extrair contornos com precisão profissional.
            </p>
            <div className="space-y-2.5 mb-8">
              {[
                "Detecção de Contorno por IA (Gemini 2.5)",
                "Ajuste de Contraste e Sensibilidade",
                "Download em PNG de alta resolução",
                "Funciona com fotos e desenhos"
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="mb-4 text-center">
                <span className="text-2xl font-black text-primary">Gratuito</span>
              </div>
              <Button onClick={() => isSignedIn ? window.location.href = "/dashboard/tools/decalque" : setIsLoginOpen(true)}
                className="w-full metallic-gradient text-black font-bold h-12 rounded-xl hover:scale-[1.02] transition-transform text-[11px] tracking-widest uppercase">
                Acessar Ferramenta <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Dividir Folhas */}
          <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl border border-white/10 hover:border-primary/40 p-8 flex flex-col transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Grid3x3 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-2">Dividir Folhas para Impressão</h3>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              Divida projetos grandes em folhas A4 para imprimir e montar peça por peça sem perder a escala. Ideal para tatuar designs grandes em múltiplas sessões.
            </p>
            <div className="space-y-2.5 mb-8">
              {[
                "Até 10 folhas A4 por projeto",
                "Escala personalizada com prévia ao vivo",
                "Sobreposição para facilitar colagem",
                "Download em PDF ou PNG individual"
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <div className="mb-4 text-center">
                <span className="text-2xl font-black text-primary">Gratuito</span>
              </div>
              <Button onClick={() => isSignedIn ? window.location.href = "/dashboard/tools/dividir-folhas" : setIsLoginOpen(true)}
                className="w-full metallic-gradient text-black font-bold h-12 rounded-xl hover:scale-[1.02] transition-transform text-[11px] tracking-widest uppercase">
                Acessar Ferramenta <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-6 lg:px-12 pb-24 max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl border border-primary/20 p-12 bg-primary/5">
          <Lock className="w-10 h-10 text-primary mx-auto mb-5" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Acesse Tudo com o Premium</h2>
          <p className="text-muted-foreground mb-8">
            Tutor IA + Central de Anúncios completa (6 agentes de marketing) por R$ 97/mês. Cancele quando quiser.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {["Tutor IA 24h", "Google Ads", "Meta Ads", "TikTok Ads", "Análise de Campanha", "Conteúdo IA"].map((f) => (
              <span key={f} className="text-xs font-semibold bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
          <Button onClick={() => handleCheckout("tools_premium")}
            className="metallic-gradient text-black font-bold px-10 h-14 rounded-xl hover:scale-[1.02] transition-transform text-[12px] tracking-widest uppercase shadow-2xl shadow-primary/20">
            Assinar Premium · R$ 97/mês <ArrowRight className="w-5 h-5 ml-2" />
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
