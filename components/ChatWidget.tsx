"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Olá! Como posso ajudar você hoje?" }
  ]);
  const [input, setInput] = useState("");

  // Número do WhatsApp que será enviado depois pelo usuário
  const whatsappNumber = "5511999999999"; 

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Adiciona a mensagem do usuário
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");

    // Resposta automática do Bot
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: "bot", 
          content: "Para um atendimento mais rápido e tirar todas as suas dúvidas, nossa equipe está disponível no WhatsApp! Clique no botão abaixo para falar com a gente." 
        }
      ]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform z-50 neon-glow"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-bold text-sm uppercase tracking-wider metallic-text">Suporte Online</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 h-64 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-lg text-sm max-w-[85%] leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-white text-black rounded-br-none font-medium" 
                      : "bg-white/10 text-white rounded-bl-none font-light"
                  }`}>
                    {msg.content}
                    {msg.role === "bot" && i > 0 && (
                      <a 
                        href={`https://wa.me/${whatsappNumber}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-3 block text-center bg-[#25D366] text-white font-bold py-2 px-4 rounded-md uppercase tracking-wider text-[11px] hover:opacity-90 transition-opacity"
                      >
                        Falar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10 bg-black flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
