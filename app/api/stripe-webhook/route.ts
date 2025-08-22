// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { createClient } from "@/utils/supabase/server";
// import { SubscriptionService } from "@/lib/subscription";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// });

// export async function POST(req: Request) {
//   const sig = req.headers.get("stripe-signature");
//   const body = await req.text();

//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig!,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed.", err);
//     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
//   }

//   const supabase = createClient();
//   const subscriptionService = new SubscriptionService(supabase);

//   // Helper to get userId and planId from metadata or subscription
//   const getUserAndPlan = async (subscription: Stripe.Subscription) => {
//     // You should store userId and planId in Stripe metadata when creating the subscription/session
//     const userId = subscription.metadata?.userId;
//     const planId = subscription.metadata?.planId;
//     return { userId, planId };
//   };

//   switch (event.type) {
//     case "checkout.session.completed": {
//       console.log("checkout completed");

//       const session = event.data.object as Stripe.Checkout.Session;
//       if (session.mode === "subscription" && session.subscription) {
//         // Fetch subscription details from Stripe
//         const subscription = await stripe.subscriptions.retrieve(
//           session.subscription as string
//         );
//         const { userId, planId } = await getUserAndPlan(subscription);
//         if (userId && planId) {
//           // Always set credits to the new plan's value (no accumulation)
//           await subscriptionService.createSubscription(userId, planId);
//         }
//       }
//       break;
//     }

//     case "customer.subscription.updated": {
//       console.log("customer subscription updated");

//       const subscription = event.data.object as Stripe.Subscription;
//       const { userId, planId } = await getUserAndPlan(subscription);
//       if (userId && planId) {
//         // Always set credits to the new plan's value (no accumulation)
//         await subscriptionService.createSubscription(userId, planId);
//       }
//       break;
//     }

//     case "customer.subscription.deleted": {
//       console.log("customer subscription deleted");
//       const subscription = event.data.object as Stripe.Subscription;
//       const userId = subscription.metadata?.userId;
//       if (userId) {
//         // Only cancel the subscription, do NOT reset credits
//         await supabase
//           .from("user_subscriptions")
//           .update({ status: "cancelled" })
//           .eq("user_id", userId)
//           .eq("status", "active");
//         // Do NOT call updateProfileCredits here
//       }
//       break;
//     }

//     default:
//       // Ignore other events
//       break;
//   }

//   return NextResponse.json({ received: true });
// }

// app/api/stripe/webhook/route.ts
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
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient();
  const subscriptionService = new SubscriptionService(supabase);

  // helper to extract ids
  const extractUserAndPlan = (subscription: Stripe.Subscription) => {
    const userId = subscription.metadata?.userId;
    const priceId = subscription.items.data[0]?.price.id;
    return {
      userId,
      planId: priceId,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const { userId, planId, subscriptionId } =
            extractUserAndPlan(subscription);

          if (userId && planId) {
            await subscriptionService.createSubscription(userId, planId);

            // store stripe subscription id
            await supabase
              .from("user_subscriptions")
              .update({ stripe_subscription_id: subscriptionId })
              .eq("user_id", userId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId, planId, subscriptionId, status } =
          extractUserAndPlan(subscription);

        if (userId && planId) {
          await subscriptionService.createSubscription(userId, planId);

          // await supabase
          //   .from("user_subscriptions")
          //   .update({
          //     stripe_subscription_id: subscriptionId,
          //     status,
          //   })
          //   .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { userId } = extractUserAndPlan(subscription);

        if (userId) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "cancelled" })
            .eq("user_id", userId);

          // also sync profile credits to 0
          await subscriptionService.updateProfileCredits(userId, 0);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Error handling event:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
