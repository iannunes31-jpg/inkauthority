import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRODUCT_CATALOG, DEFAULT_COURSE_PRICE } from '@/lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: NextRequest) {
  try {
    // getAuth(req) (the old Pages Router-style helper) was returning no
    // userId here even for genuinely signed-in users on the App Router —
    // that's what was surfacing as "Erro ao iniciar checkout." auth() is
    // the version that actually reads the session in this context (already
    // used successfully in /api/chat and /api/whatsapp/instance).
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, productType, returnUrl } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Resolve name/price/subscription flag from a trusted server-side source.
    // Never trust productName/price/isSubscription sent by the client — a
    // browser can send anything it wants in the POST body.
    let productName: string;
    let price: number;
    let isSubscription: boolean;

    if (productType === 'course') {
      const { data: course, error } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .eq('id', productId)
        .single();

      if (error || !course || course.is_published === false) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      productName = course.title;
      price = DEFAULT_COURSE_PRICE; // TODO: read from courses.price once that column exists
      isSubscription = false;
    } else {
      const product = PRODUCT_CATALOG[productId];
      if (!product) {
        return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
      }
      productName = product.name;
      price = product.price;
      isSubscription = product.isSubscription;
    }

    const session = await stripe.checkout.sessions.create({
      // 'boleto' is not activated on this Stripe account -- including it
      // makes Stripe reject the whole session with a 400 ("boleto is
      // invalid"), which is exactly what was surfacing as "Erro ao iniciar
      // checkout." for every logged-in customer (on top of the getAuth()
      // bug above). Card is confirmed working; add boleto back once it's
      // enabled in the Stripe dashboard.
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName,
              metadata: {
                productId: String(productId),
                productType: String(productType || 'general'),
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
        productId: String(productId),
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
