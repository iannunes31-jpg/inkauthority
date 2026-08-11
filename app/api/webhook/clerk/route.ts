import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

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

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    await supabase.from('users').upsert([
      {
        clerk_user_id: id,
        email,
        name,
        avatar_url: image_url || '',
        created_at: new Date().toISOString(),
      }
    ], { onConflict: 'clerk_user_id' });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    await supabase.from('users').update({
      email,
      name,
      avatar_url: image_url || '',
    }).eq('clerk_user_id', id);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await supabase.from('users').delete().eq('clerk_user_id', id);
    }
  }

  return NextResponse.json({ success: true });
}
