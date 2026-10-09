import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkIsAdmin } from "@/lib/auth-server";

// The browser's anon key can't read user_purchases under RLS, so purchase
// checks go through here, scoped to the signed-in user only.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [isAdmin, { data, error }] = await Promise.all([
    checkIsAdmin(),
    supabaseAdmin.from("user_purchases").select("product_id, product_type").eq("user_id", userId),
  ]);

  if (error) {
    console.error("[me/access] error:", error);
    return NextResponse.json({ error: "Erro ao verificar acesso" }, { status: 500 });
  }

  return NextResponse.json(
    { isAdmin, purchases: data ?? [] },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
