import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/ai-settings?clerk_user_id=user_xxx
export async function GET(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clerk_user_id = searchParams.get('clerk_user_id');

  if (!clerk_user_id) {
    // List all active settings
    const { data, error } = await supabaseAdmin
      .from('ai_settings')
      .select('clerk_user_id, studio_name, is_active, bot_mode, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin
    .from('ai_settings')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/admin/ai-settings — update a field for a user
export async function PATCH(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { clerk_user_id, ...updates } = body;

  if (!clerk_user_id) {
    return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('ai_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('clerk_user_id', clerk_user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
