import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, price, productId, productType, isSubscription, returnUrl } = await req.json();

    if (!productName || !price) {
      return NextResponse.json({ error: 'Missing product details' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName,
              metadata: {
                productId: productId || 'unknown',
                productType: productType || 'general',
              }
            },
            unit_amount: Math.round(price * 100),
            ...(isSubscription ? { recurring: { interval: 'month' } } : {})
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        productId: String(productId || 'unknown'),
        productType: String(productType || 'general'),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnUrl || '/dashboard'}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnUrl || '/dashboard'}?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
