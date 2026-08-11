import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook Error: ' + err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { userId, productId, productType } = session.metadata || {};

      if (userId && productId) {
        // Inserir a compra no banco de dados para liberar acesso
        const { error } = await supabase
          .from('user_purchases')
          .insert({
            user_id: userId,
            product_id: productId,
            product_type: productType || 'course',
            payment_status: 'paid',
            stripe_session_id: session.id,
          });

        if (error) {
          console.error('Error inserting purchase into Supabase:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
        
        console.log(\? Purchase registered for user \, product \\);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
