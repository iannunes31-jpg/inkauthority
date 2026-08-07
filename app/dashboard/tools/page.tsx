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
        {/* Assistente Authority Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all flex flex-col h-full"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          
          <h2 className="text-xl font-bold mb-3">Assistente Authority</h2>
          <p className="text-sm text-muted-foreground mb-6 font-light">
            Seu braço direito digital. Ele atende orçamentos no WhatsApp, entende referências de imagens, passa os seus valores e cadastra o cliente direto na sua agenda.
          </p>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Settings className="w-4 h-4" /> Configurar Tatuador
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Calendar className="w-4 h-4" /> Ver Agenda Inteligente
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Users className="w-4 h-4" /> CRM de Clientes
            </div>
            
            <Link href="/dashboard/tools/assistant" className="mt-4 block w-full">
              <Button className="w-full metallic-gradient text-black font-bold uppercase tracking-widest text-[10px]">
                Acessar Módulo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Placeholder para futuras IAs */}
        <div className="glass p-6 rounded-2xl border border-white/5 opacity-50 flex flex-col items-center justify-center text-center min-h-[300px] border-dashed">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-lg font-bold mb-2">Novo Agente (Em Breve)</h2>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Mais agentes especializados em criação de artes e gestão financeira serão liberados em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
