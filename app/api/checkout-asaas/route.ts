/**
 * Asaas Checkout API
 *
 * Creates a payment link via Asaas REST API.
 * Asaas supports Pix, Boleto, and Credit Card natively — no dashboard
 * activation required like on Stripe. Returns a URL the client can
 * redirect to, matching the same contract as /api/checkout (Stripe).
 *
 * Docs: https://docs.asaas.com/reference/criar-link-de-pagamento
 */
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRODUCT_CATALOG, DEFAULT_COURSE_PRICE } from '@/lib/products';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

async function asaasRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || data?.message || `Asaas error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Find or create an Asaas customer for the given Clerk userId / email.
 * Asaas requires a customer before creating a charge/payment link.
 */
async function getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
  // Check if we already stored the Asaas customer ID in Supabase
  const { data: existing } = await supabase
    .from('user_purchases')
    .select('asaas_customer_id')
    .eq('user_id', userId)
    .not('asaas_customer_id', 'is', null)
    .limit(1)
    .single();

  if (existing?.asaas_customer_id) {
    return existing.asaas_customer_id;
  }

  // Create a new customer in Asaas
  const customer = await asaasRequest('/customers', 'POST', {
    name: name || 'Cliente',
    email,
    externalReference: userId,
  });

  return customer.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productType, returnUrl, paymentMethod, customerEmail, customerName } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Resolve product server-side — never trust price from the client
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
      price = DEFAULT_COURSE_PRICE;
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}${returnUrl || '/dashboard'}?success=true&gateway=asaas`;
    const cancelUrl  = `${baseUrl}${returnUrl || '/dashboard'}?canceled=true&gateway=asaas`;

    // Get or create customer
    const email = customerEmail || `${userId}@noemail.inkauthority.com`;
    const name  = customerName  || 'Cliente';
    const customerId = await getOrCreateCustomer(userId, email, name);

    if (isSubscription) {
      // Asaas subscriptions (planos recorrentes)
      const billingType = paymentMethod === 'PIX' ? 'PIX'
        : paymentMethod === 'BOLETO' ? 'BOLETO'
        : 'CREDIT_CARD';

      const subscription = await asaasRequest('/subscriptions', 'POST', {
        customer: customerId,
        billingType,
        value: price,
        nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        cycle: 'MONTHLY',
        description: productName,
        externalReference: JSON.stringify({ userId, productId, productType: productType || 'general' }),
      });

      // For subscriptions Asaas doesn't return a direct checkout URL, so we
      // send the user to the first invoice's payment URL if available, or
      // fall back to our success page so they know it worked.
      const paymentUrl = subscription?.invoiceUrl || successUrl;
      return NextResponse.json({ url: paymentUrl });
    } else {
      // One-time payment link (link de pagamento)
      const billingType = paymentMethod === 'PIX' ? 'PIX'
        : paymentMethod === 'BOLETO' ? 'BOLETO'
        : paymentMethod === 'CREDIT_CARD' ? 'CREDIT_CARD'
        : 'UNDEFINED'; // UNDEFINED = customer chooses at checkout

      const paymentLink = await asaasRequest('/paymentLinks', 'POST', {
        name: productName,
        description: `Acesso a: ${productName}`,
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // 7 days
        value: price,
        billingType,
        chargeType: 'DETACHED',
        maxInstallmentCount: billingType === 'CREDIT_CARD' || billingType === 'UNDEFINED' ? 12 : 1,
        notificationEnabled: true,
        externalReference: JSON.stringify({ userId, productId, productType: productType || 'general' }),
        successUrl,
      });

      return NextResponse.json({ url: paymentLink.url });
    }
  } catch (error: any) {
    console.error('Asaas Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
