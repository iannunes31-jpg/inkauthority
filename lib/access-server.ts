import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkIsAdmin } from "@/lib/auth-server";
import { ACCESS_TYPES } from "@/lib/pricing";

export async function userHasAccess(userId: string, kind: keyof typeof ACCESS_TYPES) {
  if (await checkIsAdmin()) return true;
  const { data, error } = await supabaseAdmin
    .from("user_purchases")
    .select("id")
    .eq("user_id", userId)
    .in("product_type", ACCESS_TYPES[kind])
    .limit(1);
  if (error) console.error("[access] check failed:", error);
  return !!data && data.length > 0;
}

export function planRequired() {
  return NextResponse.json({ error: "Assinatura necessária para usar esta ferramenta." }, { status: 403 });
}
