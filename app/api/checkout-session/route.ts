import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function GET(req: Request) {
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is missing" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error);
    if (
      error.type === "StripeCardError" ||
      error.type === "StripeRateLimitError" ||
      error.type === "StripeInvalidRequestError" ||
      error.type === "StripeAPIError" ||
      error.type === "StripeAuthenticationError" ||
      error.type === "StripePermissionError" ||
      error.type === "StripeConnectionError"
    ) {
      console.error("Stripe Error Details:", {
        code: error.code,
        doc_url: error.doc_url,
        param: error.param,
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    return NextResponse.json(
      {
        error: (error as Error).message || "Error retrieving checkout session",
      },
      { status: 500 }
    );
  }
}
