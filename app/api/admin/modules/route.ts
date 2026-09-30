import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { course_id, title, order_index } = await req.json();
  if (!course_id || !title) {
    return NextResponse.json({ error: 'course_id and title are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('modules')
    .insert([{ course_id, title, order_index: order_index ?? 0 }]);

  if (error) {
    console.error('Erro ao criar módulo:', error);
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

  const { error } = await supabaseAdmin.from('modules').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir módulo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
