import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia' as any, // Ignorando verificação estrita para garantir compatibilidade
});

export async function POST(req: Request) {
  try {
    const { productName, price } = await req.json();
    
    // Configura o checkout dinamicamente baseado no produto
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName,
            },
            unit_amount: price * 100, // Stripe usa centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',

      // Assumindo que o usuário quer subscription mensal, mode='subscription' exige usar um price_id existente do Stripe.
      // Como não temos os Price IDs (ele só passou as chaves genéricas), 
      // usaremos payment normal ou mode: 'subscription' mas criando price on the fly (exige recurring).
      
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tools?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tools?canceled=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
