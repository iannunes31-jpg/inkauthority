import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth-server";
import { requestInfo, securityEvent } from "@/lib/security";

// Grants or removes the admin role. Admin-only: without this check anyone signed in
// could make themselves admin.
export async function POST(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, role } = await req.json();
    if (!userId || typeof userId !== "string") return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (role != null && role !== "Admin" && role !== "admin") {
      return NextResponse.json({ error: "Cargo inválido." }, { status: 400 });
    }

    const { userId: me } = await auth();
    if (userId === me && !role) {
      return NextResponse.json({ error: "Você não pode remover o seu próprio acesso de admin." }, { status: 400 });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: role ? "Admin" : null },
    });
    console.log("[set-role]", me, "set", userId, "to", role ? "Admin" : "none");
    await securityEvent("role_change", "critical", requestInfo(req.headers, { method: "POST", path: "/api/admin/set-role", userId: me }), {
      alvo: userId,
      novoCargo: role ? "Admin" : "sem cargo",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("set-role error:", err);
    return NextResponse.json({ error: "Não foi possível alterar o cargo." }, { status: 500 });
  }
}
