-- Painel do Dante: etapa de cada conversa, contadores e controle de follow-up.
-- Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_client_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS message_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followups_sent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS previews_sent integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS customers_owner_stage_idx ON public.customers (clerk_user_id, stage);
CREATE INDEX IF NOT EXISTS chat_history_owner_phone_idx ON public.chat_history (clerk_user_id, phone_number, created_at DESC);
