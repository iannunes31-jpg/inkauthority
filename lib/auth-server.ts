import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { requestInfo, securityEvent } from "@/lib/security";
import { isAdminUser, isStaffUser } from "@/lib/admin";

/** Server-side: is the currently signed-in user an admin? Never trust the client for this. */
// Admins and testers: admin panel and every product. Testers are let in here.
export async function checkIsAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user ? user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null : null;
  const isStaff = !!user && isStaffUser(email, user.publicMetadata);
  if (!isStaff) await reportAdminDenied(user?.id ?? null);
  return isStaff;
}

/** Real admins only: changing roles, the security panel, deleting courses and similar. */
export async function checkIsFullAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  return isAdminUser(email, user.publicMetadata);
}

// Only admin API routes count as an attack; other pages also ask "is admin?" for normal students.
async function reportAdminDenied(userId: string | null) {
  try {
    const h = await headers();
    const path = h.get("x-ia-path") || "";
    if (!path.startsWith("/api/admin")) return;
    await securityEvent("admin_denied", "medium", requestInfo(h, { path, method: h.get("x-ia-method") || undefined, userId }));
  } catch {}
}
