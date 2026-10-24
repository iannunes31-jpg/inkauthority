// Ink Authority security agent: logs suspicious requests, blocks attacking IPs and emails alerts.
// Uses only fetch (Supabase REST + Resend), so it runs both in the middleware (edge) and in API routes.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const ALERT_EMAIL = process.env.SECURITY_ALERT_EMAIL || "yurilojavirtual@gmail.com";

export type Severity = "low" | "medium" | "high" | "critical";
export type EventKind =
  | "probe" | "injection" | "admin_denied" | "forged_webhook" | "forged_cron"
  | "rate_limited" | "role_change" | "blocked_hit";

export type RequestInfo = { ip: string; method?: string; path?: string; userAgent?: string; country?: string; userId?: string | null };

const BLOCK_HOURS = 24;
// How many events of a kind from one IP within 10 minutes get it blocked (0 = never block for this kind).
const STRIKES: Record<EventKind, number> = {
  probe: 1, injection: 1, admin_denied: 5, forged_cron: 3, rate_limited: 20,
  forged_webhook: 0, // could be our own WhatsApp server with an outdated URL: never block, only log
  role_change: 0, blocked_hit: 0,
};

const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY!,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

export function requestInfo(headers: Headers, extra: Partial<RequestInfo> = {}): RequestInfo {
  return {
    ip: headers.get("x-real-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido",
    userAgent: headers.get("user-agent")?.slice(0, 300) || undefined,
    country: headers.get("x-vercel-ip-country") || undefined,
    ...extra,
  };
}

// --- Blocking -------------------------------------------------------------

const blockCache = new Map<string, { blocked: boolean; at: number }>();

/** Whether an IP is blocked right now (cached for a minute per server instance). */
export async function isBlocked(ip: string) {
  if (!SUPABASE_URL || !SERVICE_KEY || ip === "desconhecido") return false;
  const cached = blockCache.get(ip);
  if (cached && Date.now() - cached.at < 60_000) return cached.blocked;
  try {
    const res = await db(`blocked_ips?select=ip&ip=eq.${encodeURIComponent(ip)}&blocked_until=gt.${new Date().toISOString()}&limit=1`);
    const rows = res.ok ? await res.json() : [];
    const blocked = Array.isArray(rows) && rows.length > 0;
    blockCache.set(ip, { blocked, at: Date.now() });
    if (blockCache.size > 10_000) blockCache.clear();
    return blocked;
  } catch {
    return false; // never take the site down because the check failed
  }
}

export async function blockIp(ip: string, reason: string, hours = BLOCK_HOURS) {
  if (!SUPABASE_URL || !SERVICE_KEY || ip === "desconhecido") return;
  const until = new Date(Date.now() + hours * 3600_000).toISOString();
  await db("blocked_ips?on_conflict=ip", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ ip, reason, blocked_until: until, created_at: new Date().toISOString() }),
  }).catch(() => {});
  blockCache.set(ip, { blocked: true, at: Date.now() });
}

export async function unblockIp(ip: string) {
  await db(`blocked_ips?ip=eq.${encodeURIComponent(ip)}`, { method: "DELETE" });
  blockCache.delete(ip);
}

// --- Events ---------------------------------------------------------------

