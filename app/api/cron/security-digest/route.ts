import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { LABELS, requestInfo, securityEvent, sendAlert, type EventKind } from "@/lib/security";

// Daily summary of the security agent's last 24 hours, by email.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    await securityEvent("forged_cron", "medium", requestInfo(req.headers, { method: "GET", path: new URL(req.url).pathname }));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 86400_000).toISOString();
  const [{ data: events }, { data: blocks }] = await Promise.all([
    supabaseAdmin.from("security_events").select("kind, ip").gte("created_at", since).limit(5000),
    supabaseAdmin.from("blocked_ips").select("ip, reason").gte("created_at", since),
  ]);

  const byKind = new Map<string, number>();
  const byIp = new Map<string, number>();
  for (const e of events ?? []) {
    byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);
    byIp.set(e.ip, (byIp.get(e.ip) ?? 0) + 1);
  }
  const row = (k: string, v: string) => `<tr><td style="padding:6px 12px;color:#666">${k}</td><td style="padding:6px 12px"><b>${v}</b></td></tr>`;
  const rows = [
    row("Eventos suspeitos (24h)", String(events?.length ?? 0)),
    row("IPs bloqueados (24h)", String(blocks?.length ?? 0)),
    ...[...byKind].map(([k, n]) => row(LABELS[k as EventKind] ?? k, String(n))),
    ...[...byIp].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ip, n]) => row(`IP mais ativo`, `${ip} — ${n} evento(s)`)),
  ].join("");

  const quiet = !events?.length;
  await sendAlert(
    quiet ? "Resumo diário: nenhuma atividade suspeita" : `Resumo diário: ${events!.length} evento(s), ${blocks?.length ?? 0} bloqueio(s)`,
    rows,
    quiet ? "Tudo tranquilo nas últimas 24 horas." : "Resumo das últimas 24 horas do agente de segurança."
  );
  return NextResponse.json({ ok: true, events: events?.length ?? 0 });
}
