"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Radio, Calendar, Play } from "lucide-react";
import Link from "next/link";

interface Live {
  id: string;
  title: string;
  description: string;
  cloudflare_stream_id: string;
  status: "scheduled" | "live" | "ended";
  scheduled_for: string;
}

export default function LivesDashboardPage() {
  const [lives, setLives] = useState<Live[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLives = async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("scheduled_for", { ascending: false });

      if (data && !error) {
        setLives(data);
      }
      setIsLoading(false);
    };

    fetchLives();
  }, []);

  return (
    <div className="pb-20 p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Radio className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Aulas ao Vivo</h1>
          <p className="text-muted-foreground">Assista as transmissões em tempo real com a comunidade.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-white/50 text-sm py-10 animate-pulse">Carregando...</div>
      ) : lives.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-10 glass rounded-2xl border border-white/5">
          Nenhuma transmissão programada no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lives.map((live) => (
            <Link key={live.id} href={`/dashboard/live?id=${live.cloudflare_stream_id}`}>
              <div className="glass group rounded-2xl border border-white/5 overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                <div className="aspect-video bg-black/50 relative flex items-center justify-center border-b border-white/5">
                  <Play className="w-12 h-12 text-white/20 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                  
                  {live.status === "live" && (
                    <div className="absolute top-4 left-4 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse border border-red-500/50 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Ao Vivo Agora
                    </div>
                  )}
                  {live.status === "ended" && (
                    <div className="absolute top-4 left-4 bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                      Encerrada (Gravação)
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{live.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {live.description || "Nenhuma descrição disponível."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(live.scheduled_for).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
