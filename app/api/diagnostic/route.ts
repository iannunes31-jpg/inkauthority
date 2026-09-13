import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { checkIsAdmin } from '@/lib/auth-server';

export async function GET() {
  // Debug-only route: reveals which env vars are configured and burns a
  // real Gemini API call on every hit. Had no auth check — anyone could
  // hit it repeatedly to rack up AI usage or probe infra config.
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const diagnostics: any = {
    env: {
      hasVertexCredentials: !!process.env.GOOGLE_VERTEX_CREDENTIALS,
      hasEvolutionUrl: !!process.env.EVOLUTION_API_URL,
      hasEvolutionKey: !!process.env.EVOLUTION_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    tests: {
      supabase: 'pending',
      gemini: 'pending'
    }
  };

  try {
    // Test Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('ai_settings').select('clerk_user_id').limit(1);
      if (error) {
        diagnostics.tests.supabase = 'failed';
        diagnostics.supabaseError = error;
      } else {
        diagnostics.tests.supabase = 'success';
      }
    } else {
      diagnostics.tests.supabase = 'skipped_missing_keys';
    }

    // Test Gemini (Vertex AI)
    if (process.env.GOOGLE_VERTEX_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
        const vertex = createVertex({
          project: credentials.project_id,
          location: 'us-central1',
          googleAuthOptions: { credentials }
        });
        const { text } = await generateText({
          model: vertex('gemini-2.5-flash'),
          prompt: 'Say the word OK',
        });
        diagnostics.tests.gemini = 'success';
        diagnostics.geminiResponse = text;
      } catch (e: any) {
        diagnostics.tests.gemini = 'failed';
        diagnostics.geminiError = e.message;
      }
    } else {
      diagnostics.tests.gemini = 'skipped_missing_vertex_json';
    }

  } catch (err: any) {
    diagnostics.globalError = err.message || err.toString();
    diagnostics.tests.gemini = diagnostics.tests.gemini === 'pending' ? 'failed' : diagnostics.tests.gemini;
  }

  return NextResponse.json(diagnostics);
}
