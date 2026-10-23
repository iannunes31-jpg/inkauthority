import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TERMS_VERSION } from "@/lib/terms";

// Whether the signed-in user accepted the current Terms version.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("terms_acceptances")
    .select("accepted_at")
    .eq("user_id", userId)
    .eq("version", TERMS_VERSION)
    .maybeSingle();
  if (error) {
    console.error("[terms] read failed:", error.message);
    return NextResponse.json({ error: "Não foi possível verificar os Termos." }, { status: 500 });
  }
  return NextResponse.json({ version: TERMS_VERSION, accepted: !!data, acceptedAt: data?.accepted_at ?? null });
}

// Records the acceptance with IP and device, as proof.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { version } = await req.json().catch(() => ({}));
  if (version !== TERMS_VERSION) {
    return NextResponse.json({ error: "Os Termos foram atualizados. Recarregue a página." }, { status: 409 });
  }

  const user = await currentUser();
  const { error } = await supabaseAdmin.from("terms_acceptances").upsert(
    {
      user_id: userId,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      version: TERMS_VERSION,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      user_agent: req.headers.get("user-agent")?.slice(0, 400) || null,
    },
    { onConflict: "user_id,version", ignoreDuplicates: true }
  );
  if (error) {
    console.error("[terms] accept failed:", error.message);
    return NextResponse.json({ error: "Não foi possível registrar o aceite. Tente de novo." }, { status: 500 });
  }
  return NextResponse.json({ accepted: true });
}
