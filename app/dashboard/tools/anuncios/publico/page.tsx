"use client";

import { useState } from "react";
import { Users, ArrowLeft, ArrowRight, CheckCircle2, Bot, User, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";

const WELCOME = "Olá! Sou o Agente de Público da Ink Authority. Vou te ajudar a entender quem é o seu cliente ideal e como falar com ele. Preencha o formulário ao lado para eu começar a análise do seu perfil! 🎯";

export default function PublicoPage() {
  // Profile form state
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cidade: "",
    estilo: "",
    instagram: "",
    site: "",
    tempo: "",
    objetivo: "",
  });

  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({
          api: "/api/chat-ads",
          body: { agentType: "publico" },
        }),
        messages: [
          {
            id: "welcome",
            role: "assistant",
            parts: [{ type: "text", text: WELCOME }],
          } as any,
        ],
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.cidade || !form.estilo) return;

    const text = `Segue meu perfil para análise:

👤 Nome / Estúdio: ${form.nome}
📍 Cidade: ${form.cidade}
🎨 Estilo de tatuagem: ${form.estilo}
📱 Instagram: ${form.instagram || "não informado"}
🌐 Site: ${form.site || "não tenho"}
⏱️ Tempo no mercado: ${form.tempo || "não informado"}
🎯 Objetivo principal: ${form.objetivo || "atrair mais clientes"}

Por favor, faça uma análise completa do meu público-alvo e personas.`;

    setSubmitted(true);
    sendMessage({ role: "user", parts: [{ type: "text", text }] } as any);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/20 flex items-center gap-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard/tools/anuncios" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-lg font-black uppercase tracking-tighter">Agente de Público</h1>
          <p className="text-xs text-muted-foreground">Análise de personas e público-alvo para tatuadores</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Profile Form */}
        <div className={`w-80 flex-shrink-0 border-r border-border/20 flex flex-col transition-all ${submitted ? "opacity-60" : ""}`}>
          <div className="p-5 flex-1 overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">
              Seu Perfil
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nome / Estúdio *
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  disabled={submitted}
                  placeholder="Ex: João Silva Tattoo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Cidade *
                </label>
                <input
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  disabled={submitted}
                  placeholder="Ex: São Paulo - SP"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Estilo de Tatuagem *
                </label>
                <input
                  value={form.estilo}
                  onChange={(e) => setForm({ ...form, estilo: e.target.value })}
                  disabled={submitted}
                  placeholder="Ex: Realismo, Fine Line, Blackwork"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Instagram
                </label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  disabled={submitted}
                  placeholder="@seuinstagram"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Site (se tiver)
                </label>
                <input
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  disabled={submitted}
                  placeholder="www.seusite.com.br"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Tempo no mercado
                </label>
                <select
                  value={form.tempo}
                  onChange={(e) => setForm({ ...form, tempo: e.target.value })}
                  disabled={submitted}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                >
                  <option value="">Selecionar</option>
                  <option value="menos de 1 ano">Menos de 1 ano</option>
                  <option value="1 a 3 anos">1 a 3 anos</option>
                  <option value="3 a 5 anos">3 a 5 anos</option>
                  <option value="mais de 5 anos">Mais de 5 anos</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Objetivo principal
                </label>
                <select
                  value={form.objetivo}
                  onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
                  disabled={submitted}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400/50 disabled:opacity-50"
                >
                  <option value="">Selecionar</option>
                  <option value="atrair mais clientes">Atrair mais clientes</option>
                  <option value="cobrar mais caro">Cobrar preços mais altos</option>
                  <option value="crescer no instagram">Crescer no Instagram</option>
                  <option value="montar equipe">Montar equipe / estúdio maior</option>
                  <option value="vender cursos">Vender cursos online</option>
                </select>
              </div>

              {!submitted ? (
                <Button
                  type="submit"
                  disabled={!form.nome || !form.cidade || !form.estilo}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold h-10 rounded-xl flex items-center gap-2"
                >
                  Analisar Meu Público <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold py-2">
                  <CheckCircle2 className="w-4 h-4" /> Perfil enviado!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((m) => {
                const textContent =
                  m.parts
                    ?.filter((p: any) => p.type === "text")
                    .map((p: any) => p.text)
                    .join("") ?? (m as any).content ?? "";

                return (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      m.role === "user" ? "bg-foreground/10 border-border/20" : "bg-purple-500/20 border-purple-400/30"
                    }`}>
                      {m.role === "user" ? (
                        <User className="w-4 h-4 text-foreground" />
                      ) : (
                        <Users className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-foreground/5 border border-border/10 rounded-tr-none"
                        : "bg-purple-500/5 border border-purple-400/10 rounded-tl-none"
                    }`}>
                      {textContent}
                    </div>
                  </div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500/20 border border-purple-400/30">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-400/10 rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-5 border-t border-border/20">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleChatSubmit} className="relative flex items-center">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={submitted ? "Faça uma pergunta de acompanhamento..." : "Preencha o formulário ao lado para começar"}
                  disabled={isLoading || !submitted}
                  className="w-full bg-foreground/5 border border-border/20 rounded-full py-3.5 pl-5 pr-14 text-[14px] focus:outline-none focus:border-purple-400/50 transition-all disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || !submitted}
                  className="absolute right-1.5 rounded-full w-10 h-10 p-0 flex items-center justify-center bg-purple-500 text-white hover:scale-105 transition-transform"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
