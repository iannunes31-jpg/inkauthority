-- ==============================================================================
-- SUPABASE COMPLETE SCHEMA FOR INK AUTHORITY PLATFORM
-- Execute este script no SQL Editor do painel da Supabase (https://app.supabase.com)
-- ==============================================================================

-- 1. TABELA DA BIBLIOTECA (library_resources)
CREATE TABLE IF NOT EXISTS public.library_resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Marketing',
    resource_type TEXT DEFAULT 'PDF',
    file_size TEXT DEFAULT '4.8 MB',
    file_url TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    badge TEXT DEFAULT 'DOCUMENTO EXCLUSIVO PRO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS e criar política de leitura pública
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir Leitura Publica na Biblioteca" ON public.library_resources;
CREATE POLICY "Permitir Leitura Publica na Biblioteca" 
ON public.library_resources FOR SELECT 
USING (true);

-- Inserir o PDF principal (Guia Instagram + ChatGPT)
INSERT INTO public.library_resources (id, title, description, category, resource_type, file_size, file_url, price, badge)
VALUES (
    'guia-instagram-chatgpt-pdf',
    'Guia Prático: Instagram + ChatGPT para Tatuadores',
    'Como utilizar Inteligência Artificial para gerar conteúdos de alto impacto, criar legendas persuasivas e atrair clientes diariamente no Instagram.',
    'Marketing',
    'PDF',
    '4.8 MB',
    '/library/guia-instagram-chatgpt.pdf',
    0.00,
    'DOCUMENTO EXCLUSIVO PRO'
)
ON CONFLICT (id) DO UPDATE SET
    file_url = EXCLUDED.file_url,
    title = EXCLUDED.title,
    description = EXCLUDED.description;


-- 2. TABELA DE COMPRAS DE USUÁRIOS (user_purchases)
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'course', -- 'course', 'library', 'all'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir Leitura de Compras do Usuario" ON public.user_purchases;
CREATE POLICY "Permitir Leitura de Compras do Usuario" 
ON public.user_purchases FOR SELECT 
USING (true);


-- 3. TABELA DE CURSOS (courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'Técnica',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir Leitura de Cursos" ON public.courses;
CREATE POLICY "Permitir Leitura de Cursos" 
ON public.courses FOR SELECT 
USING (true);


-- 4. TABELA DE AULAS (lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    duration TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir Leitura de Aulas" ON public.lessons;
CREATE POLICY "Permitir Leitura de Aulas" 
ON public.lessons FOR SELECT 
USING (true);
