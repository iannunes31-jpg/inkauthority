import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// The file itself is still uploaded straight to Supabase Storage from the
// browser (large binary, not worth proxying through this server) — only the
// library_resources database row is written here, admin-gated.

export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, category, resource_type, file_url, file_size } = await req.json();
  if (!title || !file_url) {
    return NextResponse.json({ error: 'title and file_url are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('library_resources')
    .insert([{ title, category, resource_type, file_url, file_size }]);

  if (error) {
    console.error('Erro ao salvar material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const fileUrl = searchParams.get('fileUrl');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabaseAdmin.from('library_resources').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (fileUrl) {
    const pathSegments = fileUrl.split('/library_files/');
    if (pathSegments.length > 1) {
      await supabaseAdmin.storage.from('library_files').remove([pathSegments[1]]);
    }
  }

  return NextResponse.json({ success: true });
}
