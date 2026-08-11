import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Obter cabeçalhos
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : '';
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Usuário';

    try {
      // Inserir ou atualizar na tabela de usuários do Supabase
      // Assumindo que a tabela se chama 'users'
      await supabase.from('users').upsert({
        id: id,
        email: email,
        full_name: fullName,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      console.log(\? Clerk Webhook: User \ synced successfully.\);
    } catch (dbError) {
      console.error('Clerk Webhook Database Error:', dbError);
    }
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (id) {
      await supabase.from('users').delete().eq('id', id);
      console.log(\? Clerk Webhook: User \ deleted.\);
    }
  }

  return new Response('', { status: 200 });
}
