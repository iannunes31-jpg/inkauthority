"use client";

import { useSearchParams } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Activity, MessageSquare } from "lucide-react";
import { Suspense } from "react";

function LiveStreamContent() {
  const searchParams = useSearchParams();
  const liveId = searchParams.get("id");

  if (!liveId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhuma transmissão selecionada</h2>
        <p className="text-muted-foreground">Volte para o painel principal e selecione uma live ativa.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Ao Vivo
          </div>
          <h1 className="text-2xl font-bold text-white">Transmissão Exclusiva</h1>
        </div>
        
        {/* O Cloudflare Stream lida automaticamente com inputs de Live pelo mesmo Player usando o ID */}
        <VideoPlayer videoId={liveId} className="shadow-2xl shadow-primary/10 border-primary/20" />
        
        <div className="glass p-6 rounded-2xl border border-white/5 mt-6">
          <h2 className="text-lg font-bold mb-2">Sobre esta transmissão</h2>
          <p className="text-muted-foreground text-sm">
            Esta é uma aula ao vivo. A gravação ficará disponível na plataforma assim que a transmissão for encerrada.
          </p>
        </div>
      </div>

      {/* Chat Placeholder */}
      <div className="glass rounded-2xl border border-white/10 flex flex-col h-[600px] lg:h-auto">
        <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-black/40">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Chat ao Vivo</h3>
        </div>
        
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center opacity-50">
          <MessageSquare className="w-10 h-10 mb-2" />
          <p className="text-sm">O chat será ativado em breve.</p>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/40">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-muted-foreground cursor-not-allowed">
            Envie uma mensagem...
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentLivePage() {
  return (
    <div className="pb-20 p-6 lg:p-10">
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center">Carregando...</div>}>
        <LiveStreamContent />
      </Suspense>
    </div>
  );
}
