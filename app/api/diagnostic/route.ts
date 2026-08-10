import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function GET() {
  const diagnostics: any = {
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 4) : null,
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

    // Test Gemini
    if (process.env.GEMINI_API_KEY) {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: 'Say the word OK',
      });
      diagnostics.tests.gemini = 'success';
      diagnostics.geminiResponse = text;
    } else {
      diagnostics.tests.gemini = 'skipped_missing_key';
    }

  } catch (err: any) {
    diagnostics.globalError = err.message || err.toString();
    diagnostics.tests.gemini = diagnostics.tests.gemini === 'pending' ? 'failed' : diagnostics.tests.gemini;
  }

  return NextResponse.json(diagnostics);
}
