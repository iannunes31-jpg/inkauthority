import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { BODY_PART_LABELS, CURRENCIES } from '@/lib/body-parts';
import { COUNTRIES, OTHER_COUNTRIES } from '@/lib/countries';
import { ARTIST_INFO_FIELDS, POSITIONING_OPTIONS, TRAITS } from '@/lib/artist-info';

/**
 * Reads/writes the signed-in artist's own ai_settings row. The row is always
 * scoped to the server-verified session user, never a client-sent id.
 */

const TEXT_FIELDS = [
  'studio_name', 'styles', 'style_image_url', 'address', 'instagram_url',
  'google_review_url', 'payment_methods', 'bot_personality', 'bot_mode',
  'artist_profile', 'artist_examples',
] as const;
// Columns added by supabase-coupons-sales-assistant.sql; saving retries without them if missing.
const NEW_COLUMNS = ['currency', 'body_prices', 'artist_profile', 'artist_examples', 'country_settings', 'artist_info'];
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
  if ('currency' in body) {
    out.currency = CURRENCIES.some((c) => c.code === body.currency) ? body.currency : 'BRL';
  }
  if ('body_prices' in body && body.body_prices && typeof body.body_prices === 'object') {
    const prices: Record<string, number> = {};
    for (const [k, v] of Object.entries(body.body_prices)) {
      const n = v === '' || v == null ? NaN : Number(v);
      if (k in BODY_PART_LABELS && Number.isFinite(n) && n > 0) prices[k] = n;
    }
    out.body_prices = prices;
  }
  if ('country_settings' in body && body.country_settings && typeof body.country_settings === 'object') {
    const valid = (c: unknown) => COUNTRIES.some((x) => x.code === c);
    const cs = body.country_settings;
    const seen = new Set<string>();
    const rules = (Array.isArray(cs.rules) ? cs.rules : [])
      .filter((r: any) => (valid(r?.country) || r?.country === OTHER_COUNTRIES) && !seen.has(r.country) && seen.add(r.country))
      .slice(0, 40)
      .map((r: any) => {
        const factor = Number(r.factor);
        return {
          country: r.country,
          currency: CURRENCIES.some((c) => c.code === r.currency) ? r.currency : 'BRL',
          factor: Number.isFinite(factor) && factor > 0 ? factor : 1,
          instructions: String(r.instructions ?? '').slice(0, 2000),
        };
      });
    out.country_settings = { home: valid(cs.home) ? cs.home : 'BR', rules };
  }
  if ('artist_info' in body && body.artist_info && typeof body.artist_info === 'object') {
    const info: Record<string, string> = {};
    for (const { key } of ARTIST_INFO_FIELDS) {
      const v = String(body.artist_info[key] ?? '').trim().slice(0, 500);
      if (v) info[key] = v;
    }
    if (POSITIONING_OPTIONS.some((p) => p.key === body.artist_info.positioning)) info.positioning = body.artist_info.positioning;
    const greeting = String(body.artist_info.greeting ?? '').trim().slice(0, 600);
    if (greeting) info.greeting = greeting;
    for (const t of TRAITS) {
      const v = body.artist_info[t.key];
      if (t.options.some((o) => o.value === v)) info[t.key] = v;
    }
    out.artist_info = info;
  }
  for (const k of ['artist_profile', 'artist_examples']) {
    if (typeof out[k] === 'string') out[k] = out[k].slice(0, 6000);
  }
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

  const write = (f: Record<string, any>) =>
    existing && existing.length > 0
      ? supabaseAdmin.from('ai_settings').update({ ...f, updated_at }).eq('clerk_user_id', userId)
      : supabaseAdmin.from('ai_settings').insert({ studio_name: '', ...f, clerk_user_id: userId, updated_at });

  let { error } = await write(fields);
  let warning: string | undefined;
  if (error && (error.code === 'PGRST204' || /column/i.test(error.message)) && NEW_COLUMNS.some((c) => c in fields)) {
    const legacy = Object.fromEntries(Object.entries(fields).filter(([k]) => !NEW_COLUMNS.includes(k)));
    ({ error } = await write(legacy));
    warning = 'Moeda, preços por parte do corpo e personalização ainda não foram salvos: falta rodar o SQL novo no Supabase.';
  }

  if (error) {
    console.error('[ai-settings] save error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, ...(warning ? { warning } : {}) });
}
