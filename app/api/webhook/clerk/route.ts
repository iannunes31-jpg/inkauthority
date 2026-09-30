import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

// NOTE: there are two Clerk webhook routes in this app —
// /api/webhook/clerk (this one) and /api/webhooks/clerk (plural). Only
// whichever URL is actually registered in the Clerk dashboard receives
// events; the other is dead code. This route previously wrote to columns
// (`clerk_user_id`, `name`) that don't exist on the `users` table (see
// supabase_schema.sql: it's `id` and `first_name`/`last_name`), so if this
// was the one actually configured, every user sync was silently failing.
// Fixed to match the real schema — but consider deleting whichever of the
// two routes isn't registered in Clerk, to stop this from drifting again.

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const role = (public_metadata as { role?: string } | undefined)?.role || 'aluno';

    const { error } = await supabase.from('users').upsert(
      [
        {
          id,
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: image_url || '',
          role,
        },
      ],
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Erro ao salvar usuário no Supabase:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await supabase.from('users').delete().eq('id', id);
    }
  }

  return NextResponse.json({ success: true });
}
