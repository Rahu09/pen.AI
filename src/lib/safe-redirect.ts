// `origin` comes from the URL, so anyone can put anything in it. Only accept a
// plain in-app path such as "dashboard" or "dashboard/abc123". Anything else
// (a full URL, "//evil.com", backslashes) falls back to the dashboard, so the
// auth callback cannot be used to send a signed-in user to another site.
const SAFE_ORIGIN = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;

/** Where the auth callback should send the user after sign-in. */
export function afterSignInPath(origin: string | null | undefined) {
  return origin && SAFE_ORIGIN.test(origin) ? `/${origin}` : "/dashboard";
}
