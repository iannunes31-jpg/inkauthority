import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Saves the order chosen by drag and drop: module order, lesson order, and which module each lesson is in.
// Body: { courseId, modules: [{ id, lessons: [lessonId, ...] }, ...] } in the final order.
export async function POST(req: Request) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { courseId, modules } = await req.json();
  if (!courseId || !Array.isArray(modules)) {
    return NextResponse.json({ error: 'courseId and modules are required' }, { status: 400 });
  }

  // Only touch modules and lessons that really belong to this course.
  const { data: owned, error: readError } = await supabaseAdmin
    .from('modules')
    .select('id, lessons(id)')
    .eq('course_id', courseId);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const moduleIds = new Set((owned ?? []).map((m: any) => m.id));
  const lessonIds = new Set((owned ?? []).flatMap((m: any) => (m.lessons ?? []).map((l: any) => l.id)));
  const sent = modules as { id: string; lessons: string[] }[];
  if (sent.some((m) => !moduleIds.has(m.id) || !Array.isArray(m.lessons) || m.lessons.some((l) => !lessonIds.has(l)))) {
    return NextResponse.json({ error: 'A ordem enviada não corresponde a este curso. Recarregue a página.' }, { status: 400 });
  }

  const updates = [
    ...sent.map((m, i) => supabaseAdmin.from('modules').update({ order_index: i }).eq('id', m.id)),
    ...sent.flatMap((m) =>
      m.lessons.map((lessonId, i) => supabaseAdmin.from('lessons').update({ module_id: m.id, order_index: i }).eq('id', lessonId))
    ),
  ];
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error('Erro ao reordenar curso:', failed.error);
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
