"use client";

import { useState, useEffect } from "react";
import { Bot, Save, Calendar, Users, MapPin, Instagram, CreditCard, Link as LinkIcon, MessageSquare, Clock, Power, QrCode, Zap, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"settings" | "crm" | "agenda">("settings");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    studio_name: "",
    base_price: "",
    hourly_rate: "",
    styles: "",
    address: "",
    instagram_url: "",
    google_review_url: "",
    payment_methods: "",
    bot_personality: "Profissional e educado",
    is_active: false,
    bot_mode: "copilot",
  });

  useEffect(() => {
    if (user?.id) fetchSettings();
  }, [user?.id]);

  const fetchSettings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("clerk_user_id", user.id)
      .single();

    if (data) {
      setFormData({
        studio_name: data.studio_name || "",
        base_price: data.base_price || "",
        hourly_rate: data.hourly_rate || "",
        styles: data.styles || "",
        address: data.address || "",
        instagram_url: data.instagram_url || "",
        google_review_url: data.google_review_url || "",
        payment_methods: data.payment_methods || "",
        bot_personality: data.bot_personality || "Profissional e educado",
        is_active: data.is_active || false,
        bot_mode: data.bot_mode || "copilot",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      clerk_user_id: user.id,
      ...formData,
      base_price: Number(formData.base_price) || 0,
      hourly_rate: Number(formData.hourly_rate) || 0,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("ai_settings")
      .upsert(payload, { onConflict: "clerk_user_id" });

    if (error) {
      console.error("Erro ao salvar configurações", error);
      alert("Erro ao salvar! Certifique-se de que a tabela ai_settings existe.");
    } else {
      alert("Configurações do Assistente salvas com sucesso!");
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Cérebro da IA</h1>
          <p className="text-muted-foreground text-sm">Gerencie o conhecimento, clientes e a agenda do seu assistente virtual.</p>
        </div>
      </div>

      {/* Mini Menu (Tabs) */}
      <div className="flex items-center gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "settings" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <Bot className="w-4 h-4" /> Configurações
        </button>
        <button
          onClick={() => setActiveTab("crm")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "crm" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-4 h-4" /> CRM (Clientes)
        </button>
        <button
          onClick={() => setActiveTab("agenda")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === "agenda" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <Calendar className="w-4 h-4" /> Agenda
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "settings" && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Coluna Esquerda */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              
              {/* Central de Operações (Bot) */}
              <div className="glass p-6 rounded-2xl border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Power className={cn("w-5 h-5", formData.is_active ? "text-green-400" : "text-white/30")} /> 
                    Status do Assistente
                  </h2>
                  <button 
                    onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black",
                      formData.is_active ? "bg-green-500" : "bg-white/20"
                    )}
                  >
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", formData.is_active ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setFormData({...formData, bot_mode: "copilot"})}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center",
                      formData.bot_mode === "copilot" 
                        ? "border-primary bg-primary/10 text-white" 
                        : "border-white/10 bg-black/40 text-white/50 hover:bg-white/5"
                    )}
                  >
                    <Edit3 className={cn("w-6 h-6", formData.bot_mode === "copilot" ? "text-primary" : "")} />
                    <div className="text-sm font-bold">Modo Copilot</div>
                    <div className="text-[10px] opacity-80 leading-tight">Escreve e você revisa.</div>
                  </button>
                  
                  <button
                    onClick={() => setFormData({...formData, bot_mode: "automatic"})}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center",
                      formData.bot_mode === "automatic" 
                        ? "border-green-500 bg-green-500/10 text-white" 
                        : "border-white/10 bg-black/40 text-white/50 hover:bg-white/5"
                    )}
                  >
                    <Zap className={cn("w-6 h-6", formData.bot_mode === "automatic" ? "text-green-500" : "")} />
                    <div className="text-sm font-bold">Piloto Automático</div>
                    <div className="text-[10px] opacity-80 leading-tight">Atende 24/7.</div>
                  </button>
                </div>

                {/* QR Code de Conexão */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                    <QrCode className="w-4 h-4 text-primary" /> Conectar WhatsApp
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 opacity-50 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-center">Gerar Novo</span>
                      </div>
                      {/* Mock do QR Code */}
                      <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Escaneie este QR Code com seu WhatsApp Business.
                      </p>
                      <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 w-fit">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Aguardando...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Identidade do Estúdio
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Nome do Estúdio / Tatuador</label>
                    <input 
                      type="text" 
                      value={formData.studio_name}
                      onChange={(e) => setFormData({...formData, studio_name: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: Ink Master Studio"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Estilos Principais</label>
                    <input 
                      type="text" 
                      value={formData.styles}
                      onChange={(e) => setFormData({...formData, styles: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: Realismo, Fineline, Old School"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Tom de Voz da IA</label>
                    <select 
                      value={formData.bot_personality}
                      onChange={(e) => setFormData({...formData, bot_personality: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="Profissional e educado">Profissional e Educado</option>
                      <option value="Descolado e amigável">Descolado e Amigável</option>
                      <option value="Direto e objetivo">Direto e Objetivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Preços e Pagamentos
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Valor Mínimo (R$)</label>
                      <input 
                        type="number" 
                        value={formData.base_price}
                        onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Ex: 250"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Valor Hora (R$)</label>
                      <input 
                        type="number" 
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                        placeholder="Ex: 400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Métodos de Pagamento</label>
                    <input 
                      type="text" 
                      value={formData.payment_methods}
                      onChange={(e) => setFormData({...formData, payment_methods: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Ex: Pix, Cartão em até 12x"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Coluna Direita */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Localização & Links
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Endereço Completo</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors min-h-[80px]"
                      placeholder="Ex: Av. Paulista, 1000 - SP"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1"><Instagram className="w-3 h-3"/> Instagram URL</label>
                    <input 
                      type="url" 
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="https://instagram.com/seu.perfil"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Avaliações (Google)</label>
                    <input 
                      type="url" 
                      value={formData.google_review_url}
                      onChange={(e) => setFormData({...formData, google_review_url: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Link do google"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center text-center">
                <Calendar className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Treinamento Contínuo</h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Sempre que você alterar essas configurações, o Assistente aprenderá automaticamente.
                </p>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full metallic-gradient text-black font-bold h-12 rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Salvando..." : "Salvar Conhecimento da IA"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "crm" && (
          <motion.div 
            key="crm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center py-20"
          >
            <Users className="w-12 h-12 text-primary mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">CRM de Clientes</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aqui aparecerão todos os leads e clientes que interagirem com o seu Assistente IA. 
            </p>
          </motion.div>
        )}

        {activeTab === "agenda" && (
          <motion.div 
            key="agenda"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center py-20"
          >
            <Calendar className="w-12 h-12 text-primary mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Agenda Inteligente</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aqui ficarão os agendamentos marcados pelo robô. A IA cruza automaticamente as suas regras de negócio e os horários livres.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
