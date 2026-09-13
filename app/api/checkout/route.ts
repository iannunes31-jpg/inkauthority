import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRODUCT_CATALOG, DEFAULT_COURSE_PRICE } from '@/lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

// Boleto and Pix both require being switched on in the Stripe dashboard
// (Settings -> Payment methods) before Stripe will accept them on a
// Checkout Session -- if even one requested type isn't activated, Stripe
// rejects the WHOLE session with a 400, which is what surfaced in
// production as "Erro ao iniciar checkout." (that's why the previous fix
// here dropped down to card-only). Neither supports recurring billing, so
// there's no point offering them for subscription mode.
// Instead of hardcoding whichever subset happens to be active today, try
// the full wishlist and let Stripe tell us if one isn't enabled yet -- drop
// just that one and retry. This means the day boleto/pix get activated in
// the dashboard, they start showing up here with no code change needed.
async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
  candidateMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[]
) {
  let methods = candidateMethods;
  for (let attempt = 0; attempt < candidateMethods.length; attempt++) {
    try {
      return await stripe.checkout.sessions.create({ ...params, payment_method_types: methods });
    } catch (err: any) {
      const invalidType = err?.message?.match(/payment method type provided: (\w+) is invalid/i)?.[1];
      if (invalidType && methods.includes(invalidType as any) && methods.length > 1) {
        methods = methods.filter((m) => m !== invalidType);
        continue;
      }
      throw err;
    }
  }
  // Guaranteed last resort: card is always active on any Stripe account.
  return stripe.checkout.sessions.create({ ...params, payment_method_types: ['card'] });
}

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

    const session = await createCheckoutSession(
      {
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
      },
      // boleto/pix don't support recurring billing -- only offer them for
      // one-time purchases.
      isSubscription ? ['card'] : ['card', 'boleto', 'pix']
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
