// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// export async function middleware(request: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req: request, res });

//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   if (error?.message?.includes("refresh_token_not_found")) {
//     res.cookies.delete("sb-access-token");
//     res.cookies.delete("sb-refresh-token");
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If user is not signed in and the current path is not / or /login or /signup,
//   // redirect the user to /login
//   if (
//     !session &&
//     request.nextUrl.pathname.startsWith("/dashboard")
//     // !request.nextUrl.pathname.startsWith("/login") &&
//     // !request.nextUrl.pathname.startsWith("/signup") &&
//     // request.nextUrl.pathname !== "/"
//   ) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If user is signed in and the current path is /login or /signup,
//   // redirect the user to /dashboard
//   if (
//     session &&
//     (request.nextUrl.pathname.startsWith("/login") ||
//       request.nextUrl.pathname.startsWith("/signup"))
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)"],
// };

// new code

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// export async function middleware(request: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req: request, res });

//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   // If refresh token is invalid, clear cookies & redirect to login
//   if (error?.message?.includes("refresh_token_not_found")) {
//     res.cookies.delete("sb-access-token");
//     res.cookies.delete("sb-refresh-token");
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // If no session, redirect to login
//   if (!session) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return res;
// }

// // Middleware runs ONLY on dashboard routes
// export const config = {
//   matcher: ["/dashboard"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  //  If trying to access dashboard but no session → redirect to login
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  //  If trying to access login but already logged in → redirect to dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"], // protect dashboard + handle login redirect
};
