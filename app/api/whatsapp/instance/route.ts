import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userHasAccess, planRequired } from "@/lib/access-server";
import { registerWebhook } from '@/lib/evolution-webhook';

const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
const apiKey = process.env.EVOLUTION_API_KEY!;

// The Evolution server on Railway occasionally resets connections (ECONNRESET); retry those.
async function evo(path: string, init: RequestInit = {}, tries = 3): Promise<Response> {
  for (let i = 1; ; i++) {
    try {
      return await fetch(`${evolutionUrl}${path}`, {
        ...init,
        headers: { apikey: apiKey, 'Content-Type': 'application/json', ...(init.headers || {}) },
      });
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 400 * i));
    }
  }
}

const json = async (res: Response) => res.json().catch(() => ({}));

function extractQr(data: any) {
  return {
    qr: data?.base64 || data?.qrcode?.base64 || (typeof data?.qrcode === 'string' ? data.qrcode : null) || null,
    pairingCode: data?.pairingCode || data?.qrcode?.pairingCode || null,
  };
}

async function createInstance(instanceName: string, number?: string) {
  const res = await evo('/instance/create', {
    method: 'POST',
    body: JSON.stringify({ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS', ...(number ? { number } : {}) }),
  });
  const data = await json(res);
  console.log('[WhatsApp] create response', res.status, JSON.stringify(data).slice(0, 200));
  return data;
}

async function connect(instanceName: string, number?: string) {
  const res = await evo(`/instance/connect/${instanceName}${number ? `?number=${number}` : ''}`);
  const data = await json(res);
  console.log('[WhatsApp] connect response', res.status, JSON.stringify(data).slice(0, 120));
  const missing = res.status === 404 || data?.error || data?.statusCode === 404;
  return { data, missing };
}

export async function POST(req: Request) {
  try {
    // The instance always maps to the caller's own Clerk id, never a client-sent name.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await userHasAccess(userId, "dante"))) return planRequired();

    const { action, number: rawNumber } = await req.json();
    const instanceName = userId;
    const number = typeof rawNumber === 'string' ? rawNumber.replace(/\D/g, '') : '';
    if (number && (number.length < 10 || number.length > 15)) {
      return NextResponse.json({ error: 'Número inválido. Use DDI + DDD + número, ex: 5521999998888.' }, { status: 400 });
    }

    if (action === 'status') {
      const response = await evo(`/instance/connectionState/${instanceName}`);
      if (response.status === 404) return NextResponse.json({ state: 'not_found' });
      const data = await json(response);
      const state = data?.instance?.state || data?.state || 'unknown';
      if (state === 'open') await registerWebhook(instanceName);
      return NextResponse.json({ state });
    }

    // Show a QR (or a pairing code when a number is given), creating the instance if needed.
    if (action === 'connect') {
      let { data, missing } = await connect(instanceName, number || undefined);
      if (missing) {
        await createInstance(instanceName, number || undefined);
        ({ data } = await connect(instanceName, number || undefined));
      }
      await registerWebhook(instanceName);
      return NextResponse.json({ ...data, ...extractQr(data) });
    }

    // Switching numbers: the old session must be dropped, otherwise the instance keeps
    // trying to restore it and stays in "connecting" while the new QR never pairs.
    if (action === 'reset') {
      await evo(`/instance/logout/${instanceName}`, { method: 'DELETE' }).catch(() => null);
      await evo(`/instance/delete/${instanceName}`, { method: 'DELETE' }).catch(() => null);
      await new Promise((r) => setTimeout(r, 1200));
      const created = await createInstance(instanceName, number || undefined);
      let data = created;
      if (number || !extractQr(created).qr) ({ data } = await connect(instanceName, number || undefined));
      await registerWebhook(instanceName);
      console.log('[WhatsApp] reset done', instanceName);
      return NextResponse.json({ ...data, ...extractQr(data) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error on WhatsApp Instance API:', error);
    return NextResponse.json({ error: 'Não foi possível falar com o servidor do WhatsApp. Tente de novo em alguns segundos.' }, { status: 502 });
  }
}
