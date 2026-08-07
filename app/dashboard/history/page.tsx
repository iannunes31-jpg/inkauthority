"use client";

import { motion } from "motion/react";
import { History, Calendar, CheckCircle, Video, Download as DownloadIcon, CreditCard } from "lucide-react";

export default function HistoryPage() {
  const events = [
    {
      id: 1,
      type: "purchase",
      title: "Compra: Curso Marketing e Posicionamento PRO",
      date: "Hoje, 14:32",
      icon: <CreditCard className="w-5 h-5 text-green-400" />,
      color: "border-green-500/30 bg-green-500/5",
    },
    {
      id: 2,
      type: "video",
      title: "Aula assistida: O Segredo do Perfil Magnético",
      date: "Ontem, 20:15",
      icon: <Video className="w-5 h-5 text-primary" />,
      color: "border-primary/30 bg-primary/5",
    },
    {
      id: 3,
      type: "download",
      title: "Download: Contrato de Prestação de Serviço (Tatuagem)",
      date: "10 de Julho, 09:10",
      icon: <DownloadIcon className="w-5 h-5 text-blue-400" />,
      color: "border-blue-500/30 bg-blue-500/5",
    },
    {
      id: 4,
      type: "completion",
      title: "Certificado Emitido: Biossegurança Básica",
      date: "05 de Julho, 18:00",
      icon: <CheckCircle className="w-5 h-5 text-yellow-400" />,
      color: "border-yellow-500/30 bg-yellow-500/5",
    },
    {
      id: 5,
      type: "video",
      title: "Aula assistida: Como atrair clientes alto padrão",
      date: "02 de Julho, 14:20",
      icon: <Video className="w-5 h-5 text-primary" />,
      color: "border-primary/30 bg-primary/5",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
          <History className="w-8 h-8 text-primary" /> Histórico
        </h1>
        <p className="text-muted-foreground">Sua linha do tempo de atividades e aprendizado na plataforma.</p>
      </div>

      <div className="relative border-l border-white/10 ml-6 pl-8 space-y-10">
        {events.map((event, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={event.id}
            className="relative"
          >
            {/* Bolinha da Timeline */}
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-black border-2 border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>

            <div className={`p-5 rounded-2xl border ${event.color} glass flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center shrink-0 border border-white/5">
                  {event.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white/90 leading-tight mb-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/50 font-medium">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-10 flex justify-center">
        <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
          Carregar eventos anteriores
        </button>
      </div>
    </div>
  );
}
