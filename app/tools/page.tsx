"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Library, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolsPage() {
  const [library, setLibrary] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('library_resources')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setLibrary(data);
    } catch (e) {
      console.error(e);
    }
  };

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
          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-4 metallic-text">Biblioteca Pro</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Acelere seu fluxo de trabalho com materiais prontos, brushes exclusivos e contratos editáveis para estúdios profissionais.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Opção de Acesso Completo */}
          <div className="glass rounded-3xl border border-primary/50 overflow-hidden flex flex-col group hover:border-primary transition-colors bg-primary/5 relative col-span-1 md:col-span-2 lg:col-span-3">
            <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
              Mais Vantajoso
            </div>
            <div className="p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-3">Acesso VIP a tudo</h3>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Destrave imediatamente TODOS os materiais da biblioteca, além de receber atualizações futuras sem pagar nada a mais por isso.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> +50 Brushes Exclusivos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Contratos Validados
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> E-books Técnicos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary" /> Atualizações grátis
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0">
                <Button 
                  onClick={() => handleCheckout("Acesso Completo à Biblioteca")}
                  className="w-full md:w-64 metallic-gradient text-black font-bold py-8 text-lg rounded-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
                >
                  Liberar Acesso Total <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-12 mb-4">
             <h2 className="text-2xl font-bold uppercase tracking-widest text-center text-white/50">Ou compre avulso</h2>
             <div className="w-24 h-px bg-white/10 mx-auto mt-4"></div>
          </div>

          {/* Produtos Avulsos */}
          {library.map((item) => (
            <div key={item.id} className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors bg-white/[0.02]">
              <div className="p-8 flex flex-col flex-1 text-center items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Library className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 leading-tight">{item.title}</h3>
                <p className="text-xs text-primary uppercase tracking-widest mb-6">Arquivo {item.resource_type}</p>
                <p className="text-muted-foreground text-sm mb-8 flex-1">
                  Ferramenta individual desenvolvida para economizar horas no seu dia a dia.
                </p>
                <Button 
                  onClick={() => handleCheckout(item.title)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-6 rounded-xl transition-colors"
                >
                  Comprar Avulso
                </Button>
              </div>
            </div>
          ))}
          
          {library.length === 0 && (
            <div className="col-span-3 text-center py-20 text-muted-foreground">
              Em breve novas ferramentas disponíveis.
            </div>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© 2026 Ink Authority. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs">Desenvolvido para criadores e tatuadores profissionais.</p>
      </footer>
    </main>
  );
}
