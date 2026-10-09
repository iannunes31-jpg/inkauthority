"use client";

import { motion } from "motion/react";
import { Scissors, Grid3x3, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const specialists = [
  {
    href: "/dashboard/tools/artisticos/decalque",
    icon: <Scissors className="w-6 h-6" />,
    color: "text-[#4F8EF7]",
    bg: "bg-[#4F8EF7]/15",
    border: "hover:border-[#4F8EF7]/50",
    label: "Gerador de Decalque",
    description:
      "Transforma uma foto ou desenho em um traçado limpo, pronto para imprimir no papel de decalque.",
    tags: ["Linhas", "Sombras", "Traço fino"],
  },
  {
    href: "/dashboard/tools/artisticos/dividir-folhas",
    icon: <Grid3x3 className="w-6 h-6" />,
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/15",
    border: "hover:border-[#8B5CF6]/50",
    label: "Dividir Folhas para Impressão",
    description:
      "Divide um projeto grande em folhas A4 para imprimir e montar peça por peça, sem perder a escala.",
    tags: ["Escala", "A4", "Guias de montagem"],
  },
];

export default function ArtisticosPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3 block">
          Ferramentas
        </span>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
          Especialistas Artísticos
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Ferramentas para preparar a arte da tatuagem: do decalque pronto para o papel
          térmico à divisão de projetos grandes em folhas para impressão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {specialists.map((s) => (
          <motion.div
            key={s.href}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Link href={s.href} className="block h-full">
              <div className={`glass p-6 rounded-2xl border border-white/10 ${s.border} transition-all h-full flex flex-col cursor-pointer group`}>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-5 ${s.color}`}>
                  {s.icon}
                </div>
                <h2 className="text-base font-bold mb-2">{s.label}</h2>
                <p className="text-sm text-muted-foreground font-light leading-relaxed flex-1">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wide bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${s.color} group-hover:gap-2.5 transition-all`}>
                  Abrir Especialista <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
