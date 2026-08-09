import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe não configurado. Adicione STRIPE_SECRET_KEY nas variáveis de ambiente da Vercel.' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-06-30.basil' as any,
    });

    const { productName, price, isSubscription = false, returnUrl = '/tools' } = await req.json();
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inkauthority.com.br';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(price * 100), // Stripe usa centavos
            ...(isSubscription && {
              recurring: {
                interval: 'month',
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${appUrl}${returnUrl}?success=true`,
      cancel_url: `${appUrl}${returnUrl}?canceled=true`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
