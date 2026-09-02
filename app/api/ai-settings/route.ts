import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Reads/writes the signed-in artist's own ai_settings row.
 *
 * Previously the WhatsApp tool page wrote straight to Supabase from the
 * browser with the anon key, sending `clerk_user_id: user.id` itself — an
 * attacker who found the anon key (public in every page's JS bundle) could
 * upsert any clerk_user_id and read or overwrite another artist's bot
 * config (pricing, address, WhatsApp bot personality). Here the row is
 * always scoped to the real, server-verified session user.
 */

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('ai_settings')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar ai_settings:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  // clerk_user_id is never taken from the client — always the real session user.
  const { clerk_user_id: _ignored, ...settings } = body || {};

  const payload = {
    ...settings,
    clerk_user_id: userId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('ai_settings')
    .upsert(payload, { onConflict: 'clerk_user_id' });

  if (error) {
    console.error('Erro ao salvar ai_settings:', error);
    return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
