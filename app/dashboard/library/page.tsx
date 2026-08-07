"use client";

import { motion } from "motion/react";
import { Download, FileText, FileCode, Brush, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
  const categories = ["Todos", "Contratos", "Procreate", "Marketing", "Planilhas"];
  
  const resources = [
    { id: 1, title: "Contrato de Prestação de Serviço (Tatuagem)", type: "PDF", icon: <FileText className="w-8 h-8" />, size: "120 KB" },
    { id: 2, title: "Pack de Brushes de Sombreamento Procreate", type: "BRUSH", icon: <Brush className="w-8 h-8" />, size: "15 MB" },
    { id: 3, title: "Ficha de Anamnese Digital", type: "PDF", icon: <FileText className="w-8 h-8" />, size: "85 KB" },
    { id: 4, title: "Planilha de Precificação Inteligente", type: "XLSX", icon: <FileCode className="w-8 h-8" />, size: "2.1 MB" },
    { id: 5, title: "Script de Vendas pelo WhatsApp", type: "DOCX", icon: <FileText className="w-8 h-8" />, size: "45 KB" },
    { id: 6, title: "Pack de Artes Editáveis Canva", type: "LINK", icon: <Brush className="w-8 h-8" />, size: "Online" },
  ];

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
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              i === 0 ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.id}
            className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded uppercase tracking-widest text-white/50">
                {item.type}
              </span>
            </div>
            
            <h3 className="font-bold text-lg mb-2 leading-tight flex-1">{item.title}</h3>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-muted-foreground">{item.size}</span>
              <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary hover:text-black transition-colors rounded-full px-4 text-xs font-bold">
                <Download className="w-3 h-3 mr-2" /> Baixar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
