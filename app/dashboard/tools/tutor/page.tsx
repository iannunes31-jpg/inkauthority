"use client";

import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, User, Send, Loader2, Sparkles, Lock } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

export default function AssistantPage() {
  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        onError: (err: Error) => {
          alert("Erro na IA: " + err.message);
        },
        messages: [
          {
            id: "welcome",
            role: "assistant",
            parts: [{ type: "text", text: "Ola! Sou o seu Tutor IA Especialista da Ink Authority. Como posso ajudar voce a elevar o nivel da sua tatuagem hoje?" }],
          } as any,
        ],
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";

  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState("");

  const isAdmin = isAdminUser(user?.primaryEmailAddress?.emailAddress, user?.publicMetadata);

  useEffect(() => {
    if (user?.id) checkAccess();
  }, [user?.id]);

  const checkAccess = async () => {
    if (isAdmin) { setHasAccess(true); return; }
    try {
      const { data } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", user!.id)
        .in("product_type", ["subscription", "tools"]);
      setHasAccess(data && data.length > 0);
    } catch {
      setHasAccess(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "Especialistas IA Premium",
          price: 97.0,
          productId: "tools_premium",
          productType: "tools",
          isSubscription: true,
          returnUrl: "/dashboard/tools/tutor",
        }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erro ao carregar checkout.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (hasAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background relative">
      {!hasAccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="glass p-8 max-w-lg text-center rounded-3xl border border-white/10 shadow-2xl">
            <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-8">
              O Tutor IA Especialista e uma ferramenta exclusiva do plano Premium. Desbloqueie agora para tirar duvidas avancadas 24h por dia.
            </p>
            <Button onClick={handleCheckout} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg">
              Desbloquear Especialistas IA (R$ 97/mes)
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 border-b border-border/20 flex items-center bg-background/95 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              Tutor IA Especialista <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Tire duvidas sobre agulhas, pigmentos, tecnicas e marketing.</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((m) => {
            const textContent =
              m.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("") ?? (m as any).content ?? "";

            return (
              <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  m.role === "user" ? "bg-foreground/10 border-border/20" : "bg-primary/20 border-primary/30"
                }`}>
                  {m.role === "user" ? <User className="w-5 h-5 text-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
                </div>
                <div className={`p-5 rounded-2xl text-[15px] leading-relaxed max-w-[85%] ${
                  m.role === "user"
                    ? "bg-foreground/5 text-foreground border border-border/10 rounded-tr-none"
                    : "bg-primary/5 text-foreground border border-primary/10 rounded-tl-none"
                }`}>
                  {textContent.split("\n").map((line: string, i: number) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 border border-primary/30">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua duvida sobre tatuagem..."
              className="w-full bg-foreground/5 border border-border/20 rounded-full py-4 pl-6 pr-16 text-[15px] text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary text-black hover:scale-105 transition-transform"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            A IA pode cometer erros. Considere verificar informacoes criticas.
          </p>
        </div>
      </div>
    </div>
  );
}
