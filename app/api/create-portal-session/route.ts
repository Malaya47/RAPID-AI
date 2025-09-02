import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  const { customerId } = await req.json();

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard`, // or wherever you want to redirect after cancel
  });

  return NextResponse.json({ url: session.url });
}
