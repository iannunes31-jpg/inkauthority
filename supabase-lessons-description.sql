-- Descrição das aulas (texto que aparece embaixo do título da aula).
-- Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description text;
