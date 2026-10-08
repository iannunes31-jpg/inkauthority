import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';
import { registerWebhook, getWebhookUrl } from '@/lib/evolution-webhook';

// POST /api/admin/fix-webhook  { instanceName: "user_xxx" }
export async function POST(req: NextRequest) {
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { instanceName } = await req.json();
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
