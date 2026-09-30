import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const results: Record<string, any> = { userId };

  // 1. Check ai_settings
  try {
    const { data: settings, error } = await supabase
      .from('ai_settings')
      .select('studio_name, is_active, bot_mode, bot_personality')
      .eq('clerk_user_id', userId)
      .single();
    results.settings = settings
      ? { found: true, is_active: settings.is_active, bot_mode: settings.bot_mode, studio_name: settings.studio_name }
      : { found: false, error: error?.message };
  } catch (e: any) {
    results.settings = { found: false, error: e.message };
  }

  // 2. Check Evolution API connection state
  const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
  const apiKey = process.env.EVOLUTION_API_KEY;
  results.evolution_api_key = apiKey ? 'configured' : 'MISSING';

  if (apiKey) {
    try {
      const res = await fetch(`${evolutionUrl}/instance/connectionState/${userId}`, {
        headers: { apikey: apiKey },
      });
      const data = await res.json();
      results.whatsapp_state = {
        http_status: res.status,
        raw: JSON.stringify(data).slice(0, 300),
        state: data?.instance?.state || data?.state || 'not_found',
      };
    } catch (e: any) {
      results.whatsapp_state = { error: e.message };
    }
  }

  // 3. Check webhook registration
  if (apiKey) {
    try {
      const res = await fetch(`${evolutionUrl}/webhook/find/${userId}`, {
        headers: { apikey: apiKey },
      });
      const data = await res.json();
      results.webhook_registered = {
        http_status: res.status,
        url: data?.url || data?.webhook?.url || 'not_found',
        events: data?.events || data?.webhook?.events,
      };
    } catch (e: any) {
      results.webhook_registered = { error: e.message };
    }
  }

  // 4. Check Vertex AI / Gemini
  results.vertex_credentials = process.env.GOOGLE_VERTEX_CREDENTIALS ? 'configured' : 'MISSING';
  if (process.env.GOOGLE_VERTEX_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
      results.vertex_project = credentials.project_id || 'no project_id';
      const vertex = createVertex({
        project: credentials.project_id,
        location: 'global',
        googleAuthOptions: { credentials },
      });
      const { text } = await generateText({
        model: vertex('gemini-2.0-flash-lite'),
        messages: [{ role: 'user', content: 'Responda só "ok"' }],
      });
      results.ai_test = { ok: true, response: text.slice(0, 100) };
    } catch (e: any) {
      results.ai_test = { ok: false, error: e.message.slice(0, 300) };
    }
  }

  // 5. Check webhook URL env
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  results.webhook_url = appUrl
    ? `${appUrl}/api/whatsapp/webhook${secret ? '?secret=***' : ' (no secret)'}`
    : `https://inkauthority.com.br/api/whatsapp/webhook${secret ? '?secret=***' : ' (no secret)'}`;

  return NextResponse.json(results, { status: 200 });
}
