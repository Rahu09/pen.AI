// Public facts about the service, used by the policy pages.

export const SITE_NAME = "pen.AI";
export const SITE_URL = "https://pen-ai.vercel.app";
export const REPO_URL = "https://github.com/Rahu09/pen.AI";

// Where people can report a problem in public (no account needed beyond
// GitHub's).
export const ISSUES_URL = `${REPO_URL}/issues`;

// Optional support address shown on the policy pages. It is public, so it
// comes from the environment rather than being committed. Leave it unset to
// point people at GitHub issues only.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || null;
