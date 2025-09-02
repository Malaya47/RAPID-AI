// // app/api/stripe/switch-plan/route.ts
// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { createClient } from "@/utils/supabase/server";
// import { SubscriptionService } from "@/lib/subscription";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-05-28.basil",
// });

// export async function POST(req: Request) {
//   try {
//     const { customerId, newPriceId, planId, userId } = await req.json();

//     if (!customerId || !newPriceId || !planId || !userId) {
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     // Get the customer's active subscription
//     const subscriptions = await stripe.subscriptions.list({
//       customer: customerId,
//       status: "active",
//       limit: 1,
//     });

//     if (subscriptions.data.length === 0) {
//       return NextResponse.json(
//         { error: "No active subscription found" },
//         { status: 404 }
//       );
//     }

//     const subscription = subscriptions.data[0];

//     // Update the subscription with the new price
//     const updatedSubscription = await stripe.subscriptions.update(
//       subscription.id,
//       {
//         items: [
//           {
//             id: subscription.items.data[0].id,
//             price: newPriceId,
//           },
//         ],
//         metadata: {
//           ...subscription.metadata,
//           planId: planId,
//         },
//         proration_behavior: "create_prorations",
//       }
//     );

//     // Update your database
//     const supabase = await createClient();
//     const subscriptionService = new SubscriptionService(supabase);

//     await subscriptionService.createSubscription(userId, planId);

//     return NextResponse.json({
//       success: true,
//       message: "Plan updated successfully",
//       subscription: updatedSubscription,
//     });
//   } catch (error) {
//     console.error("Error switching plan:", error);
//     return NextResponse.json(
//       { error: (error as Error).message || "Error switching plan" },
//       { status: 500 }
//     );
//   }
// }

// updated code

// app/api/stripe/switch-plan/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { SubscriptionService } from "@/lib/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { customerId, newPriceId, newPlanId, userId } = await req.json();

    if (!customerId || !newPriceId || !newPlanId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get active subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];

    // Update subscription price (Stripe) — proration enabled
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [{ id: subscription.items.data[0].id, price: newPriceId }],
        metadata: { ...subscription.metadata, planId: newPlanId },
        proration_behavior: "create_prorations",
      }
    );

    const supabase = await createClient();

    // Update only plan in DB, keep credits same
    const subscriptionService = new SubscriptionService(supabase);
    const dbSubscription = await subscriptionService.switchPlan(
      userId,
      newPlanId
    );

    return NextResponse.json({
      success: true,
      message:
        "Plan switched successfully. Credits remain unchanged until next billing cycle.",
      subscription: updatedSubscription,
      dbSubscription,
    });
  } catch (error: any) {
    console.error("Error switching plan:", error);
    return NextResponse.json(
      { error: error.message || "Error switching plan" },
      { status: 500 }
    );
  }
}
