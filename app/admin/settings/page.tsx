"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Cloud, Database, CreditCard, Shield, Globe } from "lucide-react";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Ajustes da Plataforma</h2>
          <p className="text-muted-foreground font-light">Configure as informações principais do sistema e integrações.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-black font-bold min-w-[120px]">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Informações Básicas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Geral</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Nome da Plataforma</label>
                <Input defaultValue="Ink Authority" className="bg-black/50 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">E-mail de Suporte</label>
                <Input defaultValue="suporte@inkauthority.com" className="bg-black/50 border-white/10 text-white" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm text-muted-foreground">Link do Suporte (WhatsApp ou URL)</label>
              <Input placeholder="https://wa.me/5511999999999" className="bg-black/50 border-white/10 text-white" />
            </div>
          </div>

          {/* Checkout & Pagamentos */}
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Pagamentos (Stripe)</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Moeda Padrão</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-md h-10 px-3 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="BRL">BRL (Real Brasileiro)</option>
                <option value="USD">USD (Dólar Americano)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mt-4">
              <p className="text-sm text-primary font-medium">As chaves do Stripe devem ser configuradas nas variáveis de ambiente da Vercel (STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET).</p>
            </div>
          </div>
        </div>

        {/* Status de Integrações */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold">Status das Integrações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Supabase</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Banco de Dados</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Cloudflare Stream</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Servidor de Vídeos</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-bold text-white">Clerk Auth</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Autenticação</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 opacity-70">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-bold text-white">Stripe</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pagamentos (Pendente)</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
