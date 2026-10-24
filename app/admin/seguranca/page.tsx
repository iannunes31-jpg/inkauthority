"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Ban, FileText, Loader2, RefreshCw, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Event = { id: number; created_at: string; ip: string; kind: string; severity: string; method?: string; path?: string; user_agent?: string; country?: string; user_id?: string; details?: any };
type Block = { ip: string; reason: string; blocked_until: string; created_at: string };

const KIND_LABEL: Record<string, string> = {
  probe: "Varredura de falhas",
  injection: "Tentativa de invasão",
  admin_denied: "Admin sem permissão",
  forged_webhook: "WhatsApp/pagamento falso",
  forged_cron: "Rotina disparada por terceiros",
  rate_limited: "Excesso de tentativas",
  role_change: "Cargo de admin alterado",
  blocked_hit: "IP bloqueado tentou acessar",
};
const SEV_CLASS: Record<string, string> = {
  low: "bg-white/10 text-white/70",
  medium: "bg-yellow-500/15 text-yellow-400",
  high: "bg-red-500/15 text-red-400",
  critical: "bg-red-600/25 text-red-300",
};

export default function SecurityPage() {
  const [data, setData] = useState<{ events: Event[]; blocks: Block[] } | null>(null);
  const [error, setError] = useState("");
  const [ipInput, setIpInput] = useState("");

  const load = async () => {
    setError("");
    const res = await fetch("/api/admin/security", { cache: "no-store" }).catch(() => null);
    const body = await res?.json().catch(() => ({}));
    if (!res?.ok) return setError(body?.error === "setup" ? "setup" : body?.error || "Não foi possível carregar.");
    setData(body);
  };
  useEffect(() => { load(); }, []);

  const act = async (action: "block" | "unblock", ip: string) => {
    if (action === "block" && !confirm(`Bloquear o IP ${ip} por 24 horas?`)) return;
    await fetch("/api/admin/security", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ip }) });
    load();
  };

  const stats = useMemo(() => {
    const day = Date.now() - 86400_000;
    const last24 = (data?.events ?? []).filter((e) => new Date(e.created_at).getTime() > day);
    const ips = new Map<string, number>();
    for (const e of data?.events ?? []) ips.set(e.ip, (ips.get(e.ip) ?? 0) + 1);
    return { last24: last24.length, serious: last24.filter((e) => e.severity === "high" || e.severity === "critical").length, topIps: [...ips].sort((a, b) => b[1] - a[1]).slice(0, 8) };
  }, [data]);

  if (error === "setup") {
    return (
      <div className="max-w-3xl mx-auto p-8 glass rounded-2xl border border-yellow-500/30">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-yellow-400" /> Falta ativar o agente</h1>
        <p className="text-muted-foreground">Rode o arquivo <code>supabase-security-agent.sql</code> no Supabase (SQL Editor) e recarregue esta página.</p>
      </div>
    );
  }
  if (error) return <div className="p-8 text-muted-foreground">{error}</div>;
  if (!data) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-400" /> Agente de Segurança</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitora o site 24h, bloqueia IPs que atacam e avisa por e-mail. Últimos 7 dias.</p>
        </div>
        <Button variant="outline" onClick={load} className="border-white/15"><RefreshCw className="w-4 h-4 mr-2" /> Atualizar</Button>
      </div>

      {stats.serious > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-300">{stats.serious} evento(s) grave(s) nas últimas 24 horas</p>
            <p className="text-sm text-muted-foreground">Os IPs envolvidos já foram bloqueados automaticamente. Use "Relatório" para gerar o documento do boletim de ocorrência.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Eventos (24h)", stats.last24],
          ["Graves (24h)", stats.serious],
          ["IPs bloqueados agora", data.blocks.length],
          ["Eventos (7 dias)", data.events.length],
        ].map(([label, value]) => (
          <div key={label as string} className="glass p-4 rounded-2xl border border-white/5">
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="font-bold mb-4 flex items-center gap-2"><Ban className="w-4 h-4 text-red-400" /> IPs bloqueados</h2>
          {data.blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum IP bloqueado agora.</p>
          ) : (
            <div className="space-y-2">
              {data.blocks.map((b) => (
                <div key={b.ip} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-mono font-semibold">{b.ip}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.reason} · até {new Date(b.blocked_until).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/admin/seguranca/relatorio?ip=${encodeURIComponent(b.ip)}`} className="text-xs border border-white/15 rounded-lg px-2.5 py-1.5 hover:bg-white/10 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Relatório</Link>
                    <button onClick={() => act("unblock", b.ip)} className="text-xs border border-white/15 rounded-lg px-2.5 py-1.5 hover:bg-white/10 flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> Liberar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (ipInput.trim()) act("block", ipInput.trim()); setIpInput(""); }} className="flex gap-2 mt-4">
            <input value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="Bloquear um IP manualmente" className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono" />
            <Button type="submit" variant="outline" className="border-white/15">Bloquear</Button>
          </form>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="font-bold mb-4">IPs mais ativos (7 dias)</h2>
          {stats.topIps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade suspeita registrada. 🎉</p>
          ) : (
            <div className="space-y-2">
              {stats.topIps.map(([ip, n]) => (
                <div key={ip} className="flex items-center justify-between text-sm rounded-xl border border-white/10 p-3">
                  <span className="font-mono">{ip}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">{n} evento(s)</span>
                    <Link href={`/admin/seguranca/relatorio?ip=${encodeURIComponent(ip)}`} className="text-xs underline">Relatório</Link>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="font-bold mb-4">Eventos recentes</h2>
        {data.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada por aqui ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-white/10">
                  <th className="py-2 pr-4">Quando</th><th className="py-2 pr-4">Tipo</th><th className="py-2 pr-4">IP</th><th className="py-2 pr-4">País</th><th className="py-2">Endereço</th>
                </tr>
              </thead>
              <tbody>
                {data.events.slice(0, 200).map((e) => (
                  <tr key={e.id} className="border-b border-white/5">
                    <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">{new Date(e.created_at).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-4"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${SEV_CLASS[e.severity] ?? ""}`}>{KIND_LABEL[e.kind] ?? e.kind}</span></td>
                    <td className="py-2 pr-4 font-mono whitespace-nowrap">{e.ip}</td>
                    <td className="py-2 pr-4">{e.country || "-"}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground max-w-[340px] truncate" title={e.path}>{e.method} {e.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
