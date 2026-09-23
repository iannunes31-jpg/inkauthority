"use client";

import { motion } from "motion/react";
import {
  Users,
  Search,
  Instagram,
  Music2,
  BarChart2,
  PenLine,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const agents = [
  {
    href: "/dashboard/tools/anuncios/publico",
    icon: <Users className="w-6 h-6" />,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "hover:border-purple-400/50",
    label: "Agente de Público",
    description:
      "Analisa seu perfil e identifica quem é o seu cliente ideal, onde ele está e como falar com ele.",
    tags: ["Personas", "Tom de voz", "Canais"],
  },
  {
    href: "/dashboard/tools/anuncios/google",
    icon: <Search className="w-6 h-6" />,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "hover:border-blue-400/50",
    label: "Campanha Google Ads",
    description:
      "Cria campanhas de pesquisa no Google para aparecer quando clientes buscam tatuagem na sua cidade.",
    tags: ["Palavras-chave", "Anúncios", "Budget"],
  },
  {
    href: "/dashboard/tools/anuncios/meta",
    icon: <Instagram className="w-6 h-6" />,
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "hover:border-pink-400/50",
    label: "Campanha Meta Ads",
    description:
      "Estrutura campanhas no Facebook e Instagram com público, copy e brief criativo para atrair clientes locais.",
    tags: ["Facebook", "Instagram", "Remarketing"],
  },
  {
    href: "/dashboard/tools/anuncios/tiktok",
    icon: <Music2 className="w-6 h-6" />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "hover:border-cyan-400/50",
    label: "Campanha TikTok Ads",
    description:
      "Cria campanhas e roteiros de vídeo para TikTok Ads, além de estratégias de conteúdo orgânico.",
    tags: ["In-Feed", "Spark Ads", "Viral"],
  },
  {
    href: "/dashboard/tools/anuncios/analise",
    icon: <BarChart2 className="w-6 h-6" />,
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "hover:border-green-400/50",
    label: "Análise de Campanha",
    description:
      "Cole os dados da sua campanha aqui. A IA analisa as métricas e sugere otimizações práticas.",
    tags: ["CTR", "ROAS", "Otimização"],
  },
  {
    href: "/dashboard/tools/anuncios/conteudo",
    icon: <PenLine className="w-6 h-6" />,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "hover:border-amber-400/50",
    label: "Criação de Conteúdo",
    description:
      "Gera legendas, roteiros de reels, hashtags e calendário editorial para crescer no Instagram e TikTok.",
    tags: ["Captions", "Reels", "Calendário"],
  },
];

export default function AnunciosPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3 block">
          Ferramentas
        </span>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
          Central de Anúncios
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Seis agentes de IA especializados para te ajudar a criar campanhas, entender seu
          público, analisar resultados e gerar conteúdo — tudo voltado para o mercado de
          tatuagem.
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <motion.div
            key={agent.href}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Link href={agent.href} className="block h-full">
              <div
                className={`glass p-6 rounded-2xl border border-white/10 ${agent.border} transition-all h-full flex flex-col cursor-pointer group`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${agent.bg} flex items-center justify-center mb-5 ${agent.color}`}>
                  {agent.icon}
                </div>

                {/* Content */}
                <h2 className="text-base font-bold mb-2">{agent.label}</h2>
                <p className="text-sm text-muted-foreground font-light leading-relaxed flex-1">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wide bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className={`flex items-center gap-1.5 text-xs font-bold ${agent.color} group-hover:gap-2.5 transition-all`}>
                  Abrir Agente <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
