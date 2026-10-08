const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';

export function getWebhookUrl() {
  const base = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.inkauthority.com.br'}/api/whatsapp/webhook`;
  return process.env.WHATSAPP_WEBHOOK_SECRET
    ? `${base}?secret=${process.env.WHATSAPP_WEBHOOK_SECRET}`
    : base;
}

// Evolution API v2 payload format; the old v1-style keys were rejected silently.
export async function registerWebhook(instanceName: string) {
  const apiKey = process.env.EVOLUTION_API_KEY!;
  const res = await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: getWebhookUrl(),
        byEvents: false,
        base64: false,
        events: ['MESSAGES_UPSERT'],
      },
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('[WPP webhook/set] failed', instanceName, res.status, JSON.stringify(body)?.slice(0, 300));
  } else {
    console.log('[WPP webhook/set] ok', instanceName);
  }
  return { ok: res.ok, status: res.status, body };
}
