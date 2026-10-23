import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { module_id, title, video_url, order_index, support_materials, equipment_links } = await req.json();
  if (!module_id || !title || !video_url) {
    return NextResponse.json({ error: 'module_id, title and video_url are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('lessons')
    .insert([{
      module_id, title, video_url,
      order_index: order_index ?? 0,
      support_materials: support_materials ?? [],
      equipment_links: equipment_links ?? [],
    }]);

  if (error) {
    console.error('Erro ao criar aula:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
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
  if ('video_url' in body) {
    const video = String(body.video_url ?? '').trim();
    if (!video) return NextResponse.json({ error: 'A aula precisa de um vídeo.' }, { status: 400 });
    patch.video_url = video;
  }
  if (Array.isArray(body.support_materials)) patch.support_materials = cleanLinks(body.support_materials);
  if (Array.isArray(body.equipment_links)) patch.equipment_links = cleanLinks(body.equipment_links);
  if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('lessons').update(patch).eq('id', body.id);
  if (error) {
    console.error('Erro ao atualizar materiais:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
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
