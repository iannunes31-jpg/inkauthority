"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, FileText, Search, Library, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser, useAuth } from "@clerk/nextjs";

export default function LibraryPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Default active PDF asset (Instagram + ChatGPT para Tatuadores)
  const defaultPdfAsset = {
    id: "guia-instagram-chatgpt-pdf",
    title: "Guia Prático: Instagram + ChatGPT para Tatuadores",
    description: "Como utilizar Inteligência Artificial para gerar conteúdos de alto impacto, criar legendas persuasivas e atrair clientes diariamente no Instagram.",
    category: "Marketing",
    resource_type: "PDF",
    file_size: "4.8 MB",
    file_url: "/library/guia-instagram-chatgpt.pdf",
    badge: "DOCUMENTO EXCLUSIVO PRO",
    neon_glow: "shadow-[0_0_35px_rgba(56,189,248,0.35)] border-cyan-400/50 hover:shadow-[0_0_55px_rgba(56,189,248,0.6)]",
    badge_bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(56,189,248,0.4)]",
    button_bg: "bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
  };

  const categories = ["Todos", "Marketing", "Contratos", "Procreate", "Planilhas", "Outros"];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data: libraryData, error: libraryError } = await supabase
        .from('library_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (!libraryError && libraryData && libraryData.length > 0) {
        setResources(libraryData);
      } else {
        // Fallback to default asset if Supabase returns 0 items or table is pending
        setResources([defaultPdfAsset]);
      }
    } catch (err) {
      console.log("Usando acervo padrão da biblioteca:", err);
      setResources([defaultPdfAsset]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = activeCategory === "Todos" 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Acervo Oficial</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Biblioteca Pro</h1>
          <p className="text-muted-foreground">Baixe materiais práticos, e-books, manuais e guias estratégicos exclusivos.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Buscar material..." 
            className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {categories.map((cat, i) => (
          <button 
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.5)]" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Materiais com Destaque Neon */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando acervo...</div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/10 text-muted-foreground">
           <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
           <p>Nenhum material encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((item, i) => {
            const glowClass = item.neon_glow || "shadow-[0_0_35px_rgba(56,189,248,0.35)] border-cyan-400/50 hover:shadow-[0_0_55px_rgba(56,189,248,0.6)]";
            const badgeBg = item.badge_bg || "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(56,189,248,0.4)]";
            const btnBg = item.button_bg || "bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]";

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id || i}
                className={`bg-black/80 backdrop-blur-xl p-6 rounded-3xl border ${glowClass} transition-all duration-300 flex flex-col h-full relative group overflow-hidden``}
              >
                {/* Visual Cover Header with Neon Banner */}
                <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-900 via-black to-slate-950 border border-white/10 mb-5 p-5 flex flex-col justify-between overflow-hidden group-hover:border-cyan-400/40 transition-colors">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_60%)]"></div>
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border uppercase ${badgeBg}``}>
                      {item.badge || "DOCUMENTO PDF"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-white font-black text-lg leading-snug tracking-tight mb-1 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-white/50 line-clamp-2">
                      {item.description || "Manual prático com diretrizes e templates prontos."}
                    </p>
                  </div>
                </div>
                
                {/* Footer Info & Download Button */}
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acesso Liberado
                    </div>
                    <span className="font-mono text-[11px] text-white/60">{item.file_size || "4.8 MB"}</span>
                  </div>

                  <Button 
                    size="lg" 
                    onClick={() => handleDownload(item.file_url || "/library/guia-instagram-chatgpt.pdf")}
                    className={`w-full font-extrabold uppercase tracking-wider text-xs rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${btnBg}``}
                  >
                    <Download className="w-4 h-4" /> Baixar Documento PDF
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
