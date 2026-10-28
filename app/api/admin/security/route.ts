import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkIsFullAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { blockIp, unblockIp } from "@/lib/security";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Security panel data. ?ip=X returns every event of one IP (for the police report).
export async function GET(req: Request) {
  if (!(await checkIsFullAdmin())) return forbidden();
  const params = new URL(req.url).searchParams;
  const ip = params.get("ip");

  if (params.get("summary")) {
    const { count } = await supabaseAdmin
      .from("security_events")
      .select("id", { count: "exact", head: true })
      .in("severity", ["high", "critical"])
      .gte("created_at", new Date(Date.now() - 86400_000).toISOString());
    return NextResponse.json({ serious24h: count ?? 0 }, { headers: { "Cache-Control": "no-store" } });
  }

  if (ip) {
    const [{ data: events }, { data: block }] = await Promise.all([
      supabaseAdmin.from("security_events").select("*").eq("ip", ip).order("created_at", { ascending: true }).limit(2000),
      supabaseAdmin.from("blocked_ips").select("*").eq("ip", ip).maybeSingle(),
    ]);
    return NextResponse.json({ ip, events: events ?? [], block }, { headers: { "Cache-Control": "no-store" } });
  }

  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [{ data: events, error }, { data: blocks }] = await Promise.all([
    supabaseAdmin.from("security_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(500),
    supabaseAdmin.from("blocked_ips").select("*").gt("blocked_until", new Date().toISOString()).order("created_at", { ascending: false }),
  ]);
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json({ error: missing ? "setup" : error.message }, { status: missing ? 409 : 500 });
  }
  return NextResponse.json({ events: events ?? [], blocks: blocks ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

// { action: "block" | "unblock", ip, hours? }
export async function POST(req: Request) {
  if (!(await checkIsFullAdmin())) return forbidden();
  const { action, ip, hours } = await req.json().catch(() => ({}));
  if (!ip || typeof ip !== "string" || ip.length > 64) return NextResponse.json({ error: "IP inválido." }, { status: 400 });
  const { userId } = await auth();
  if (action === "unblock") await unblockIp(ip);
  else if (action === "block") await blockIp(ip, `Bloqueio manual (admin ${userId?.slice(-6)})`, Math.min(Math.max(Number(hours) || 24, 1), 24 * 365));
  else return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
