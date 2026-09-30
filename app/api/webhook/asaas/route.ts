/**
 * Asaas Webhook Handler
 *
 * Asaas sends POST requests to this endpoint when payment status changes.
 * We listen for PAYMENT_RECEIVED and PAYMENT_CONFIRMED events and then
 * upsert the purchase record into Supabase — the same table that the
 * Stripe webhook writes to.
 *
 * Setup in Asaas: Configurações → Integrações → Webhooks
 *   URL: https://yourdomain.com/api/webhook/asaas
 *   Events: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, SUBSCRIPTION_CREATED
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

// Asaas doesn't provide a signed webhook secret like Stripe — they recommend
// checking the Authorization header matches your API key, or using a URL
// secret. We validate using a shared ASAAS_WEBHOOK_SECRET env var appended
// to the URL: /api/webhook/asaas?secret=<ASAAS_WEBHOOK_SECRET>
export async function POST(req: Request) {
  try {
    // Basic auth check — optional but recommended
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    if (process.env.ASAAS_WEBHOOK_SECRET && secret !== process.env.ASAAS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await req.json();
    const eventType: string = event?.event || '';
    const payment = event?.payment || {};

    // We only care about confirmed/received payments and new subscriptions
    if (
      eventType !== 'PAYMENT_RECEIVED' &&
      eventType !== 'PAYMENT_CONFIRMED' &&
      eventType !== 'SUBSCRIPTION_CREATED'
    ) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // externalReference was set to JSON { userId, productId, productType }
    // when creating the charge/subscription in /api/checkout-asaas
    let userId: string | null = null;
    let productId: string | null = null;
    let productType = 'general';

    try {
      const ref = JSON.parse(payment.externalReference || event.subscription?.externalReference || '{}');
      userId = ref.userId || null;
      productId = ref.productId || null;
      productType = ref.productType || 'general';
    } catch {
      // externalReference not JSON — ignore this event
      console.warn('Asaas webhook: could not parse externalReference', payment.externalReference);
      return NextResponse.json({ received: true, ignored: true });
    }

    if (!userId || !productId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const { error } = await supabase.from('user_purchases').upsert(
      [
        {
          user_id: userId,
          product_id: productId,
          product_type: productType,
          asaas_payment_id: payment.id || null,
          payment_status: 'paid',
        },
      ],
      { onConflict: 'user_id,product_id' }
    );

    if (error) {
      console.error('Supabase insert error (Asaas webhook):', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Asaas webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
