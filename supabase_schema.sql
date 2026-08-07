-- Tabela de Usuários Locais (Para espelhar dados do Clerk se necessário, ou usar os metadados do Clerk)
-- No nosso caso, como a autenticação é via Clerk, nós usaremos o clerk_user_id (String) para referenciar os autores.

-- ==========================================
-- FASE 2: COMUNIDADE (REDE SOCIAL)
-- ==========================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    user_role TEXT DEFAULT 'Aluno PRO',
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    clerk_user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    clerk_user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, clerk_user_id) -- Impede que o mesmo usuário curta duas vezes
);

-- Trigger para atualizar contadores de likes
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Trigger para atualizar contadores de comments
CREATE OR REPLACE FUNCTION update_comments_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- ==========================================
-- FASE 3: ASSISTENTE IA (CRM & AGENDA)
-- ==========================================

CREATE TABLE IF NOT EXISTS ai_settings (
    clerk_user_id TEXT PRIMARY KEY,
    studio_name TEXT NOT NULL,
    base_price NUMERIC,
    hourly_rate NUMERIC,
    styles TEXT, -- Ex: Realismo, Fineline, Old School
    address TEXT,
    instagram_url TEXT,
    google_review_url TEXT,
    payment_methods TEXT,
    bot_personality TEXT DEFAULT 'Profissional e educado',
    is_active BOOLEAN DEFAULT false,
    bot_mode TEXT DEFAULT 'copilot', -- 'automatic' ou 'copilot'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tatuador_id TEXT NOT NULL, -- clerk_user_id do tatuador
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'Lead', -- Lead, Em Orçamento, Agendado, Concluído
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tatuador_id TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Confirmado', -- Confirmado, Cancelado, Concluído
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
