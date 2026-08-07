import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente padrão (sem autenticação atrelada, usado para leituras públicas se necessário)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente autenticado (Usa o token JWT do Clerk)
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};
