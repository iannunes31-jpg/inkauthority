-- ==============================================================================
-- SECURITY MIGRATION: enable Row Level Security across the app's tables.
--
-- WHY: none of the 18 tables in supabase_schema.sql have RLS enabled. Combined
-- with NEXT_PUBLIC_SUPABASE_ANON_KEY being public (shipped in every page's JS
-- bundle), this means ANYONE on the internet can currently read and write
-- every table directly through the Supabase REST API — bypassing the app
-- entirely. Concretely, today, anyone can:
--   - INSERT a row into user_purchases to unlock any paid course for free.
--   - Read every user's WhatsApp chat_history, customers, appointments.
--   - Upload arbitrary files to the public "community" storage bucket.
--
-- HOW TO RUN: paste this whole file into the Supabase dashboard's SQL Editor
-- (your project -> SQL Editor -> New query) and run it.
--
-- BEFORE YOU RUN THIS: the app's code was updated to write to Supabase from
-- trusted server routes (webhooks, cron jobs) using a service-role client
-- (lib/supabase-admin.ts) instead of the public anon key, because a
-- service-role key bypasses RLS. You MUST set SUPABASE_SERVICE_ROLE_KEY
-- (Supabase dashboard -> Settings -> API -> "service_role" secret) in both
-- .env.local and your Vercel project's environment variables, and redeploy,
-- BEFORE running this migration — otherwise the Stripe webhook, the Clerk
-- webhook, the WhatsApp bot, and the two cron jobs will stop being able to
-- write to the database the moment RLS takes effect.
--
-- WHAT THIS DOES NOT FIX YET: a few admin pages (app/admin/courses,
-- app/admin/library) and the "Configurações" tab of the WhatsApp tool
-- (ai_settings) currently write to Supabase directly from the browser with
-- the anon key, trusting whatever clerk_user_id/role the browser claims.
-- The app now blocks non-admins from even loading those pages
-- (app/admin/layout.tsx), but that's a UI-level gate, not a database-level
-- one — someone who found the anon key could still call the Supabase REST
-- API directly. Properly closing that requires moving those writes behind
-- API routes that check checkIsAdmin() / the real Clerk user id
-- server-side (the same pattern already used for /api/whatsapp/instance and
-- /api/checkout). Ask for that as a follow-up. Until then, `courses`,
-- `modules`, `lessons`, `library_resources` and `ai_settings` are left with
-- permissive policies below (matching today's behavior — not a regression,
-- but not fully fixed either).
-- ==============================================================================


-- ------------------------------------------------------------------
-- 1. Tables locked down to service-role-only writes (no client, admin
--    page, or webhook writes these except the server routes that already
--    use supabaseAdmin). Public read kept where the app already reads
--    these without auth (no behavior change), write policies simply
--    omitted so only the service role (which bypasses RLS) can write.
-- ------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read users" ON public.users;
CREATE POLICY "public read users" ON public.users FOR SELECT USING (true);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read user_purchases" ON public.user_purchases;
CREATE POLICY "public read user_purchases" ON public.user_purchases FOR SELECT USING (true);
-- No insert/update/delete policy on purpose: only the Stripe webhook
-- (service role) should ever create a purchase record. This is the fix for
-- the "grant myself a free course" hole.

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
-- No SELECT policy: this is customer conversation content. Nothing in the
-- app currently reads it from the browser (only the WhatsApp webhook and
-- the follow-up cron job, both service-role), so locking it down fully has
-- no regression today.

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Same as chat_history: not read from the browser anywhere today.

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;
-- Unused by the current codebase (no reads or writes anywhere) — locked
-- down entirely.

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read live_streams" ON public.live_streams;
CREATE POLICY "public read live_streams" ON public.live_streams FOR SELECT USING (true);
-- Writes only via /api/lives/create, which now uses supabaseAdmin and is
-- gated behind checkIsAdmin().


-- ------------------------------------------------------------------
-- 2. Public catalog tables: RLS on, but left permissive (read + write) to
--    match today's behavior. app/admin/courses and app/admin/library write
--    these directly from the browser — see the note at the top of this
--    file about moving those behind an admin-checked API route.
-- ------------------------------------------------------------------

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read courses" ON public.courses;
CREATE POLICY "public read courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write courses" ON public.courses;
CREATE POLICY "public write courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read modules" ON public.modules;
CREATE POLICY "public read modules" ON public.modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write modules" ON public.modules;
CREATE POLICY "public write modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read lessons" ON public.lessons;
CREATE POLICY "public read lessons" ON public.lessons FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write lessons" ON public.lessons;
CREATE POLICY "public write lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read library_resources" ON public.library_resources;
CREATE POLICY "public read library_resources" ON public.library_resources FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write library_resources" ON public.library_resources;
CREATE POLICY "public write library_resources" ON public.library_resources FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read ai_settings" ON public.ai_settings;
CREATE POLICY "public read ai_settings" ON public.ai_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write ai_settings" ON public.ai_settings;
CREATE POLICY "public write ai_settings" ON public.ai_settings FOR ALL USING (true) WITH CHECK (true);
-- Written directly from app/dashboard/tools/whatsapp/page.tsx with
-- clerk_user_id taken from the browser's own `user.id` — not verified
-- server-side, so any signed-in user could currently overwrite another
-- artist's bot settings. RLS alone can't fix this without a Clerk<->Supabase
-- JWT bridge; moving the write behind an API route is the real fix.


-- ------------------------------------------------------------------
-- 3. Community feature: intentionally open (any signed-in user can post,
--    comment, like — that's the feature). Left permissive, matching today.
-- ------------------------------------------------------------------

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read posts" ON public.posts;
CREATE POLICY "public read posts" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write posts" ON public.posts;
CREATE POLICY "public write posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read comments" ON public.comments;
CREATE POLICY "public read comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write comments" ON public.comments;
CREATE POLICY "public write comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read likes" ON public.likes;
CREATE POLICY "public read likes" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write likes" ON public.likes;
CREATE POLICY "public write likes" ON public.likes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read live_chat_messages" ON public.live_chat_messages;
CREATE POLICY "public read live_chat_messages" ON public.live_chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "public write live_chat_messages" ON public.live_chat_messages;
CREATE POLICY "public write live_chat_messages" ON public.live_chat_messages FOR ALL USING (true) WITH CHECK (true);


-- ------------------------------------------------------------------
-- 4. Storage: the "community" bucket currently allows literally anyone,
--    including logged-out visitors, to upload any file (see
--    supabase_schema.sql's own comment: "cuidado: em produção, restrinja
--    isso" — that warning was never acted on). Supabase Storage policies
--    can't check a Clerk session either, so the best we can do without a
--    JWT bridge is require the request to at least be an "authenticated"
--    Supabase role — but since this app never establishes a Supabase auth
--    session, that would break uploads entirely. Flagging this as unsolved:
--    the real fix is proxying community image uploads through an API route
--    that checks the Clerk session server-side, instead of uploading
--    straight to Supabase Storage from the browser.
-- ------------------------------------------------------------------
-- (No storage policy change in this migration — see note above.)
