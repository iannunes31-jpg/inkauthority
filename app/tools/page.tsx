"use client";

import { CheckCircle, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolsPage() {
  const handleCheckout = (productName: string) => {
    alert(`Redirecionando para o checkout seguro de: ${productName}.`);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-12 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <div className="w-8 h-8 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow">
             <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Ink Authority</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover:bg-white/5" onClick={() => window.location.href = "/"}>
            Voltar
          </Button>
        </div>
      </header>

      <section className="pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-4 metallic-text">Ferramentas IA</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Evolua sua arte com inteligência artificial. Nossa ferramenta foi treinada exclusivamente com técnicas avançadas de tatuagem.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {/* Opção Principal de IA */}
          <div className="glass rounded-3xl border border-primary/50 overflow-hidden flex flex-col group hover:border-primary transition-colors bg-primary/5 relative">
            <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
              Lançamento
            </div>
            <div className="p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black mb-3">Tutor IA Especialista</h3>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Seu mentor particular 24 horas por dia. Nossa IA analisa suas dúvidas, sugere agulhas, pigmentos, voltagens e ajuda você a planejar suas sessões de tatuagem com precisão cirúrgica.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Planejamento de Sessão
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Análise de Pigmentos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Mentoria Técnica 24h
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Suporte Ilimitado
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0">
                <Button 
                  onClick={() => handleCheckout("Tutor IA Especialista")}
                  className="w-full md:w-64 metallic-gradient text-black font-bold py-8 text-lg rounded-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
                >
                  Assinar Ferramenta IA <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© 2026 Ink Authority. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Desenvolvido para criadores e tatuadores profissionais.</p>
      </footer>
    </main>
  );
}
