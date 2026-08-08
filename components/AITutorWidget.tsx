"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 neon-glow"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Janela de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b border-white/10 bg-black/50 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Tutor Ink Authority</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <Bot className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Olá! Sou o tutor inteligente da Ink Authority. Como posso ajudar nos seus estudos hoje?
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-white/10' : 'bg-primary/20'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-none' 
                      : 'bg-primary/10 text-white border border-primary/20 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/50 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Pergunte algo sobre tatuagem..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input || isLoading}
                className="absolute right-2 p-2 bg-primary text-black rounded-full disabled:opacity-50 hover:scale-105 transition-transform"
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
