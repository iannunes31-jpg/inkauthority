/**
 * Single source of truth for "is this user an admin?".
 *
 * Before this file, the same two hardcoded emails were copy-pasted across
 * Navbar.tsx, dashboard/courses/page.tsx, tools/tutor/page.tsx and
 * tools/whatsapp/page.tsx — and none of it was ever checked on the server.
 * `/admin` itself had NO admin check at all (middleware only required being
 * logged in), so any signed-up student could open /admin directly.
 *
 * This file is safe to import from both client and server code (no
 * `@clerk/nextjs/server` import here) — see lib/auth-server.ts for the
 * server-side helper that actually enforces this.
 */
// Confirmed by the project owner: the only two people who should hold
// admin/super-admin — Yuri Andrade (2 personal emails) and Isabela Badini.
const ADMIN_EMAILS = [
  "yurilojavirtual@gmail.com",
  "o9.yuri@gmail.com",
  "isabelabadinitattoorj@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function isAdminMetadata(publicMetadata?: unknown): boolean {
  const role = (publicMetadata as { role?: unknown } | undefined)?.role;
  return typeof role === "string" && role.toLowerCase() === "admin";
}

/** True if either check (legacy hardcoded email, or Clerk role metadata) says admin. */
export function isAdminUser(email?: string | null, publicMetadata?: unknown): boolean {
  return isAdminEmail(email) || isAdminMetadata(publicMetadata);
}
