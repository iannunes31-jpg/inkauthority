-- Migration: Add Asaas columns to user_purchases
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hgmthjrhqpvgrzuvxork/sql/new

-- Add asaas_customer_id so we can look up the customer without re-creating it on every purchase
ALTER TABLE user_purchases
  ADD COLUMN IF NOT EXISTS asaas_customer_id text,
  ADD COLUMN IF NOT EXISTS asaas_payment_id text;

-- Optional index for faster lookup when checking if customer already exists in Asaas
CREATE INDEX IF NOT EXISTS idx_user_purchases_asaas_customer
  ON user_purchases (user_id)
  WHERE asaas_customer_id IS NOT NULL;
