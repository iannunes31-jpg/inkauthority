"use client";

import { useState } from "react";
import { Settings, Save, Smartphone, QrCode, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsAppConfigPage() {
  const [instanceName, setInstanceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("connecting");
    
    // Simulating API call to create instance in Evolution API
    setTimeout(() => {
      setIsLoading(false);
      setStatus("connected");
    }, 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-[#25D366]" /> Assistente WhatsApp
        </h1>
        <p className="text-muted-foreground">Conecte seu WhatsApp para que a IA atenda seus clientes, faça orçamentos e agendamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Setup Card */}
        <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-[#128C7E]" />
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" /> Configurar Instância
          </h2>
          
          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nome da Conexão</label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="Ex: WhatsApp Estúdio"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366]/50 transition-colors"
                required
                disabled={status === "connected"}
              />
            </div>

            <div className="bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl p-4 flex gap-3">
              <LinkIcon className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-[#25D366] mb-1">Webhook Automático</h4>
                <p className="text-xs text-muted-foreground">
                  Nossa plataforma configurará automaticamente o webhook na Evolution API para receber e responder mensagens.
                </p>
              </div>
            </div>

            {status !== "connected" ? (
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#25D366] text-black hover:bg-[#25D366]/90 font-bold uppercase tracking-widest"
              >
                {isLoading ? "Conectando..." : "Gerar QR Code"}
              </Button>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl flex items-center gap-3 justify-center">
                <CheckCircle2 className="w-5 h-5" /> Instância Criada com Sucesso
              </div>
            )}
          </form>
        </div>

        {/* QR Code Card (Only shows when connecting/connected) */}
        <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center min-h-[400px]">
          {status === "disconnected" && (
            <>
              <QrCode className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-lg font-bold mb-2">Aguardando Conexão</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Preencha os dados ao lado e clique em "Gerar QR Code" para conectar seu aparelho.
              </p>
            </>
          )}

          {status === "connecting" && (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-48 h-48 bg-white/5 rounded-xl border border-white/10 mb-4 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Gerando...</span>
              </div>
              <p className="text-sm text-muted-foreground">Preparando Evolution API...</p>
            </div>
          )}

          {status === "connected" && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              {/* Fake QR Code for UI purposes */}
              <div className="bg-white p-4 rounded-xl mb-6">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EvolutionAPIConnection" alt="QR Code" className="w-48 h-48" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#25D366]">Escaneie o QR Code</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie este código.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
