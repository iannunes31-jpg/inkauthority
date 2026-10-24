import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  // "state" alone can be forged: someone could attach their own Stripe account to another creator
  // and receive that creator's sales. It must match the user who is signed in.
  const { userId: me } = await auth();
  if (!code || !userId || userId !== me) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/painel?error=connect_failed`);
  }

  try {
    const response = await stripe.oauth.token({ grant_type: "authorization_code", code });
    const stripeAccountId = response.stripe_user_id!;

    await supabase
      .from("creator_profiles")
      .update({ stripe_account_id: stripeAccountId, stripe_onboarding_done: true })
      .eq("user_id", userId);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/painel?stripe=connected`);
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/painel?error=connect_failed`);
  }
}
