-- Aceite dos Termos de Uso. Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).
-- RLS ligado e sem políticas: só o servidor lê e escreve.

CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text,
  version text NOT NULL,
  ip text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, version)
);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.terms_acceptances FROM anon, authenticated;
