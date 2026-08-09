"use client";

import { motion } from "motion/react";
import { Bot, Settings, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Ferramentas de IA</h1>
        <p className="text-muted-foreground">Automatize seu estúdio com inteligência artificial treinada para tatuadores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tutor IA Especialista Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all flex flex-col h-full"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          
          <h2 className="text-xl font-bold mb-3">Tutor IA Especialista</h2>
          <p className="text-sm text-muted-foreground mb-6 font-light">
            Seu mentor particular 24 horas por dia. Nossa IA sugere agulhas, pigmentos e ajuda no planejamento cirúrgico.
          </p>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Bot className="w-4 h-4" /> Bate-papo Interativo
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Users className="w-4 h-4" /> Avaliação de Trabalhos
            </div>
            
            <Link href="/dashboard/tools/tutor" className="mt-4 block w-full">
              <Button className="w-full metallic-gradient text-black font-bold uppercase tracking-widest text-[10px]">
                Acessar Tutor
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Assistente WhatsApp Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-white/10 hover:border-[#25D366]/50 transition-all flex flex-col h-full"
        >
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center mb-6">
            {/* WhatsApp Icon */}
            <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-bold mb-3">Assistente WhatsApp</h2>
          <p className="text-sm text-muted-foreground mb-6 font-light">
            Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e cadastra o cliente direto na sua agenda.
          </p>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Settings className="w-4 h-4" /> Configurar Número
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Calendar className="w-4 h-4" /> Integração de Agenda
            </div>
            
            <Link href="/dashboard/tools/whatsapp" className="mt-4 block w-full">
              <Button className="w-full bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold uppercase tracking-widest text-[10px]">
                Acessar WhatsApp
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
