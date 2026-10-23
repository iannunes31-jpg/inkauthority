import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TERMS_VERSION } from "@/lib/terms";

// The acceptance lives in the user's private Clerk metadata, so it works without any table.
// The terms_acceptances table (supabase-terms.sql) is an optional extra copy for reports.
type Accepted = { version: string; accepted_at: string; ip: string | null; user_agent: string | null };

// Whether the signed-in user accepted the current Terms version.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const terms = (user?.privateMetadata?.terms ?? null) as Accepted | null;
  const accepted = terms?.version === TERMS_VERSION;
  return NextResponse.json({ version: TERMS_VERSION, accepted, acceptedAt: accepted ? terms!.accepted_at : null });
}

// Records the acceptance with IP and device, as proof.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { version } = await req.json().catch(() => ({}));
  if (version !== TERMS_VERSION) {
    return NextResponse.json({ error: "Os Termos foram atualizados. Recarregue a página." }, { status: 409 });
  }

  const record: Accepted = {
    version: TERMS_VERSION,
    accepted_at: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    user_agent: req.headers.get("user-agent")?.slice(0, 400) || null,
  };

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { privateMetadata: { terms: record } });
  } catch (err: any) {
    console.error("[terms] accept failed:", err?.message);
    return NextResponse.json({ error: "Não foi possível registrar o aceite. Tente de novo." }, { status: 500 });
  }

  const user = await currentUser();
  const { error } = await supabaseAdmin.from("terms_acceptances").upsert(
    { user_id: userId, email: user?.primaryEmailAddress?.emailAddress ?? null, ...record },
    { onConflict: "user_id,version", ignoreDuplicates: true }
  );
  if (error) console.warn("[terms] table copy skipped:", error.message);

  return NextResponse.json({ accepted: true });
}
