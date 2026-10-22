"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageSquare, Flame, PauseCircle, CheckCircle2, Users, TrendingUp, Loader2, Send, Sparkles, RefreshCw } from "lucide-react";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { useStickToBottom } from "@/lib/use-stick-to-bottom";
import { STAGES } from "@/lib/dante-stages";
import { cn } from "@/lib/utils";

type Insights = {
  totals: { conversations: number; received30d: number; closing: number; stalled: number; closed: number; lost: number; conversion: number };
  stageCounts: Record<string, number>;
  daily: { day: string; received: number }[];
  leads: {
    phone: string;
    name: string | null;
    stage: string;
    stalled: boolean;
    lastActivity: string | null;
    lastFrom: "cliente" | "dante" | null;
    lastText: string;
    messages: number;
    followups: number;
  }[];
};

const STAGE_COLORS: Record<string, string> = {
  novo: "bg-white/20",
  qualificando: "bg-sky-500",
  projeto: "bg-violet-500",
  orcamento: "bg-amber-500",
  agendamento: "bg-orange-500",
  fechado: "bg-green-500",
  perdido: "bg-red-500/70",
};

const SUGGESTIONS = [
  "Em que etapa eu mais perco clientes?",
  "Como recuperar os clientes que pararam no meio?",
  "Monte uma estratégia para fechar mais esta semana",
  "Quem está mais perto de fechar e o que eu faço com cada um?",
];

function timeAgo(iso: string | null) {
  if (!iso) return "-";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export function DanteInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"todos" | "fechando" | "parados" | "fechados">("todos");

  const load = async () => {
    setError("");
    const res = await fetch("/api/dante/insights", { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setData(body);
    else setError(body.error || "Não foi possível carregar o painel.");
  };
  useEffect(() => { load(); }, []);

  const chat = useMemo(() => new Chat({ transport: new DefaultChatTransport({ api: "/api/dante/insights/chat" }) }), []);
  const { messages, sendMessage, status } = useChat({ chat });
  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useStickToBottom(scrollRef, messages);

  const ask = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text }] } as any);
    setInput("");
  };

  if (error) return <div className="glass p-8 rounded-2xl border border-white/10 text-center text-muted-foreground">{error}</div>;
  if (!data) return <div className="flex justify-center p-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const t = data.totals;
  const maxStage = Math.max(1, ...Object.values(data.stageCounts));
  const maxDay = Math.max(1, ...data.daily.map((d) => d.received));
  const leads = data.leads.filter((l) =>
    filter === "fechando" ? l.stage === "orcamento" || l.stage === "agendamento" :
    filter === "parados" ? l.stalled :
    filter === "fechados" ? l.stage === "fechado" : true
  );

  const cards = [
    { label: "Mensagens recebidas (30 dias)", value: t.received30d, icon: MessageSquare, color: "text-sky-500" },
    { label: "Conversas", value: t.conversations, icon: Users, color: "text-foreground" },
    { label: "Quase fechando", value: t.closing, icon: Flame, color: "text-orange-500" },
    { label: "Pararam no meio", value: t.stalled, icon: PauseCircle, color: "text-yellow-500" },
    { label: "Fechados", value: t.closed, icon: CheckCircle2, color: "text-green-500" },
    { label: "Conversão", value: `${t.conversion}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Números dos últimos 90 dias, atualizados a cada conversa do Dante.</p>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="glass p-4 rounded-2xl border border-white/5">
            <c.icon className={cn("w-4 h-4 mb-2", c.color)} />
            <p className="text-2xl font-black">{c.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold mb-4 text-sm">Funil de atendimento</h3>
          <div className="space-y-2">
            {STAGES.map((s) => (
              <div key={s.key} className="flex items-center gap-3 text-xs">
                <span className="w-32 shrink-0 text-muted-foreground">{s.label}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                  <div className={cn("h-full rounded-md", STAGE_COLORS[s.key])} style={{ width: `${(data.stageCounts[s.key] / maxStage) * 100}%` }} />
                </div>
                <span className="w-8 text-right font-semibold">{data.stageCounts[s.key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold mb-4 text-sm">Mensagens recebidas por dia (14 dias)</h3>
          <div className="flex items-end gap-1.5 h-32">
            {data.daily.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.received}`}>
                <div className="w-full bg-sky-500/80 rounded-t" style={{ height: `${Math.max(2, (d.received / maxDay) * 100)}%` }} />
                <span className="text-[9px] text-muted-foreground">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="font-bold text-sm">Conversas</h3>
            <div className="flex gap-1 text-[11px]">
              {(["todos", "fechando", "parados", "fechados"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn("px-2.5 py-1 rounded-full border", filter === f ? "border-primary bg-primary/10" : "border-white/10 text-muted-foreground")}
                >
                  {f === "todos" ? "Todas" : f === "fechando" ? "Quase fechando" : f === "parados" ? "Paradas" : "Fechadas"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conversa aqui.</p>
            ) : (
              leads.map((l) => (
                <div key={l.phone} className="rounded-xl border border-white/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{l.name || `+${l.phone}`}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", STAGE_COLORS[l.stage])}>
                      {STAGES.find((s) => s.key === l.stage)?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {l.lastFrom === "cliente" ? "Cliente: " : l.lastFrom === "dante" ? "Dante: " : ""}{l.lastText}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {timeAgo(l.lastActivity)} · {l.messages} msg do cliente
                    {l.stalled && <span className="text-yellow-500 font-semibold"> · parada</span>}
                    {l.followups > 0 && ` · ${l.followups} follow-up(s)`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-primary/20 flex flex-col h-[560px]">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Consultor de vendas</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Pergunte qualquer coisa sobre seus atendimentos. As respostas usam os seus números reais.</p>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="text-left text-xs rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => {
              const text = m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") ?? "";
              if (!text) return null;
              return (
                <div key={m.id} className={cn("rounded-xl px-3 py-2 text-sm", m.role === "user" ? "bg-white/5 ml-8" : "bg-primary/5 border border-primary/10 mr-4")}>
                  <ChatMarkdown text={text} className="text-[13px]" />
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Analisando seus dados…</div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: por que estou perdendo clientes no orçamento?"
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50"
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50" aria-label="Enviar">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