/** Records a suspicious request; blocks the IP and emails an alert when it crosses the limit. */
export async function securityEvent(kind: EventKind, severity: Severity, info: RequestInfo, details?: Record<string, unknown>) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    await db("security_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        ip: info.ip, kind, severity, method: info.method, path: info.path?.slice(0, 500),
        user_agent: info.userAgent, user_id: info.userId ?? null, country: info.country, details: details ?? null,
      }),
    });

    if (kind === "role_change") {
      await sendAlert(`Cargo de admin alterado`, describe(kind, info, details));
      return;
    }

    const limit = STRIKES[kind];
    if (!limit || info.ip === "desconhecido") return;
    let count = 1;
    if (limit > 1) {
      const since = new Date(Date.now() - 10 * 60_000).toISOString();
      const res = await db(`security_events?select=id&ip=eq.${encodeURIComponent(info.ip)}&kind=eq.${kind}&created_at=gt.${since}`, {
        headers: { Prefer: "count=exact", Range: "0-0" },
      });
      count = Number(res.headers.get("content-range")?.split("/")[1] || 1);
    }
    if (count >= limit && !(await isBlocked(info.ip))) {
      await blockIp(info.ip, `${LABELS[kind]} (${count}x)`, kind === "rate_limited" ? 1 : BLOCK_HOURS);
      await sendAlert(`IP bloqueado: ${info.ip}`, describe(kind, info, details, count));
    }
  } catch (err) {
    console.error("[security] event failed", err);
  }
}

export const LABELS: Record<EventKind, string> = {
  probe: "Varredura de falhas (procurou arquivos/painéis de outros sistemas)",
  injection: "Tentativa de invasão no endereço (SQL/script)",
  admin_denied: "Tentou usar funções de administrador sem permissão",
  forged_webhook: "Chamada falsa ao WhatsApp/pagamentos",
  forged_cron: "Tentou disparar rotina automática do site",
  rate_limited: "Excesso de tentativas seguidas",
  role_change: "Cargo de administrador alterado",
  blocked_hit: "IP bloqueado tentando acessar",
};

function describe(kind: EventKind, info: RequestInfo, details?: Record<string, unknown>, count?: number) {
  const rows = [
    ["O que aconteceu", LABELS[kind] + (count ? ` — ${count} vez(es) em 10 minutos` : "")],
    ["Quando", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })],
    ["IP", info.ip],
    ["País", info.country || "-"],
    ["Endereço acessado", `${info.method || ""} ${info.path || "-"}`],
    ["Navegador / ferramenta", info.userAgent || "-"],
    ["Usuário logado", info.userId || "nenhum"],
    ["Detalhes", details ? JSON.stringify(details) : "-"],
  ];
  return rows.map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666">${k}</td><td style="padding:6px 12px"><b>${escapeHtml(String(v))}</b></td></tr>`).join("");
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// --- Alerts ---------------------------------------------------------------

/**
 * Sends the security alert by every channel available:
 * e-mail (when RESEND_API_KEY exists) and WhatsApp to the alert owner's phone, sent from the
 * Ink Authority sales number or, if that one is offline, from the owner's own connected WhatsApp.
 * Every event is also on Admin → Segurança, so nothing is lost when no channel is connected.
 */
export async function sendAlert(subject: string, tableRows: string, intro = "O agente de segurança da Ink Authority registrou o evento abaixo.") {
  const [mail, whats] = await Promise.all([sendEmail(subject, tableRows, intro), sendWhatsApp(subject, tableRows, intro)]);
  if (!mail && !whats) console.warn("[security] alerta só no painel (nenhum canal conectado):", subject);
  return mail || whats;
}

async function sendEmail(subject: string, tableRows: string, intro: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px">
<h2 style="margin:0 0 8px">🛡️ ${escapeHtml(subject)}</h2><p style="color:#444">${intro}</p>
<table style="border-collapse:collapse;border:1px solid #eee;width:100%">${tableRows}</table>
<p style="color:#888;font-size:12px;margin-top:16px">Veja tudo e gere o relatório para boletim de ocorrência em Admin → Segurança.</p></div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.SECURITY_ALERT_FROM || "Ink Authority Segurança <onboarding@resend.dev>",
      to: [ALERT_EMAIL],
      subject: `[Ink Authority] ${subject}`,
      html,
    }),
  }).catch(() => null);
  if (!res?.ok) console.error("[security] alert email failed", res?.status);
  return !!res?.ok;
}

const EVOLUTION_URL = () => process.env.EVOLUTION_API_URL || "https://evolution-api-production-fbfd.up.railway.app";
const SALES_INSTANCE = "inkauthority-vendas";

