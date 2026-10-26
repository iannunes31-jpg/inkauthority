import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Lessons may have no video yet (e.g. a bonus with only a PDF): stored as "" because video_url is NOT NULL.
// "description" needs supabase-lessons-description.sql; without that column we save the rest and warn.
const DESCRIPTION_MISSING = /description/i;
async function writeLesson(run: (row: Record<string, unknown>) => PromiseLike<{ error: any }>, row: Record<string, unknown>) {
  let { error } = await run(row);
  if (error && 'description' in row && DESCRIPTION_MISSING.test(error.message)) {
    const { description, ...rest } = row;
    ({ error } = await run(rest));
    if (!error) return { warning: 'A descrição não foi salva: rode o arquivo supabase-lessons-description.sql no Supabase.' };
  }
  return { error };
}

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { module_id, title, video_url, description, order_index, support_materials, equipment_links } = await req.json();
  if (!module_id || !title) {
    return NextResponse.json({ error: 'module_id and title are required' }, { status: 400 });
  }

  const { error, warning } = await writeLesson((row) => supabaseAdmin.from('lessons').insert([row]), {
    module_id, title,
    video_url: String(video_url ?? '').trim(),
    ...(description != null ? { description: String(description).trim().slice(0, 10000) || null } : {}),
    order_index: order_index ?? 0,
    support_materials: support_materials ?? [],
    equipment_links: equipment_links ?? [],
  });

  if (error) {
    console.error('Erro ao criar aula:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, warning });
}

const cleanLinks = (list: any[]) =>
  list
    .filter((m: any) => m && typeof m.name === 'string' && typeof m.url === 'string' && /^https?:\/\//.test(m.url))
    .map((m: any) => ({ name: m.name.trim().slice(0, 120) || 'Material', url: m.url.trim() }))
    .slice(0, 30);

// Edits an existing lesson; only the fields sent are changed.
export async function PATCH(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if ('title' in body) {
    const title = String(body.title ?? '').trim();
    if (!title) return NextResponse.json({ error: 'A aula precisa de um título.' }, { status: 400 });
    patch.title = title.slice(0, 200);
  }
  if ('video_url' in body) patch.video_url = String(body.video_url ?? '').trim();
  if ('description' in body) patch.description = String(body.description ?? '').trim().slice(0, 10000) || null;
  if (Array.isArray(body.support_materials)) patch.support_materials = cleanLinks(body.support_materials);
  if (Array.isArray(body.equipment_links)) patch.equipment_links = cleanLinks(body.equipment_links);
  if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });

  const { error, warning } = await writeLesson((row) => supabaseAdmin.from('lessons').update(row).eq('id', body.id), patch);
  if (error) {
    console.error('Erro ao atualizar aula:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, warning });
}

export async function DELETE(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabaseAdmin.from('lessons').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir aula:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
