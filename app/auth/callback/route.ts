// app/auth/callback/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error =
    url.searchParams.get("error") ?? url.searchParams.get("error_description");

  // handle provider error
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, url.origin)
    );
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    // exchange the code for a session (PKCE exchange)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect where you want after sign-in
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
