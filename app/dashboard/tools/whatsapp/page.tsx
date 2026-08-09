"use client";

import { useState, useEffect } from "react";
import { Bot, Save, Calendar, Users, MapPin, Instagram, CreditCard, Link as LinkIcon, MessageSquare, Clock, Power, QrCode, Zap, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"settings" | "crm" | "agenda">("settings");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Carregando...");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const [formData, setFormData] = useState({
    studio_name: "",
    base_price: "",
    hourly_rate: "",
    styles: "",
    style_image_url: "",
    address: "",
    instagram_url: "",
    google_review_url: "",
    payment_methods: "",
    bot_personality: "Profissional e educado",
    is_active: false,
    bot_mode: "copilot",
    price_arm: "",
    price_leg: "",
    price_front: "",
    price_back: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
      checkConnectionStatus();
    }
  }, [user?.id]);

  const checkConnectionStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: user.id, action: "status" })
      });
      const data = await res.json();
      
      if (data.state === "open") {
        setConnectionStatus("Conectado");
      } else if (data.state === "connecting") {
        setConnectionStatus("Aguardando leitura do QR Code");
      } else {
        setConnectionStatus("Desconectado");
      }
    } catch (e) {
      setConnectionStatus("Erro na conexão");
    }
  };

  const handleGenerateQr = async () => {
    if (!user) return;
    setIsGeneratingQr(true);
    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: user.id, action: "connect" })
      });
      const data = await res.json();
      
      if (data?.base64) {
        setQrCodeData(data.base64);
        setConnectionStatus("Aguardando leitura do QR Code");
      } else if (data?.qrcode) {
        setQrCodeData(data.qrcode);
        setConnectionStatus("Aguardando leitura do QR Code");
      } else if (data?.qrcode?.base64) {
        setQrCodeData(data.qrcode.base64);
        setConnectionStatus("Aguardando leitura do QR Code");
      } else if (data?.hash?.qrcode) {
        setQrCodeData(data.hash.qrcode);
        setConnectionStatus("Aguardando leitura do QR Code");
      } else {
        alert("Erro ao buscar QR Code. Verifique os logs.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar QR Code");
    }
    setIsGeneratingQr(false);
  };

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
        style_image_url: data.style_image_url || "",
        address: data.address || "",
        instagram_url: data.instagram_url || "",
        google_review_url: data.google_review_url || "",
        payment_methods: data.payment_methods || "",
        bot_personality: data.bot_personality || "Profissional e educado",
        is_active: data.is_active || false,
        bot_mode: data.bot_mode || "copilot",
        price_arm: data.price_arm || "",
        price_leg: data.price_leg || "",
        price_front: data.price_front || "",
        price_back: data.price_back || "",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
    const filePath = `style-references/${fileName}`;

    setIsUploadingImage(true);
    try {
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (error) {
        console.error("Erro no upload:", error);
        alert("Erro no upload. Lembre-se de criar um bucket público chamado 'assets' no seu Supabase.");
        setIsUploadingImage(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, style_image_url: publicUrlData.publicUrl }));
    } catch (err) {
      console.error(err);
      alert("Falha no upload.");
    }
    setIsUploadingImage(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      clerk_user_id: user.id,
      ...formData,
      base_price: Number(formData.base_price) || 0,
      hourly_rate: Number(formData.hourly_rate) || 0,
      price_arm: Number(formData.price_arm) || null,
      price_leg: Number(formData.price_leg) || null,
      price_front: Number(formData.price_front) || null,
      price_back: Number(formData.price_back) || null,
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <button 
                      onClick={handleGenerateQr}
                      disabled={isGeneratingQr || connectionStatus === "Conectado"}
                      className="w-64 h-64 bg-white rounded-xl flex items-center justify-center p-2 relative overflow-hidden group cursor-pointer border-2 border-transparent hover:border-primary transition-all disabled:cursor-not-allowed disabled:hover:border-transparent shrink-0"
                    >
                      {isGeneratingQr ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                          <span className="text-xs font-bold text-black text-center">Gerando...</span>
                        </div>
                      ) : qrCodeData ? (
                        <img src={qrCodeData} alt="QR Code" className="w-full h-full object-contain" />
                      ) : connectionStatus === "Conectado" ? (
                        <div className="flex flex-col items-center">
                          <Zap className="w-12 h-12 text-green-500 mb-2" />
                          <span className="text-sm font-bold text-black text-center">Conectado!</span>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white">
                            <QrCode className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold text-center">Gerar QR Code</span>
                          </div>
                          {/* Placeholder Image */}
                          <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-20"></div>
                        </>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {connectionStatus === "Conectado" 
                          ? "Seu Assistente está conectado e pronto para responder clientes!"
                          : "Clique no quadrado para gerar o QR Code. Depois, escaneie com seu WhatsApp (Aparelhos Conectados)."
                        }
                      </p>
                      
                      {connectionStatus !== "Conectado" && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-4">
                          <p className="text-[11px] text-yellow-500 font-medium">
                            ⚠️ <strong>Atenção:</strong> O WhatsApp permite no máximo 4 aparelhos conectados simultaneamente (como WhatsApp Web e Desktop). Se der erro de "não é possível conectar mais dispositivos", desconecte um aparelho no seu celular antes de ler este QR.
                          </p>
                        </div>
                      )}

                      <div className={cn(
                        "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full w-fit",
                        connectionStatus === "Conectado" ? "bg-green-500/10 text-green-500" : 
                        connectionStatus === "Desconectado" ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        <span className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          connectionStatus === "Conectado" ? "bg-green-500" : 
                          connectionStatus === "Desconectado" ? "bg-red-500" :
                          "bg-yellow-500"
                        )}></span>
                        {connectionStatus}
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
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1 block">Imagem de Referência do Seu Estilo</label>
                    <div className="flex flex-col gap-2">
                      {formData.style_image_url && (
                        <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-white/10 mb-2">
                          <img src={formData.style_image_url} alt="Referência" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setFormData({...formData, style_image_url: ""})}
                            className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg hover:bg-red-500/80 transition-colors"
                          >
                            <span className="text-xs font-bold text-white">X</span>
                          </button>
                        </div>
                      )}
                      
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className={cn(
                          "w-full bg-black/50 border border-white/10 border-dashed rounded-lg py-4 px-3 text-sm flex flex-col items-center justify-center transition-colors hover:border-primary hover:bg-white/5",
                          isUploadingImage && "opacity-50 border-primary"
                        )}>
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 text-primary animate-spin mb-1" />
                          ) : (
                            <span className="text-white/70 font-semibold mb-1">Clique para fazer upload</span>
                          )}
                          <span className="text-[10px] text-white/40">O robô usará essa imagem como padrão de qualidade.</span>
                        </div>
                      </div>
                    </div>
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

                  <div className="pt-2 border-t border-white/5">
                    <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3 block">Preços Fechados (Fechamentos)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">Braço Completo (R$)</label>
                        <input 
                          type="number" 
                          value={formData.price_arm}
                          onChange={(e) => setFormData({...formData, price_arm: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                          placeholder="Ex: 4000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">Perna Completa (R$)</label>
                        <input 
                          type="number" 
                          value={formData.price_leg}
                          onChange={(e) => setFormData({...formData, price_leg: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                          placeholder="Ex: 5000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">Frente (Peito/Barriga) (R$)</label>
                        <input 
                          type="number" 
                          value={formData.price_front}
                          onChange={(e) => setFormData({...formData, price_front: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                          placeholder="Ex: 6000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50 block mb-1">Costas Completas (R$)</label>
                        <input 
                          type="number" 
                          value={formData.price_back}
                          onChange={(e) => setFormData({...formData, price_back: e.target.value})}
                          className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-primary focus:outline-none transition-colors"
                          placeholder="Ex: 7000"
                        />
                      </div>
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
