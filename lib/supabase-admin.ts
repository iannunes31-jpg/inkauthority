import { createClient } from "@supabase/supabase-js";
import { supabase as anonClient } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only Supabase client using the service role key — bypasses Row
 * Level Security. Use this from webhooks, cron jobs, and other
 * server-trusted code that writes data on behalf of the system (not on
 * behalf of "whichever browser happened to call this").
 *
 * Falls back to the public anon client (today's behavior) if
 * SUPABASE_SERVICE_ROLE_KEY isn't set yet, so nothing breaks before you've
 * added it — see supabase-security-migration.sql for why you need it and
 * what to run once it's in place.
 *
 * Get the key from the Supabase dashboard: Settings -> API -> service_role
 * secret. Add it to .env.local AND your Vercel project's env vars. Never
 * expose it to the browser (no NEXT_PUBLIC_ prefix) and never import this
 * file from a "use client" component.
 */
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : (console.warn(
      "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY not set — falling back to the anon client. " +
        "This works today because RLS isn't locked down yet, but you must set this key before " +
        "applying supabase-security-migration.sql or these server routes will start failing."
    ),
    anonClient);
