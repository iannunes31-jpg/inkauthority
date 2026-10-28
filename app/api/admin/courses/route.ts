import { NextResponse } from 'next/server';
import { checkIsAdmin, checkIsFullAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Course reads stay public (anon key, client-side) — courses are meant to
// be browsable. Only create/delete move here, admin-gated. Previously these
// wrote straight to Supabase from the browser with the anon key, so anyone
// who had that key could create or delete courses directly via the REST API.

// One course, read on the server so the admin always sees the saved state.
export async function GET(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabaseAdmin.from('courses').select('*').eq('id', id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Curso não encontrado.' }, { status: 404 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, description, thumbnail_url } = await req.json();
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ title, description, thumbnail_url, is_published: false }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar curso:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Updates only the fields sent: cover, title or published status.
export async function PATCH(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if ('thumbnail_url' in body) patch.thumbnail_url = body.thumbnail_url || null;
  if ('is_published' in body) patch.is_published = !!body.is_published;
  if ('description' in body) patch.description = String(body.description ?? '').trim().slice(0, 5000) || null;
  if ('title' in body) {
    const title = String(body.title ?? '').replace(/\s+/g, ' ').trim();
    if (!title) return NextResponse.json({ error: 'O nome do curso não pode ficar vazio.' }, { status: 400 });
    patch.title = title.slice(0, 120);
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('courses')
    .update(patch)
    .eq('id', body.id)
    .select()
    .single();
  if (error) {
    console.error('Erro ao atualizar curso:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!(await checkIsFullAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabaseAdmin.from('courses').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir curso:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
