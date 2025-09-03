// app/api/auth/set-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
  const { event, session } = await req.json();

  if (event === "SIGNED_IN") {
    // New login → set session once
    await supabase.auth.setSession(session);
  }

  if (event === "TOKEN_REFRESHED") {
    // 🔥 Already handled by supabase-js automatically, skip double refresh
    // But keep session cookie in sync
    await supabase.auth.setSession(session);
  }

  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
