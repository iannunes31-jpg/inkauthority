import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { automationSettings } from '@/lib/artist-info';
import { sendText } from '@/lib/dante';

export const maxDuration = 120;

const OPEN_STAGES = ['novo', 'qualificando', 'projeto', 'orcamento', 'agendamento'];
const MAX_AGE_DAYS = 14;

// Daily: nudges leads who stopped replying, following each artist's follow-up settings.
export async function GET(req: Request) {
  // Vercel cron sends "Authorization: Bearer <CRON_SECRET>"; without it anyone could trigger
  // messages to every artist's clients.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: artists, error: artistsErr } = await supabase
    .from('ai_settings')
    .select('clerk_user_id, studio_name, is_active, bot_mode, artist_info')
    .eq('is_active', true);
  if (artistsErr) return NextResponse.json({ error: artistsErr.message }, { status: 500 });

  const credentials = process.env.GOOGLE_VERTEX_CREDENTIALS ? JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS) : null;
  const vertex = credentials
    ? createVertex({ project: credentials.project_id, location: 'global', googleAuthOptions: { credentials } })
    : null;

  const now = Date.now();
  let sent = 0;

  for (const artist of artists ?? []) {
    const auto = automationSettings(artist.artist_info);
    if (auto.followup_enabled !== 'sim' || artist.bot_mode === 'copilot') continue;
    const waitMs = Number(auto.followup_hours) * 3600_000;
    const maxFollowups = Number(auto.followup_max);

    const { data: leads } = await supabase
      .from('customers')
      .select('*')
      .eq('clerk_user_id', artist.clerk_user_id)
      .in('stage', OPEN_STAGES)
      .lt('followups_sent', maxFollowups);

    for (const lead of leads ?? []) {
      const { data: history } = await supabase
        .from('chat_history')
        .select('role, content, created_at')
        .eq('clerk_user_id', artist.clerk_user_id)
        .eq('phone_number', lead.phone_number)
        .in('role', ['user', 'assistant'])
        .order('created_at', { ascending: false })
        .limit(8);
      const last = history?.[0];
      if (!last || last.role !== 'assistant') continue; // only when the client is the one who went quiet

      const idle = now - new Date(last.created_at).getTime();
      if (idle < waitMs || idle > MAX_AGE_DAYS * 86400_000) continue;
      if (lead.last_followup_at && now - new Date(lead.last_followup_at).getTime() < waitMs) continue;

      const context = (history ?? []).slice().reverse().map((m) => `${m.role === 'user' ? 'CLIENTE' : 'ESTUDIO'}: ${m.content}`).join('\n');
      let message = 'Oi! Passando para saber se ficou alguma dúvida sobre o seu projeto. Estou à disposição para te ajudar 😊';
      if (vertex) {
        try {
          const { text } = await generateText({
            model: vertex('gemini-3.1-flash-lite'),
            system: `Voce escreve UMA mensagem curta de follow-up de WhatsApp para um cliente de um estudio de tatuagem ("${artist.studio_name || 'estudio'}") que parou de responder.
Regras: no idioma do cliente, natural e gentil, sem pressao, no maximo 2 frases, retome exatamente o ponto onde a conversa parou (ideia, local, valor ou data), nunca informe precos novos, sem tags nem colchetes.
${lead.followups_sent > 0 ? 'Este e um segundo lembrete: seja ainda mais leve e deixe a porta aberta.' : ''}`,
            prompt: `Conversa ate agora:\n${context}\n\nEscreva so a mensagem de follow-up.`,
          });
          if (text?.trim()) message = text.trim();
        } catch (e) {
          console.error('[follow-up] AI error', e);
        }
      }

      // "@lid" contacts have no phone number; Evolution accepts the full JID instead.
      const to = lead.phone_number.endsWith('@lid') ? lead.phone_number : lead.phone_number.split('@')[0];
      const ok = await sendText(artist.clerk_user_id, to, message);
      if (!ok) continue;
      sent++;
      await supabase.from('chat_history').insert({
        clerk_user_id: artist.clerk_user_id,
        phone_number: lead.phone_number,
        role: 'assistant',
        content: message,
      });
      await supabase
        .from('customers')
        .update({ followups_sent: (lead.followups_sent ?? 0) + 1, last_followup_at: new Date().toISOString() })
        .eq('id', lead.id);
    }
  }

  console.log('[follow-up] sent', sent);
  return NextResponse.json({ status: 'ok', sent });
}
