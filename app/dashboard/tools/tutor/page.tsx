"use client";

import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, User, Send, Loader2, Sparkles, Lock } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { useStickToBottom } from "@/lib/use-stick-to-bottom";
import { Button } from "@/components/ui/button";

export default function AssistantPage() {
  const STORAGE_KEY = "tutor-chat-v1";
  const WELCOME = "Olá! Sou o Tutor IA Especialista da Ink Authority. Posso te ajudar com **sugestão de agulhas**, **escolha de pigmentos**, **planejamento de sessão** e qualquer dúvida técnica sobre tatuagem. Como posso ajudar hoje?";

  const savedMessages = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: "welcome", role: "assistant", parts: [{ type: "text", text: WELCOME }] }];
  }, []);

  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        onError: (err: Error) => {
          alert("Erro na IA: " + err.message);
        },
        messages: savedMessages,
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";

  // Persist chat across tool navigation (cleared on browser close)
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useStickToBottom(scrollContainerRef, messages);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background relative">
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
            <p className="text-sm text-muted-foreground">Sugestão de agulhas, pigmentos, planejamento de sessão e dúvidas técnicas sobre tatuagem.</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8">
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
                <div className={`p-5 rounded-2xl max-w-[85%] ${
                  m.role === "user"
                    ? "bg-foreground/5 text-foreground border border-border/10 rounded-tr-none"
                    : "bg-primary/5 text-foreground border border-primary/10 rounded-tl-none"
                }`}>
                  <ChatMarkdown text={textContent} />
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
              className="absolute right-2 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary text-primary-foreground hover:scale-105 transition-transform"
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
