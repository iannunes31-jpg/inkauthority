import { NextRequest, NextResponse } from 'next/server';
import { checkIsFullAdmin } from '@/lib/auth-server';
import { registerWebhook, getWebhookUrl } from '@/lib/evolution-webhook';

// POST /api/admin/fix-webhook  { instanceName: "user_xxx" }
export async function POST(req: NextRequest) {
  if (!(await checkIsFullAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { instanceName, all } = await req.json();

  // Re-registers the webhook (with the current secret) on every WhatsApp instance at once.
  if (all) {
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
    const res = await fetch(`${evolutionUrl}/instance/fetchInstances`, { headers: { apikey: process.env.EVOLUTION_API_KEY! } });
    const list = await res.json().catch(() => []);
    const names: string[] = (Array.isArray(list) ? list : [])
      .map((i: any) => i?.name ?? i?.instance?.instanceName ?? i?.instanceName)
      .filter(Boolean);
    const results: Record<string, number> = {};
    for (const name of names) results[name.slice(0, 12)] = (await registerWebhook(name)).status;
    return NextResponse.json({ count: names.length, secretOn: !!process.env.WHATSAPP_WEBHOOK_SECRET, results });
  }

  if (!instanceName) {
    return NextResponse.json({ error: 'instanceName required' }, { status: 400 });
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
  const apiKey = process.env.EVOLUTION_API_KEY!;

  const statusRes = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
    headers: { apikey: apiKey },
  });
  const instanceStatus = await statusRes.json().catch(() => null);

  const webhookSetResult = await registerWebhook(instanceName);

  const findRes = await fetch(`${evolutionUrl}/webhook/find/${instanceName}`, {
    headers: { apikey: apiKey },
  });
  const currentWebhookConfig = await findRes.json().catch(() => null);

  return NextResponse.json({
    instanceName,
    webhookUrlUsed: getWebhookUrl(),
    instanceStatus,
    webhookSetResult,
    currentWebhookConfig,
  });
}
