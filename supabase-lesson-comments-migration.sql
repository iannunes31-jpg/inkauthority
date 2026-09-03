-- Lesson comments / Q&A feature.
--
-- HOW TO APPLY: open the Supabase dashboard for this project -> SQL Editor
-- -> paste this whole file -> Run. This can't be applied automatically
-- from the codebase (no DB credentials are available to this session), so
-- it has to be run manually, once, by someone with access to the project.
--
-- Mirrors the existing `posts` table's shape/conventions (clerk_user_id,
-- user_name, user_avatar, content) so the code stays consistent with the
-- Community feature. Note: there's already a generic `comments` table in
-- the schema, but it belongs to community posts (post_id), not lessons --
-- this is a separate table, not a reuse of that one.
--
-- RLS here is intentionally permissive (like Community's posts/comments
-- tables in supabase-security-migration.sql): there is no Clerk<->Supabase
-- JWT bridge in this app, so `auth.jwt()`-based ownership checks would
-- silently reject every request. Any signed-in user can post/edit/delete
-- freely for now -- matching today's actual security posture, not
-- pretending to be stricter than it is.

create table if not exists lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  clerk_user_id text not null,
  user_name text not null,
  user_avatar text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_comments_lesson_id_idx on lesson_comments(lesson_id);

alter table lesson_comments enable row level security;

drop policy if exists "public read lesson_comments" on lesson_comments;
create policy "public read lesson_comments"
  on lesson_comments for select
  using (true);

drop policy if exists "public write lesson_comments" on lesson_comments;
create policy "public write lesson_comments"
  on lesson_comments for all
  using (true)
  with check (true);
