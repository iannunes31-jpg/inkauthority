import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isStaffUser } from "@/lib/admin";
import { NextResponse } from "next/server";
import { blockIp, inspectUrl, isBlocked, requestInfo, securityEvent } from "@/lib/security";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
// Calls from our own providers' servers (payments, WhatsApp, login, Vercel cron) are never IP-blocked:
// blocking them would break the site. They have their own signature/secret checks.
const isServerToServer = createRouteMatcher(["/api/webhook(.*)", "/api/webhooks(.*)", "/api/whatsapp/webhook", "/api/stripe/webhook", "/api/cron(.*)"]);

function blockedPage(ip: string) {
  return new NextResponse(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Acesso bloqueado</title>
<body style="background:#080808;color:#eee;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center">
<div><h1 style="font-weight:300;letter-spacing:.2em">INK AUTHORITY</h1><p>Seu acesso foi bloqueado temporariamente por atividade suspeita.</p>
<p style="color:#888;font-size:13px">Se você acha que isso é um engano, fale com o suporte informando o código: ${ip.replace(/[^0-9a-f.:]/gi, "")}</p></div></body></html>`,
    { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname, search } = req.nextUrl;
  const serverToServer = isServerToServer(req);
  const info = requestInfo(req.headers, { method: req.method, path: pathname + search });

  if (!serverToServer) {
    // 1. Attack signatures in the URL: log, block the IP right away and stop here.
    const hit = inspectUrl(pathname, search);
    if (hit) {
      await securityEvent(hit.kind, "high", info, { match: hit.match });
      await blockIp(info.ip, hit.kind === "probe" ? "Varredura de falhas" : "Tentativa de invasão no endereço");
      return blockedPage(info.ip);
    }
  }

  const { userId } = await auth();

  // 2. IPs already blocked by the agent. A signed-in admin still gets through, so an admin on a
  // blocked network (or blocked by mistake) can always reach the panel and lift the block.
  if (!serverToServer && (await isBlocked(info.ip))) {
    let admin = false;
    if (userId) {
      try {
        const user = await (await clerkClient()).users.getUser(userId);
        admin = isStaffUser(user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress, user.publicMetadata);
      } catch {}
    }
    if (!admin) return blockedPage(info.ip);
  }

  // Se estiver logado e tentar acessar a home, redireciona pro dashboard
  if (userId && pathname === "/") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Se tentar acessar rota protegida sem login, manda pra home
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/", req.url); // Volta para a home
      return NextResponse.redirect(signInUrl);
    }
  }

  // Lets API routes know the path that was called (used by the security agent's logs).
  const headers = new Headers(req.headers);
  headers.set("x-ia-path", pathname);
  headers.set("x-ia-method", req.method);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
