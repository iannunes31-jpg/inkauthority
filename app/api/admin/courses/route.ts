import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Course reads stay public (anon key, client-side) — courses are meant to
// be browsable. Only create/delete move here, admin-gated. Previously these
// wrote straight to Supabase from the browser with the anon key, so anyone
// who had that key could create or delete courses directly via the REST API.

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

export async function DELETE(req: Request) {
  if (!(await checkIsAdmin())) {
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
