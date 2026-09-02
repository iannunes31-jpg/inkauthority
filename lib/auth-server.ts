import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";

/** Server-side: is the currently signed-in user an admin? Never trust the client for this. */
export async function checkIsAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  return isAdminUser(email, user.publicMetadata);
}
