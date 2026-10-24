-- Agente de segurança: registro de eventos suspeitos e IPs bloqueados.
-- Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).
-- RLS ligado e sem políticas: só o servidor lê e escreve.

CREATE TABLE IF NOT EXISTS public.security_events (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  kind text NOT NULL,          -- probe, injection, admin_denied, forged_webhook, forged_cron, rate_limited, role_change, blocked_hit
  severity text NOT NULL,      -- low, medium, high, critical
  method text,
  path text,
  user_agent text,
  user_id text,
  country text,
  details jsonb
);
CREATE INDEX IF NOT EXISTS security_events_ip_time_idx ON public.security_events (ip, created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_time_idx ON public.security_events (created_at DESC);

CREATE TABLE IF NOT EXISTS public.blocked_ips (
  ip text PRIMARY KEY,
  reason text NOT NULL,
  blocked_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  hits integer NOT NULL DEFAULT 0
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_events FROM anon, authenticated;
REVOKE ALL ON public.blocked_ips FROM anon, authenticated;
