import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Reads/writes the signed-in artist's own ai_settings row. The row is always
 * scoped to the server-verified session user, never a client-sent id.
 */

const TEXT_FIELDS = [
  'studio_name', 'styles', 'style_image_url', 'address', 'instagram_url',
  'google_review_url', 'payment_methods', 'bot_personality', 'bot_mode',
] as const;
const NUMERIC_FIELDS = [
  'base_price', 'hourly_rate', 'price_session', 'price_arm', 'price_leg', 'price_front', 'price_back',
] as const;

function sanitize(body: any) {
  const out: Record<string, any> = {};
  for (const k of TEXT_FIELDS) {
    if (k in body) out[k] = body[k] == null ? '' : String(body[k]);
  }
  for (const k of NUMERIC_FIELDS) {
    if (k in body) {
      const n = body[k] === '' || body[k] == null ? NaN : Number(body[k]);
      out[k] = Number.isFinite(n) ? n : null;
    }
  }
  if ('is_active' in body) out.is_active = !!body.is_active;
  return out;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('ai_settings')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[ai-settings] GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
  console.log('[ai-settings] GET', userId, data
    ? `studio="${data.studio_name}" styles=${!!data.styles} address=${!!data.address} imgs=${(data.style_image_url || '').split(',').filter(Boolean).length}`
    : 'NO ROW');

  return NextResponse.json(data);
}

// Partial update: only the fields sent are written, so saving the images
// alone never wipes the rest of the config.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const fields = sanitize((await req.json()) || {});
  const updated_at = new Date().toISOString();

  const { data: existing, error: findError } = await supabaseAdmin
    .from('ai_settings')
    .select('clerk_user_id')
    .eq('clerk_user_id', userId)
    .limit(1);

  if (findError) {
    console.error('[ai-settings] find error:', findError);
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  console.log('[ai-settings] POST', userId, existing && existing.length > 0 ? 'update' : 'insert',
    Object.keys(fields).join(','), `studio="${fields.studio_name ?? '(unchanged)'}"`);

  const { error } = existing && existing.length > 0
    ? await supabaseAdmin.from('ai_settings').update({ ...fields, updated_at }).eq('clerk_user_id', userId)
    : await supabaseAdmin.from('ai_settings').insert({ studio_name: '', ...fields, clerk_user_id: userId, updated_at });

  if (error) {
    console.error('[ai-settings] save error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
