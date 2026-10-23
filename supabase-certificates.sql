-- Certificados emitidos automaticamente para quem é aprovado na prova final.
-- Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).
-- RLS ligado e sem políticas: só o servidor lê e escreve.

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id text NOT NULL,
  course_id text NOT NULL,
  student_name text NOT NULL,
  course_title text NOT NULL,
  hours integer NOT NULL DEFAULT 10,
  score integer,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.certificates FROM anon, authenticated;
