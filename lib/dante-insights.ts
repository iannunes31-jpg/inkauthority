import { supabaseAdmin } from "@/lib/supabase-admin";
import { STAGES, CLOSING_STAGES, STALLED_AFTER_HOURS, StageKey, isStage } from "@/lib/dante";

export type LeadRow = {
  jid: string;
  phone: string;
  name: string | null;
  stage: StageKey;
  stalled: boolean;
  lastActivity: string | null;
  lastFrom: "cliente" | "dante" | null;
  lastText: string;
  messages: number;
  followups: number;
};

export async function getInsights(userId: string) {
  const since = new Date(Date.now() - 90 * 86400_000).toISOString();
  const [{ data: customers }, { data: history }] = await Promise.all([
    supabaseAdmin.from("customers").select("*").eq("clerk_user_id", userId),
    supabaseAdmin
      .from("chat_history")
      .select("phone_number, role, content, created_at")
      .eq("clerk_user_id", userId)
      .in("role", ["user", "assistant"])
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(20000),
  ]);

  const byPhone = new Map<string, { role: string; content: string; created_at: string }[]>();
  for (const m of history ?? []) {
    if (!byPhone.has(m.phone_number)) byPhone.set(m.phone_number, []);
    byPhone.get(m.phone_number)!.push(m);
  }

  const now = Date.now();
  const monthAgo = now - 30 * 86400_000;
  const phones = new Set<string>([...(customers ?? []).map((c) => c.phone_number), ...byPhone.keys()]);

  const leads: LeadRow[] = [...phones].map((phone) => {
    const c = (customers ?? []).find((x) => x.phone_number === phone);
    const msgs = byPhone.get(phone) ?? [];
    const last = msgs[msgs.length - 1];
    const stage: StageKey = isStage(c?.stage) ? c.stage : msgs.length ? "qualificando" : "novo";
    const lastTime = last ? new Date(last.created_at).getTime() : null;
    const open = stage !== "fechado" && stage !== "perdido";
    return {
      jid: phone,
      phone: phone.split("@")[0],
      name: c?.name ?? null,
      stage,
      stalled: open && !!lastTime && now - lastTime > STALLED_AFTER_HOURS * 3600_000,
      lastActivity: last?.created_at ?? null,
      lastFrom: last ? (last.role === "user" ? "cliente" : "dante") : null,
      lastText: (last?.content ?? "").slice(0, 160),
      messages: msgs.filter((m) => m.role === "user").length,
      followups: c?.followups_sent ?? 0,
    };
  });
  leads.sort((a, b) => (b.lastActivity ?? "").localeCompare(a.lastActivity ?? ""));

  const received30d = (history ?? []).filter((m) => m.role === "user" && new Date(m.created_at).getTime() >= monthAgo).length;
  const stageCounts = Object.fromEntries(STAGES.map((s) => [s.key, leads.filter((l) => l.stage === s.key).length])) as Record<StageKey, number>;

  const daily: { day: string; received: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400_000).toISOString().slice(0, 10);
    daily.push({ day: d, received: (history ?? []).filter((m) => m.role === "user" && m.created_at.startsWith(d)).length });
  }

  const closed = stageCounts.fechado;
  return {
    totals: {
      conversations: leads.length,
      received30d,
      closing: leads.filter((l) => CLOSING_STAGES.includes(l.stage)).length,
      stalled: leads.filter((l) => l.stalled).length,
      closed,
      lost: stageCounts.perdido,
      conversion: leads.length ? Math.round((closed / leads.length) * 100) : 0,
    },
    stageCounts,
    daily,
    leads,
    histories: byPhone,
  };
}

/** Compact text version of the data for the strategy chat. */
export function insightsForPrompt(data: Awaited<ReturnType<typeof getInsights>>) {
  const t = data.totals;
  const stageLine = STAGES.map((s) => `${s.label}: ${data.stageCounts[s.key]}`).join(" | ");
  const leadLines = data.leads.slice(0, 30).map((l) => {
    const msgs = (data.histories.get(l.jid) ?? []).slice(-4);
    const convo = msgs.map((m) => `${m.role === "user" ? "Cliente" : "Dante"}: ${m.content.slice(0, 140).replace(/\s+/g, " ")}`).join(" / ");
    return `- ${l.name || "+" + l.phone} | etapa: ${l.stage}${l.stalled ? " (PARADO)" : ""} | ultima atividade: ${l.lastActivity?.slice(0, 16) ?? "-"} | follow-ups: ${l.followups} | ${convo}`;
  });
  return `RESUMO (ultimos 90 dias)
Conversas: ${t.conversations} | Mensagens recebidas (30 dias): ${t.received30d} | Quase fechando: ${t.closing} | Paradas: ${t.stalled} | Fechadas: ${t.closed} | Perdidas: ${t.lost} | Conversao: ${t.conversion}%
Por etapa: ${stageLine}
Mensagens recebidas por dia (14 dias): ${data.daily.map((d) => `${d.day.slice(5)}=${d.received}`).join(", ")}

CONVERSAS (mais recentes primeiro):
${leadLines.join("\n") || "- nenhuma ainda"}`;
}
