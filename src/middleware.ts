import { NextResponse, type NextRequest } from "next/server";

/**
 * Signed-out visitors to any /dashboard page are sent to sign in, and come
 * back to the page they asked for afterwards.
 *
 * Kinde SDK 1.8's own `authMiddleware` sent them to the home page instead
 * (its post-logout URL), and its matcher missed `/dashboard` itself. The SDK
 * keeps the session in the `kinde_token` cookie, which is all its middleware
 * checked too; the pages still verify the user with `getKindeServerSession()`.
 *
 * After sign-in Kinde returns to `/auth-callback`, which creates the user's
 * database row if needed and then forwards to `origin`.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has("kinde_token")) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const origin = `${pathname.slice(1)}${search}`;

  const login = new URL("/api/auth/login", request.url);
  login.searchParams.set(
    "post_login_redirect_url",
    `/auth-callback?origin=${encodeURIComponent(origin)}`
  );
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
