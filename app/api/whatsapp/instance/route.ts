import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
const apiKey = process.env.EVOLUTION_API_KEY!;
// TODO: Trocar para a URL real da Vercel quando for para produção 100%
const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook` : 'https://inkauthority.com.br/api/whatsapp/webhook';
// Shared secret so /api/whatsapp/webhook can verify a request really came
// from our own Evolution instance (Evolution doesn't sign its payloads).
const webhookUrl = process.env.WHATSAPP_WEBHOOK_SECRET
  ? `${webhookBaseUrl}?secret=${process.env.WHATSAPP_WEBHOOK_SECRET}`
  : webhookBaseUrl;

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
      return NextResponse.json({ state: data?.instance?.state || 'unknown' });
    }

    // 2. CONNECT / CREATE
    if (action === 'connect') {
      // Tenta buscar o QR Code se a instância já existir
      let connectResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
        headers: { 'apikey': apiKey }
      });

      let connectData = await connectResponse.json();

      // Se a instância não existir, cria uma nova
      if (connectResponse.status === 404 || connectData.error) {
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
      }

      // Seta o Webhook sempre que conectar para garantir a URL correta
      await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook: {
            url: webhookUrl,
            webhook_by_events: false,
            webhook_base64: false,
            events: ["MESSAGES_UPSERT"]
          }
        })
      });

      return NextResponse.json(connectData);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error on WhatsApp Instance API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
