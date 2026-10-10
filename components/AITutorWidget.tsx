"use client";

import { useState, useRef, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { useStickToBottom } from "@/lib/use-stick-to-bottom";

export function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chat = useMemo(() => new Chat({ transport: new DefaultChatTransport({ api: "/api/chat" }) }), []);
  const { messages, sendMessage, status, error } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";
  const scrollRef = useRef<HTMLDivElement>(null);
  useStickToBottom(scrollRef, messages);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat com o Tutor IA"
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl ring-1 ring-border flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="h-16 border-b border-border bg-muted/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Tutor Ink Authority</h3>
                <p className="text-[10px] text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <Bot className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Olá! Sou o tutor inteligente da Ink Authority. Como posso ajudar nos seus estudos hoje?
                </p>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
              if (m.role === "assistant" && !text) return null;
              return (
                <div key={m.id} className={`flex gap-3 max-w-[90%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm min-w-0 ${
                      m.role === "user" ? "bg-muted rounded-tr-none" : "bg-primary/5 border border-border rounded-tl-none"
                    }`}
                  >
                    <ChatMarkdown text={text} className="text-[13px]" />
                  </div>
                </div>
              );
            })}

            {isLoading && !messages[messages.length - 1]?.parts?.some((p: any) => p.type === "text" && p.text) && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-primary/5 border border-border rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 text-center">Não consegui responder agora. Tente novamente.</p>
            )}
          </div>

          <div className="p-4 border-t border-border shrink-0">
            <form onSubmit={onSubmit} className="flex items-center gap-2 relative">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte algo sobre tatuagem..."
                className="w-full bg-muted border border-border rounded-full py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Enviar"
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:scale-105 transition-transform"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
