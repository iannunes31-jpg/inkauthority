import { NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/coupons";
import { PRODUCT_CATALOG } from "@/lib/products";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

export async function GET() {
  if (!(await checkIsAdmin())) return forbidden();
  const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const b = await req.json();

  const code = normalizeCode(b.code);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    return NextResponse.json({ error: "Código deve ter 3 a 30 letras, números, - ou _." }, { status: 400 });
  }
  const discount_type = b.discount_type === "fixed" ? "fixed" : "percent";
  const discount_value = Number(b.discount_value);
  if (!(discount_value > 0) || (discount_type === "percent" && discount_value > 100)) {
    return NextResponse.json({ error: "Desconto inválido." }, { status: 400 });
  }
  const applies_to: string[] = Array.isArray(b.applies_to) ? b.applies_to.filter((p: string) => p in PRODUCT_CATALOG) : [];
  const max_uses = b.max_uses === "" || b.max_uses == null ? null : Math.max(1, Math.floor(Number(b.max_uses)));
  const expires_at = b.expires_at ? new Date(`${b.expires_at}T23:59:59-03:00`).toISOString() : null;

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert({
      code,
      discount_type,
      discount_value,
      applies_to,
      duration: b.duration === "forever" ? "forever" : "once",
      max_uses,
      one_per_user: b.one_per_user !== false,
      expires_at,
      active: true,
    })
    .select()
    .single();

  if (error) {
    const msg = error.code === "23505" ? "Já existe um cupom com esse código." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const { id, active } = await req.json();
  const { error } = await supabaseAdmin.from("coupons").update({ active: !!active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!(await checkIsAdmin())) return forbidden();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
