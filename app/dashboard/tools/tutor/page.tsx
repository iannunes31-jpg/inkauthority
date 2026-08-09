// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AssistantPage() {
  const { messages, sendMessage, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Olá! Sou o seu Tutor IA Especialista da Ink Authority. Como posso ajudar você a elevar o nível da sua tatuagem hoje?"
      }
    ]
  });

  const [input, setInput] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;
    if (sendMessage) sendMessage(input);
    setInput("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-background relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border/20 flex items-center justify-between bg-background/95 backdrop-blur-sm z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              Tutor IA Especialista <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">Tire dúvidas sobre agulhas, pigmentos, técnicas e marketing.</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                m.role === 'user' 
                  ? 'bg-foreground/10 border-border/20' 
                  : 'bg-primary/20 border-primary/30'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div 
                className={`p-5 rounded-2xl text-[15px] leading-relaxed max-w-[85%] ${
                  m.role === 'user' 
                    ? 'bg-foreground/5 text-foreground border border-border/10 rounded-tr-none' 
                    : 'bg-primary/5 text-foreground border border-primary/10 rounded-tl-none shadow-[0_0_30px_rgba(229,231,235,0.03)]'
                }`}
              >
                {/* Basic rendering. For a real app, react-markdown would be used here */}
                {m.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua dúvida sobre tatuagem..."
              className="w-full bg-foreground/5 border border-border/20 rounded-full py-4 pl-6 pr-16 text-[15px] text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="absolute right-2 rounded-full w-12 h-12 p-0 flex items-center justify-center bg-primary text-black hover:scale-105 transition-transform"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            A IA pode cometer erros. Considere verificar informações críticas.
          </p>
        </div>
      </div>
    </div>
  );
}
