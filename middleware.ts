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

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import type { Database } from "@/types/supabase";

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   const res = NextResponse.next();

//   const isCallback = pathname.startsWith("/auth/callback");

//   // 1️⃣ On /auth/callback → always check session
//   if (isCallback) {
//     const supabase = createMiddlewareClient<Database>({ req: request, res });
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     // Redirect to dashboard or where they came from
//     if (session) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return res;
//   }

//   // 2️⃣ On /dashboard with NO sb-access-token cookie → run getSession() once
//   const hasAccessToken = request.cookies.has("sb-access-token");
//   if (pathname.startsWith("/dashboard") && !hasAccessToken) {
//     const supabase = createMiddlewareClient<Database>({ req: request, res });
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     if (!session) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//     return res; // Allow dashboard if session exists
//   }

//   // 3️⃣ Normal fast checks for /dashboard and /login
//   if (pathname.startsWith("/dashboard") && !hasAccessToken) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (pathname === "/login" && hasAccessToken) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/auth/callback"],
// };

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import type { Database } from "@/types/supabase";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   let res = NextResponse.next();

//   const supabase = createMiddlewareClient<Database>({ req: request, res });
//   const {
//     data: { session },
//     error,
//   } = await supabase.auth.getSession();

//   // If refresh fails, clear cookies immediately
//   if (error) {
//     console.error("Supabase session refresh failed:", error.message);
//     await supabase.auth.signOut(); //  clears bad cookies
//   }

//   // 1️ Auth callback → redirect if logged in
//   if (pathname.startsWith("/auth/callback")) {
//     if (session) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return res;
//   }

//   // 2️ Dashboard → must be logged in
//   if (pathname.startsWith("/dashboard") && !session) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // 3️ Login → redirect if already logged in
//   if (pathname === "/login" && session) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/auth/callback"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

const COOLDOWN_PERIOD = 10_000; // 10s

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let res = NextResponse.next();

  const lastFailureCookie = request.cookies.get("lastFailure")?.value;
  const lastFailureTime = lastFailureCookie ? parseInt(lastFailureCookie) : 0;
  const now = Date.now();

  // ⛔ If in cooldown → skip refresh entirely
  if (now - lastFailureTime < COOLDOWN_PERIOD && lastFailureTime > 0) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return res;
  }

  try {
    const supabase = createMiddlewareClient<Database>({ req: request, res });

    // ⚡ Instead of always refreshing, just check if a session exists
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase session fetch failed:", error.message);

      // store cooldown cookie
      res.cookies.set("lastFailure", now.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOLDOWN_PERIOD / 1000,
      });

      if (pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return res;
    }

    // ✅ If session exists, don’t refresh unless close to expiry
    if (session) {
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeLeft = expiresAt - now;

      // only refresh if < 5 minutes left
      if (timeLeft < 5 * 60 * 1000) {
        try {
          await supabase.auth.refreshSession();
        } catch (refreshError) {
          console.error("Session refresh failed:", refreshError);
        }
      }
    }

    // 1️ Auth callback → redirect if logged in
    if (pathname.startsWith("/auth/callback") && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2️ Dashboard → must be logged in
    if (pathname.startsWith("/dashboard") && !session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3️ Login → redirect if already logged in
    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return res;
  } catch (e) {
    console.error("Unexpected error in middleware:", e);

    res.cookies.set("lastFailure", Date.now().toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOLDOWN_PERIOD / 1000,
    });

    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/auth/callback"],
};
