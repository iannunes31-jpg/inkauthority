-- Prova final dos cursos. Rodar uma vez no Supabase -> SQL Editor (pode rodar de novo).
-- RLS ligado e sem políticas: só o servidor lê e escreve (o gabarito nunca vai pro navegador).

CREATE TABLE IF NOT EXISTS public.course_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Prova final',
  description text,
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 1 AND 100),
  max_attempts integer CHECK (max_attempts IS NULL OR max_attempts > 0),  -- null = ilimitado
  active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.course_exams(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  options jsonb NOT NULL,            -- lista de alternativas (texto)
  correct_index integer NOT NULL,    -- posição da alternativa correta (0 = primeira)
  explanation text                   -- mostrada ao aluno depois de aprovado
);

CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.course_exams(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exam_questions_exam_idx ON public.exam_questions (exam_id, position);
CREATE INDEX IF NOT EXISTS exam_attempts_user_idx ON public.exam_attempts (exam_id, user_id);

ALTER TABLE public.course_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
