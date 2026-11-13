"use client";

/**
 * Last resort: an error in the root layout itself (fonts, providers). It
 * replaces the root layout, so it brings its own <html> and <body>, and it
 * cannot rely on globals.css or the theme. Hence plain inline styles.
 * Only used in production; in development Next shows its error overlay.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "0 16px",
          fontFamily: "system-ui, sans-serif",
          background: "linear-gradient(40deg, #c7d2fe, #e9d5ff)",
          color: "#18181b",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 40, margin: 0 }}>
            pen.AI hit a snag.
          </h1>
          <p style={{ color: "#52525b" }}>Please try again in a moment.</p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#71717a" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 24px",
              borderRadius: 999,
              border: 0,
              background: "#18181b",
              color: "#fff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
