"use client";

import { CheckCircle, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolsPage() {
  const handleCheckout = async (productName: string, price: number, isSubscription: boolean = true) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, price, isSubscription }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar checkout.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao iniciar checkout.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      
      {/* Header Fixo */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-12 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary neon-glow">
            <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
          </svg>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Opção Principal de IA */}
          <div className="glass rounded-3xl border border-primary/50 overflow-hidden flex flex-col group hover:border-primary transition-colors bg-primary/5 relative">
            <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
              Mais Vendido
            </div>
            <div className="p-8 lg:p-12 flex flex-col items-center text-center gap-8 flex-1">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                <Bot className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-3">Tutor IA Especialista</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Seu mentor particular 24 horas por dia. Nossa IA sugere agulhas, pigmentos e ajuda no planejamento cirúrgico.
                </p>
                <div className="grid grid-cols-1 gap-4 mb-8 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Planejamento de Sessão
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Análise de Pigmentos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Mentoria Técnica 24h
                  </div>
                </div>
              </div>
              <div className="w-full mt-auto">
                <div className="mb-6">
                  <span className="text-4xl font-black">R$ 57</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <Button 
                  onClick={() => handleCheckout("Tutor IA Especialista", 57)}
                  className="w-full metallic-gradient text-black font-bold py-8 text-lg rounded-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
                >
                  Assinar Tutor <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Assistente de WhatsApp */}
          <div className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-[#25D366]/50 transition-colors bg-white/[0.02] relative">
            <div className="absolute top-4 right-4 bg-[#25D366] text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#25D366]/20">
              Novo
            </div>
            <div className="p-8 lg:p-12 flex flex-col items-center text-center gap-8 flex-1">
              <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] mb-2">
                {/* Ícone de Mensagem/WhatsApp Genérico */}
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-3">Assistente WhatsApp</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Automatize seus orçamentos. A IA conversa com os clientes no WhatsApp, entende a ideia da tattoo e já sugere valores baseados na sua tabela.
                </p>
                <div className="grid grid-cols-1 gap-4 mb-8 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-[#25D366]" /> Orçamentos Automáticos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-[#25D366]" /> Agendamento de Horários
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-[#25D366]" /> Triagem de Clientes 24h
                  </div>
                </div>
              </div>
              <div className="w-full mt-auto">
                <div className="mb-6">
                  <span className="text-4xl font-black">R$ 357</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <Button 
                  onClick={() => handleCheckout("Assistente WhatsApp", 357)}
                  className="w-full bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold py-8 text-lg rounded-xl transition-colors shadow-2xl shadow-[#25D366]/20"
                >
                  Assinar Assistente <ArrowRight className="w-5 h-5 ml-2" />
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
