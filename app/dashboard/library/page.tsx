"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Download, FileText, FileCode, Brush, Search, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function LibraryPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = ["Todos", "Contratos", "Procreate", "Marketing", "Planilhas", "Outros"];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('library_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error("Erro ao carregar biblioteca:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type === 'PDF' || type === 'DOCX') return <FileText className="w-8 h-8" />;
    if (type === 'BRUSH' || type === 'IMAGE') return <Brush className="w-8 h-8" />;
    return <FileCode className="w-8 h-8" />;
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
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Biblioteca Pro</h1>
          <p className="text-muted-foreground">Baixe materiais, contratos, brushes e templates exclusivos.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Buscar material..." 
            className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((cat, i) => (
          <button 
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Materiais */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando acervo...</div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/10 text-muted-foreground">
           <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
           <p>Nenhum material encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.id}
              className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  {getIconForType(item.resource_type)}
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded uppercase tracking-widest text-white/50">
                  {item.resource_type}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 leading-tight flex-1">{item.title}</h3>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-muted-foreground">{item.file_size}</span>
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(item.file_url)}
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-black transition-colors rounded-full px-4 text-xs font-bold"
                >
                  <Download className="w-3 h-3 mr-2" /> Baixar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
