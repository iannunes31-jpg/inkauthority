-- Cupons de desconto + configurações do assistente de vendas no WhatsApp.
-- Rodar uma vez no Supabase -> SQL Editor. Seguro rodar de novo (IF NOT EXISTS).
-- RLS ligado e sem políticas: só o servidor (service role) lê e escreve.

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  applies_to text[] NOT NULL DEFAULT '{}',          -- vazio = todos os produtos
  duration text NOT NULL DEFAULT 'once' CHECK (duration IN ('once', 'forever')),
  max_uses integer,                                  -- null = ilimitado
  uses integer NOT NULL DEFAULT 0,
  one_per_user boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id, product_id)
);

-- Conta o uso só uma vez, mesmo se o webhook de pagamento chegar repetido.
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_coupon_id uuid, p_user_id text, p_product_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.coupon_redemptions (coupon_id, user_id, product_id)
  VALUES (p_coupon_id, p_user_id, p_product_id)
  ON CONFLICT DO NOTHING;
  IF FOUND THEN
    UPDATE public.coupons SET uses = uses + 1 WHERE id = p_coupon_id;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Dante: moeda, preço por parte do corpo e personalização do tatuador.
ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS body_prices jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS artist_profile text,
  ADD COLUMN IF NOT EXISTS artist_examples text;

-- Dante: atendimento por país (país do tatuador + regras por DDI do cliente).
ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS country_settings jsonb NOT NULL DEFAULT '{"home":"BR","rules":[]}'::jsonb;

-- Dante: ficha do tatuador (nome, cidade, idiomas, experiência, especialidades, posicionamento...).
ALTER TABLE public.ai_settings
  ADD COLUMN IF NOT EXISTS artist_info jsonb NOT NULL DEFAULT '{}'::jsonb;
