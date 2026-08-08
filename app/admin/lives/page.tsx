"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Copy, ExternalLink, Activity, Plus } from "lucide-react";
import Link from "next/link";

interface LiveStreamData {
  title: string;
  stream_key: string;
  rtmps_url: string;
  cloudflare_input_id: string;
}

export default function AdminLivesPage() {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeLive, setActiveLive] = useState<LiveStreamData | null>(null);
  const [error, setError] = useState("");

  const handleCreateLive = async () => {
    if (!title) {
      setError("Dê um título para a sua Live.");
      return;
    }
    
    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/lives/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: "Live criada pelo painel" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar live");

      setActiveLive(data.live);
      setTitle("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Estúdio de Transmissão (Lives)
        </h2>
        <p className="text-muted-foreground font-light">
          Crie salas de transmissão ao vivo. Suas alunas poderão assistir direto da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nova Live */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-lg font-bold">1. Criar Nova Transmissão</h3>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Título da Live</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tira dúvidas - Módulo 2" 
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button 
            className="w-full bg-primary text-black font-bold hover:bg-primary/90" 
            onClick={handleCreateLive}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? "Gerando Chaves..." : "Gerar Chave de Transmissão"}
          </Button>
        </div>

        {/* Chaves da Live */}
        <div className={`glass p-6 rounded-2xl border ${activeLive ? 'border-primary/50 bg-primary/5' : 'border-white/10'} space-y-6`}>
          <h3 className="text-lg font-bold">2. Conectar no OBS / Celular</h3>
          
          {!activeLive ? (
            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
              <Video className="w-10 h-10 mb-2" />
              <p className="text-sm">Gere uma nova transmissão para ver as chaves aqui.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white block">URL do Servidor (RTMPS)</label>
                <div className="flex gap-2">
                  <Input readOnly value={activeLive.rtmps_url} className="bg-black/40 text-white font-mono text-xs border-white/10" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(activeLive.rtmps_url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-white block">Chave de Transmissão (Stream Key)</label>
                <div className="flex gap-2">
                  <Input type="password" readOnly value={activeLive.stream_key} className="bg-black/40 text-white font-mono text-xs border-white/10" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(activeLive.stream_key)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-yellow-400">Nunca compartilhe essa chave. Cole-a no seu OBS Studio.</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link href={`/dashboard/live?id=${activeLive.cloudflare_input_id}`} target="_blank">
                  <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                    <ExternalLink className="w-4 h-4 mr-2" /> Ver página da Live (Como Aluno)
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
