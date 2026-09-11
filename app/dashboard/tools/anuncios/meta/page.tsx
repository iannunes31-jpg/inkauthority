"use client";

import { Instagram, ArrowLeft, User, Send, Loader2, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

const WELCOME = `Olá! Sou o Agente de Meta Ads da Ink Authority. 📱

Vou te ajudar a criar campanhas no Facebook e Instagram que atraem clientes de tatuagem na sua região.

Para começar, me conta:
1. Qual é a sua cidade/estado?
2. Qual estilo de tatuagem você faz?
3. Você prefere campanhas de mensagem (WhatsApp/DM) ou tráfego para o site?
4. Qual o seu orçamento mensal para Meta Ads?`;

const TIPS = [
  "Montar o público ideal para tatuagem",
  "Escrever copy que converte",
  "Briefing de vídeo/foto para o criativo",
  "Como usar o Pixel do Meta",
  "Campanha de remarketing para seguidores",
  "Objetivo: mensagem ou conversão?",
];

export default function MetaAdsPage() {
  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({ api: "/api/chat-ads", body: { agentType: "meta" } }),
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
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
          <Instagram className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-black uppercase tracking-tighter">Campanha Meta Ads</h1>
          <p className="text-xs text-muted-foreground">Facebook & Instagram Ads para tatuadores</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0 border-r border-border/20 p-4 flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-pink-400 mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Perguntas Rápidas
          </p>
          {TIPS.map((tip) => (
            <button key={tip} onClick={() => sendMessage({ role: "user", parts: [{ type: "text", text: tip }] } as any)} disabled={isLoading}
              className="text-left text-xs bg-white/5 hover:bg-pink-500/10 border border-white/10 hover:border-pink-400/30 rounded-xl px-3 py-2.5 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50">
              {tip}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((m) => {
                const text = m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? (m as any).content ?? "";
                return (
                  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${m.role === "user" ? "bg-foreground/10 border-border/20" : "bg-pink-500/20 border-pink-400/30"}`}>
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Instagram className="w-4 h-4 text-pink-400" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "bg-foreground/5 border border-border/10 rounded-tr-none" : "bg-pink-500/5 border border-pink-400/10 rounded-tl-none"}`}>
                      {text}
                    </div>
                  </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-pink-500/20 border border-pink-400/30">
                    <Instagram className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-400/10 rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-5 border-t border-border/20">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Pergunte sobre Meta Ads..." disabled={isLoading}
                  className="w-full bg-foreground/5 border border-border/20 rounded-full py-3.5 pl-5 pr-14 text-[14px] focus:outline-none focus:border-pink-400/50 transition-all" />
                <Button type="submit" disabled={!inputValue.trim() || isLoading}
                  className="absolute right-1.5 rounded-full w-10 h-10 p-0 flex items-center justify-center bg-pink-500 text-white hover:scale-105 transition-transform">
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
