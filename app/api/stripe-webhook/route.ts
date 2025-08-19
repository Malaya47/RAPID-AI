import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { SubscriptionService } from "@/lib/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient();
  const subscriptionService = new SubscriptionService(supabase);

  // Helper to get userId and planId from metadata or subscription
  const getUserAndPlan = async (subscription: Stripe.Subscription) => {
    // You should store userId and planId in Stripe metadata when creating the subscription/session
    const userId = subscription.metadata?.userId;
    const planId = subscription.metadata?.planId;
    return { userId, planId };
  };

  switch (event.type) {
    case "checkout.session.completed": {
      console.log("checkout completed");

      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        // Fetch subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const { userId, planId } = await getUserAndPlan(subscription);
        if (userId && planId) {
          // Always set credits to the new plan's value (no accumulation)
          await subscriptionService.createSubscription(userId, planId);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      console.log("customer subscription updated");

      const subscription = event.data.object as Stripe.Subscription;
      const { userId, planId } = await getUserAndPlan(subscription);
      if (userId && planId) {
        // Always set credits to the new plan's value (no accumulation)
        await subscriptionService.createSubscription(userId, planId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      console.log("customer subscription deleted");
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        // Only cancel the subscription, do NOT reset credits
        await supabase
          .from("user_subscriptions")
          .update({ status: "cancelled" })
          .eq("user_id", userId)
          .eq("status", "active");
        // Do NOT call updateProfileCredits here
      }
      break;
    }

    default:
      // Ignore other events
      break;
  }

  return NextResponse.json({ received: true });
}
