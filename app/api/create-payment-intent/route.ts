import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { SubscriptionService } from "@/lib/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { amount, planName, credits, userId, priceId, planId } =
      await req.json();
    const supabase = await createClient();
    const subscriptionService = new SubscriptionService(supabase);

    // 1. Get user from DB
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 2. Get email from Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const email = authUser.user?.email;

    let stripeCustomerId = user.stripe_customer_id;

    // 3. If no Stripe customer, create one and store it
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email, // for invoices
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", userId);
    }

    const origin =
      req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: userId,
        credits: credits,
        planName: planName,
        planId: planId,
        originalAmount: amount,
      },
      customer: stripeCustomerId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error creating checkout session" },
      { status: 500 }
    );
  }
}
