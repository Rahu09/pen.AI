import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { NextRequest } from "next/server";

/**
 * Signed-out visitors to any /dashboard page are sent to Kinde's sign-in and
 * brought back to the page they asked for (`isReturnToCurrentPage`). Kinde's
 * middleware also refreshes an expired access token before the page runs.
 *
 * A first-time user has no database row yet; `/dashboard` sends them through
 * `/auth-callback`, which creates it. Pages still check the user themselves
 * with `getKindeServerSession()`.
 */
export default function middleware(request: NextRequest) {
  return withAuth(request, { isReturnToCurrentPage: true });
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
