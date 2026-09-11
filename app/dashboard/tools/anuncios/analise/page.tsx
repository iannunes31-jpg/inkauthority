"use client";

import { BarChart2, ArrowLeft, User, Send, Loader2, ExternalLink, ClipboardPaste, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

const WELCOME = `Olá! Sou o Agente de Análise de Campanhas da Ink Authority. 📊

Vou analisar os dados das suas campanhas e te dar recomendações práticas para melhorar os resultados.

**Como funciona:**
1. **Cole os dados da sua campanha** aqui no chat (métricas do Google Ads, Meta Ads ou TikTok Ads)
2. Analiso CTR, CPC, ROAS, conversões e tudo mais
3. Dou 3 a 5 ações práticas para melhorar

**Dica:** Para exportar seus dados, acesse seu painel de anúncios → Relatórios → selecione o período → copie as principais métricas e cole aqui.

Qual plataforma você quer analisar? (Google Ads, Meta Ads ou TikTok Ads)?`;

const QUICK_ACTIONS = [
  "O que é um bom CTR para tatuagem?",
  "Meu CPC está alto, o que fazer?",
  "Como calcular ROAS mínimo?",
  "Qual frequência de anúncio é saudável?",
  "Como identificar o melhor criativo?",
  "Minha campanha está gastando mas sem resultado",
];

export default function AnalisePage() {
  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({ api: "/api/chat-ads", body: { agentType: "analise" } }),
        messages: [{ id: "welcome", role: "assistant", parts: [{ type: "text", text: WELCOME }] } as any],
      }),
    []
  );
  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="px-6 py-4 border-b border-border/20 flex items-center gap-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard/tools/anuncios" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-black uppercase tracking-tighter">Análise de Campanha</h1>
          <p className="text-xs text-muted-foreground">Cole seus dados — a IA analisa e sugere melhorias</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-border/20 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Windsor AI Connect */}
          <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-400">Windsor AI</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Conecte sua conta do Windsor AI para importar métricas automaticamente de todas as suas campanhas.
            </p>
            <a
              href="https://windsor.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
            >
              Criar conta Windsor AI <ExternalLink className="w-3 h-3" />
            </a>
            <div className="mt-3 pt-3 border-t border-green-400/10">
              <p className="text-[10px] text-muted-foreground mb-2">Depois de configurar, exporte seus dados e cole aqui no chat para análise completa.</p>
            </div>
          </div>

          {/* Como colar dados */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardPaste className="w-4 h-4 text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Como Exportar</p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold shrink-0">Google:</span>
                <span>Relatórios → Campanha → Download CSV → cole aqui</span>
              </div>
              <div className="flex gap-2">
                <span className="text-pink-400 font-bold shrink-0">Meta:</span>
                <span>Gerenciador de Anúncios → Exportar → cole os dados principais</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold shrink-0">TikTok:</span>
                <span>TikTok Ads → Dashboard → exportar relatório</span>
              </div>
            </div>
          </div>

          {/* Quick questions */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-400 mb-2">Dúvidas Rápidas</p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((tip) => (
                <button key={tip} onClick={() => sendMessage({ role: "user", parts: [{ type: "text", text: tip }] } as any)} disabled={isLoading}
                  className="w-full text-left text-xs bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-400/30 rounded-xl px-3 py-2.5 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50">
                  {tip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((m) => {
                const text = m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? (m as any).content ?? "";
                return (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${m.role === "user" ? "bg-foreground/10 border-border/20" : "bg-green-500/20 border-green-400/30"}`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <BarChart2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "bg-foreground/5 border border-border/10 rounded-tr-none" : "bg-green-500/5 border border-green-400/10 rounded-tl-none"}`}>
                      {text}
                    </div>
                  </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500/20 border border-green-400/30">
                    <BarChart2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-green-500/5 border border-green-400/10 rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-5 border-t border-border/20">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative flex items-start gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                  placeholder="Cole aqui os dados da campanha (CTR, CPC, impressões, cliques, conversões, gasto...) ou faça uma pergunta..."
                  disabled={isLoading}
                  rows={3}
                  className="flex-1 bg-foreground/5 border border-border/20 rounded-2xl py-3 px-4 text-[14px] focus:outline-none focus:border-green-400/50 transition-all resize-none"
                />
                <Button type="submit" disabled={!inputValue.trim() || isLoading}
                  className="rounded-xl w-11 h-11 p-0 flex items-center justify-center bg-green-500 text-white hover:scale-105 transition-transform flex-shrink-0 mt-1">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              <p className="text-[11px] text-muted-foreground mt-2">Shift+Enter para nova linha • Enter para enviar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
