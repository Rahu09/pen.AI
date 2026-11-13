import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Kinde SDK 2: one handler serves /api/auth/login, /register, /logout and
// /kinde_callback, reading the endpoint from the URL itself.
export const GET = handleAuth();
