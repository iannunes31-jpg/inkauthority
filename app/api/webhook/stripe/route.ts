import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const productId = session.metadata?.productId;
    const productType = session.metadata?.productType;

    if (userId && productId) {
      const { error } = await supabase.from('user_purchases').upsert([
        {
          user_id: userId,
          product_id: productId,
          product_type: productType || 'general',
          stripe_session_id: session.id,
          status: 'active',
          purchased_at: new Date().toISOString(),
        }
      ], { onConflict: 'user_id,product_id' });

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
