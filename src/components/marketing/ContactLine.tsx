import { ISSUES_URL, SUPPORT_EMAIL } from "@/config/site";

/** How to reach us, as one sentence: email if configured, GitHub always. */
export function ContactLine() {
  return (
    <>
      {SUPPORT_EMAIL ? (
        <>
          email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or{" "}
        </>
      ) : null}
      open an issue on <a href={ISSUES_URL}>GitHub</a>
    </>
  );
}
