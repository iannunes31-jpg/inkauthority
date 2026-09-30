"use client";

import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export interface AdsChatAgentProps {
  agentType: string;
  welcomeMessage: string;
  placeholder: string;
  icon: React.ReactNode;
  accentColor?: string; // tailwind bg color class e.g. "bg-blue-500"
  /** Optional form rendered above the chat for initial profile collection */
  profileForm?: React.ReactNode;
  /** When set, the form submit sends this text as the first user message */
  onFormSubmit?: (sendMessage: (text: string) => void) => void;
}

export function AdsChatAgent({
  agentType,
  welcomeMessage,
  placeholder,
  icon,
  accentColor = "bg-primary",
  profileForm,
}: AdsChatAgentProps) {
  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({
          api: "/api/chat-ads",
          body: { agentType },
        }),
        onError: (err: Error) => {
          alert("Erro na IA: " + err.message);
        },
        messages: [
          {
            id: "welcome",
            role: "assistant",
            parts: [{ type: "text", text: welcomeMessage }],
          } as any,
        ],
      }),
    [agentType, welcomeMessage]
  );

  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: inputValue }] } as any);
    setInputValue("");
  };

  const handleSendText = (text: string) => {
    sendMessage({ role: "user", parts: [{ type: "text", text }] } as any);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Profile Form (optional) */}
      {profileForm && (
        <div className="border-b border-border/20 p-6 bg-background/95">
          {typeof profileForm === "function"
            ? (profileForm as any)(handleSendText)
            : profileForm}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m) => {
            const textContent =
              m.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("") ?? (m as any).content ?? "";

            return (
              <div
                key={m.id}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    m.role === "user"
                      ? "bg-foreground/10 border-border/20"
                      : "bg-primary/20 border-primary/30"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-5 h-5 text-foreground" />
                  ) : (
                    <div className="text-primary">{icon}</div>
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl text-[14px] leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-foreground/5 text-foreground border border-border/10 rounded-tr-none"
                      : "bg-primary/5 text-foreground border border-primary/10 rounded-tl-none"
                  }`}
                >
                  {textContent}
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 border border-primary/30">
                <div className="text-primary">{icon}</div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-5 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-foreground/5 border border-border/20 rounded-full py-3.5 pl-5 pr-14 text-[14px] text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1.5 rounded-full w-11 h-11 p-0 flex items-center justify-center bg-primary text-black hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            A IA pode cometer erros. Verifique informações antes de aplicar.
          </p>
        </div>
      </div>
    </div>
  );
}
