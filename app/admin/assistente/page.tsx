"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, QrCode, Loader2, Save, Power, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Settings = { is_active: boolean; extra_info: string; human_contact: string };
type Msg = { phone_number: string; role: string; content: string; created_at: string };

const STATE_LABEL: Record<string, { text: string; color: string }> = {
  open: { text: "Conectado", color: "bg-green-500/15 text-green-500" },
  connecting: { text: "Aguardando QR Code", color: "bg-yellow-500/15 text-yellow-500" },
  close: { text: "Desconectado", color: "bg-red-500/15 text-red-500" },
  not_found: { text: "Número ainda não conectado", color: "bg-white/10 text-muted-foreground" },
};

export default function AdminAssistentePage() {
  const [settings, setSettings] = useState<Settings>({ is_active: false, extra_info: "", human_contact: "" });
  const [state, setState] = useState("unknown");
  const [recent, setRecent] = useState<Msg[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/sales-assistant", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSettings(data.settings);
      setState(data.state);
      setRecent(data.recent);
      if (data.state === "open") setQr(null);
    } else {
      setMessage(data.error || "Erro ao carregar. Rodou o SQL do assistente no Supabase?");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!qr) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [qr]);

  const save = async (next = settings) => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/sales-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", settings: next }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? "Configurações salvas." : data.error || "Erro ao salvar.");
  };

  const connect = async () => {
    setConnecting(true);
    setMessage("");
    const res = await fetch("/api/admin/sales-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connect" }),
    });
    const data = await res.json().catch(() => ({}));
    setConnecting(false);
    if (data.qr) setQr(data.qr);
    else setMessage("Não veio QR Code. Se o número já está conectado, atualize a página.");
    load();
  };

  const conversations = useMemo(() => {
    const byPhone = new Map<string, Msg[]>();
    for (const m of recent) {
      if (!byPhone.has(m.phone_number)) byPhone.set(m.phone_number, []);
      byPhone.get(m.phone_number)!.push(m);
    }
    return [...byPhone.entries()].map(([phone, msgs]) => ({ phone: phone.split("@")[0], msgs: msgs.reverse() }));
  }, [recent]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const badge = STATE_LABEL[state] ?? { text: "Status desconhecido", color: "bg-white/10 text-muted-foreground" };
  const input = "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:border-white/30";

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-[#25D366]" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Assistente de Vendas (WhatsApp)</h1>
          <p className="text-sm text-muted-foreground">
            Responde tatuadores interessados na Ink Authority: preços, Workshop, planos e links de compra.
          </p>
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><QrCode className="w-4 h-4" /> Número de WhatsApp</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>{badge.text}</span>
          </div>
          {qr ? (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-3 rounded-2xl"><img src={qr} alt="QR Code" className="w-52 h-52" /></div>
              <p className="text-xs text-muted-foreground text-center">
                No celular da empresa: WhatsApp → Aparelhos conectados → Conectar aparelho.
              </p>
            </div>
          ) : (
            <Button onClick={connect} disabled={connecting} variant="outline" className="w-full border-white/20">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : state === "open" ? "Reconectar com outro número" : "Gerar QR Code"}
            </Button>
          )}
          <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Atualizar status
          </button>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Power className={`w-4 h-4 ${settings.is_active ? "text-green-500" : "text-muted-foreground"}`} /> Responder automaticamente
            </h2>
            <button
              onClick={() => { const next = { ...settings, is_active: !settings.is_active }; setSettings(next); save(next); }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.is_active ? "bg-green-500" : "bg-white/20"}`}
              aria-label="Ligar ou desligar o assistente"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.is_active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">
              Contato humano (pagamento, reembolso, pedidos de atendente)
            </label>
            <input
              value={settings.human_contact}
              onChange={(e) => setSettings({ ...settings, human_contact: e.target.value })}
              placeholder="Ex: (21) 99999-9999 ou suporte@inkauthority.com.br"
              className={input}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Preços, produtos e links já vêm automaticamente da tabela de preços do site.
          </p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
        <h2 className="font-bold">Informações extras para o assistente</h2>
        <p className="text-xs text-muted-foreground">
          Promoções da semana, cupons que ele pode divulgar, perguntas frequentes, datas de turma, tom de voz… Escreva como se estivesse orientando um vendedor.
        </p>
        <textarea
          value={settings.extra_info}
          onChange={(e) => setSettings({ ...settings, extra_info: e.target.value })}
          rows={8}
          maxLength={6000}
          placeholder={"Ex:\n- Esta semana o cupom WORK10 dá 10% no Workshop.\n- A próxima live é quinta às 20h.\n- Sempre convide para o Tutor IA grátis."}
          className={`${input} resize-y`}
        />
        <Button onClick={() => save()} disabled={saving} className="bg-primary text-primary-foreground font-bold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
        </Button>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="font-bold mb-4">Conversas recentes</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
        ) : (
          <div className="space-y-6">
            {conversations.map((c) => (
              <div key={c.phone}>
                <p className="text-xs font-bold text-muted-foreground mb-2">+{c.phone}</p>
                <div className="space-y-2">
                  {c.msgs.map((m, i) => (
                    <div key={i} className={`text-sm rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "bg-white/5" : "bg-[#25D366]/10 ml-auto"}`}>
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