// The alert owner (ALERT_EMAIL) in Clerk: phone from the signup form and the id that names their WhatsApp instance.
let ownerCache: { phone: string | null; id: string | null; at: number } | null = null;
async function alertOwner() {
  if (ownerCache && Date.now() - ownerCache.at < 3600_000) return ownerCache;
  const fixed = process.env.SECURITY_ALERT_WHATSAPP?.replace(/\D/g, "") || null;
  let phone = fixed, id: string | null = null;
  try {
    const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(ALERT_EMAIL)}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    const user = ((await res.json()) as any[])?.[0];
    id = user?.id ?? null;
    if (!phone) {
      const raw = String(user?.unsafe_metadata?.telefone ?? user?.phone_numbers?.[0]?.phone_number ?? "").replace(/\D/g, "");
      phone = raw.length === 10 || raw.length === 11 ? `55${raw}` : raw || null;
    }
  } catch {}
  ownerCache = { phone, id, at: Date.now() };
  return ownerCache;
}

async function instanceOpen(name: string) {
  const res = await fetch(`${EVOLUTION_URL()}/instance/connectionState/${name}`, { headers: { apikey: process.env.EVOLUTION_API_KEY! } }).catch(() => null);
  const body = await res?.json().catch(() => null);
  return (body?.instance?.state || body?.state) === "open";
}

async function sendWhatsApp(subject: string, tableRows: string, intro: string) {
  if (!process.env.EVOLUTION_API_KEY) return false;
  const owner = await alertOwner();
  if (!owner.phone) return false;
  const from = (await instanceOpen(SALES_INSTANCE)) ? SALES_INSTANCE : owner.id && (await instanceOpen(owner.id)) ? owner.id : null;
  if (!from) return false;
  // The HTML table rows become "label: value" lines.
  const lines = [...tableRows.matchAll(/<td[^>]*>(.*?)<\/td><td[^>]*>(?:<b>)?(.*?)(?:<\/b>)?<\/td>/g)]
    .map((m) => `*${m[1]}:* ${m[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')}`);
  const text = `🛡️ *${subject}*\n${intro}\n\n${lines.join("\n")}\n\nDetalhes e relatório para BO: inkauthority.com.br/admin/seguranca`;
  const res = await fetch(`${EVOLUTION_URL()}/message/sendText/${from}`, {
    method: "POST",
    headers: { apikey: process.env.EVOLUTION_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: owner.phone, text: text.slice(0, 3500) }),
  }).catch(() => null);
  if (!res?.ok) console.error("[security] alert whatsapp failed", res?.status);
  return !!res?.ok;
}

// --- Request inspection (middleware) --------------------------------------

// Paths that only make sense when someone is scanning for holes in other platforms.
const PROBE = /(^|\/)(\.env|\.git|\.aws|\.ssh|\.DS_Store|wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|pma|cgi-bin|server-status|actuator|vendor\/phpunit|etc\/passwd|boaform|HNAP1|owa\/|autodiscover|\.well-known\/security\.txt\.bak)|\.(php|asp|aspx|jsp|cgi|bak|sql|ini|log)$/i;
const INJECTION = /(union(\s|%20|\+)+select|select(\s|%20|\+).+from|<script|%3Cscript|javascript:|\$\{jndi:|\.\.\/\.\.\/|%2e%2e%2f|'\s*or\s*'?1'?\s*=\s*'?1|sleep\(\d|benchmark\(|information_schema)/i;

export function inspectUrl(pathname: string, search: string): { kind: EventKind; match: string } | null {
  if (PROBE.test(pathname)) return { kind: "probe", match: pathname };
  let decoded = search;
  try { decoded = decodeURIComponent(search); } catch {}
  const target = pathname + decoded;
  const m = target.match(INJECTION);
  if (m) return { kind: "injection", match: m[0] };
  return null;
}
