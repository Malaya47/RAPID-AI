import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not / or /login or /signup,
  // redirect the user to /login
  if (
    !session &&
    request.nextUrl.pathname.startsWith("/dashboard")
    // !request.nextUrl.pathname.startsWith("/login") &&
    // !request.nextUrl.pathname.startsWith("/signup") &&
    // request.nextUrl.pathname !== "/"
  ) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is signed in and the current path is /login or /signup,
  // redirect the user to /dashboard
  if (session && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

