import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { registerWebhook } from '@/lib/evolution-webhook';

const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
const apiKey = process.env.EVOLUTION_API_KEY!;

export async function POST(req: Request) {
  try {
    // instanceName used to come straight from the client — anyone could
    // check the status of, or (re)connect, ANY other user's WhatsApp
    // instance just by knowing/guessing their Clerk user id. It always maps
    // 1:1 to the caller's own id, so derive it from the session instead.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();
    const instanceName = userId;

    // 1. STATUS
    if (action === 'status') {
      const response = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
        headers: { 'apikey': apiKey }
      });
      if (response.status === 404) {
         return NextResponse.json({ state: 'not_found' });
      }
      const data = await response.json();
      const state = data?.instance?.state || data?.state || 'unknown';
      console.log('[WPP status]', JSON.stringify(data).slice(0, 200));
      if (state === 'open') {
        await registerWebhook(instanceName);
      }
      return NextResponse.json({ state });
    }

    // 2. CONNECT / CREATE
    if (action === 'connect') {
      // Tenta buscar o QR Code se a instância já existir
      let connectResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
        headers: { 'apikey': apiKey }
      });

      let connectData = await connectResponse.json();
      console.log('[WhatsApp] connect response', connectResponse.status, JSON.stringify(connectData).slice(0, 300));

      // Se a instância não existir, cria uma nova
      if (connectResponse.status === 404 || connectData.error || connectData.statusCode === 404) {
        const createPayload = {
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        };

        const createResponse = await fetch(`${evolutionUrl}/instance/create`, {
          method: 'POST',
          headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });

        connectData = await createResponse.json();
        console.log('[WhatsApp] create response', createResponse.status, JSON.stringify(connectData).slice(0, 300));
      }

      await registerWebhook(instanceName);

      return NextResponse.json(connectData);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error on WhatsApp Instance API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
