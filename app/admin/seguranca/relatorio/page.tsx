"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";

const KIND_LABEL: Record<string, string> = {
  probe: "Varredura de falhas (procura de arquivos e painéis de outros sistemas)",
  injection: "Tentativa de invasão no endereço (SQL / script)",
  admin_denied: "Uso de funções de administrador sem permissão",
  forged_webhook: "Chamada falsa às integrações de WhatsApp/pagamento",
  forged_cron: "Tentativa de disparar rotinas automáticas do site",
  rate_limited: "Excesso de tentativas seguidas",
  role_change: "Alteração de cargo de administrador",
  blocked_hit: "Acesso de IP bloqueado",
};

// Printable evidence report for one IP, to attach to a police report (boletim de ocorrência).
function Report() {
  const ip = useSearchParams().get("ip") || "";
  const [data, setData] = useState<{ events: any[]; block: any } | null>(null);

  useEffect(() => {
    if (!ip) return;
    fetch(`/api/admin/security?ip=${encodeURIComponent(ip)}`, { cache: "no-store" }).then((r) => r.json()).then(setData);
  }, [ip]);

  if (!ip) return <p className="p-8">Informe um IP.</p>;
  if (!data) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const events = data.events ?? [];
  const first = events[0]?.created_at, last = events[events.length - 1]?.created_at;
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " (horário de Brasília)" : "-");
  const agents = [...new Set(events.map((e) => e.user_agent).filter(Boolean))];
  const users = [...new Set(events.map((e) => e.user_id).filter(Boolean))];

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`@media print { aside, nav, header, .no-print { display: none !important; } body, main { background: #fff !important; color: #000 !important; } .print-doc { color: #000 !important; } .print-doc * { color: #000 !important; border-color: #ccc !important; } main { margin: 0 !important; padding: 0 !important; } }`}</style>
      <div className="no-print flex items-center justify-between mb-6">
        <Link href="/admin/seguranca" className="text-sm text-muted-foreground flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-black font-bold text-sm px-4 py-2 rounded-lg"><Printer className="w-4 h-4" /> Imprimir / salvar PDF</button>
      </div>

      <div className="print-doc bg-white text-black rounded-xl p-10 text-sm leading-relaxed">
        <h1 className="text-xl font-bold">Relatório de incidente de segurança</h1>
        <p className="text-gray-600">Ink Authority — CNPJ 69.359.319/0001-04 — www.inkauthority.com.br</p>
        <p className="text-gray-600">Gerado em {fmt(new Date().toISOString())}</p>

        <h2 className="font-bold mt-6 mb-2">1. Resumo</h2>
        <table className="w-full border border-gray-300">
          <tbody>
            {[
              ["Endereço IP de origem", ip],
              ["País (geolocalização)", events.find((e) => e.country)?.country || "-"],
              ["Primeiro registro", fmt(first)],
              ["Último registro", fmt(last)],
              ["Total de eventos", String(events.length)],
              ["Tipos de atividade", [...new Set(events.map((e) => KIND_LABEL[e.kind] ?? e.kind))].join("; ")],
              ["Conta(s) da plataforma usada(s)", users.length ? users.join(", ") : "nenhuma (sem login)"],
              ["Bloqueio aplicado", data.block ? `${data.block.reason}, até ${fmt(data.block.blocked_until)}` : "não"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-gray-200"><td className="p-2 w-64 text-gray-600">{k}</td><td className="p-2 font-semibold">{v}</td></tr>
            ))}
          </tbody>
        </table>

        <h2 className="font-bold mt-6 mb-2">2. Identificação técnica do agente</h2>
        <p className="text-gray-600 mb-1">Navegador/ferramenta informado nas requisições:</p>
        <ul className="list-disc ml-6 break-all">{agents.length ? agents.map((a) => <li key={a}>{a}</li>) : <li>-</li>}</ul>

        <h2 className="font-bold mt-6 mb-2">3. Registro cronológico das requisições</h2>
        <table className="w-full border border-gray-300 text-xs">
          <thead><tr className="bg-gray-100 text-left"><th className="p-2">Data e hora (UTC)</th><th className="p-2">Atividade</th><th className="p-2">Requisição</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-gray-200 align-top">
                <td className="p-2 whitespace-nowrap">{new Date(e.created_at).toISOString().replace("T", " ").slice(0, 19)}</td>
                <td className="p-2">{KIND_LABEL[e.kind] ?? e.kind}</td>
                <td className="p-2 break-all font-mono">{e.method} {e.path}{e.details ? ` — ${JSON.stringify(e.details)}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="font-bold mt-6 mb-2">4. Observações para o registro de ocorrência</h2>
        <p>Os registros acima foram gerados automaticamente pelo sistema de monitoramento da plataforma no momento de cada requisição, com data e hora do servidor. A identificação do responsável pelo endereço IP depende de requisição ao provedor de conexão, mediante ordem judicial (Lei 12.965/2014 — Marco Civil da Internet, arts. 10, 13 e 22).</p>
        <p className="mt-2">Possíveis enquadramentos a serem avaliados pela autoridade: art. 154-A do Código Penal (invasão de dispositivo informático) e demais dispositivos aplicáveis.</p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return <Suspense><Report /></Suspense>;
}
