import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { registerWebhook } from "@/lib/evolution-webhook";
import { SALES_INSTANCE, getSalesSettings, saveSalesSettings } from "@/lib/sales-assistant";

const evolutionUrl = process.env.EVOLUTION_API_URL || "https://evolution-api-production-fbfd.up.railway.app";
const apiKey = process.env.EVOLUTION_API_KEY!;
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

async function connectionState() {
  const res = await fetch(`${evolutionUrl}/instance/connectionState/${SALES_INSTANCE}`, { headers: { apikey: apiKey } });
  if (res.status === 404) return "not_found";
  const data = await res.json().catch(() => null);
  return data?.instance?.state || data?.state || "unknown";
}

export async function GET() {
  if (!(await checkIsAdmin())) return forbidden();

  const [settings, state, history] = await Promise.all([
    getSalesSettings(),
    connectionState().catch(() => "unknown"),
    supabaseAdmin
      .from("chat_history")
      .select("phone_number, role, content, created_at")
      .eq("clerk_user_id", SALES_INSTANCE)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);
  if (state === "open") await registerWebhook(SALES_INSTANCE);

  return NextResponse.json({ settings, state, recent: history.data ?? [] });
}

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const body = await req.json();

  if (body.action === "save") {
    const s = body.settings ?? {};
    const { error } = await saveSalesSettings({
      is_active: !!s.is_active,
      extra_info: String(s.extra_info ?? "").slice(0, 6000),
      human_contact: String(s.human_contact ?? "").slice(0, 300),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (body.action === "connect") {
    let res = await fetch(`${evolutionUrl}/instance/connect/${SALES_INSTANCE}`, { headers: { apikey: apiKey } });
    let data = await res.json().catch(() => ({}));
    if (res.status === 404 || data?.error || data?.statusCode === 404) {
      res = await fetch(`${evolutionUrl}/instance/create`, {
        method: "POST",
        headers: { apikey: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ instanceName: SALES_INSTANCE, qrcode: true, integration: "WHATSAPP-BAILEYS" }),
      });
      data = await res.json().catch(() => ({}));
    }
    await registerWebhook(SALES_INSTANCE);
    const qr = data?.base64 || data?.qrcode?.base64 || (typeof data?.qrcode === "string" ? data.qrcode : null);
    return NextResponse.json({ qr, raw: qr ? undefined : data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
