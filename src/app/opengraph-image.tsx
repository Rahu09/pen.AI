import { ImageResponse } from "next/og";

// The picture shown when a link to the site is shared. Next.js renders this
// component to a PNG and adds the og:image tags to every page, so the image
// is code and cannot drift from the design the way a screenshot does.

export const alt = "pen.AI. Ask your PDFs anything.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          // the aurora: periwinkle to lilac, with the blue, magenta and cyan blooms
          backgroundColor: "#c7d2fe",
          backgroundImage:
            "radial-gradient(circle at 12% 88%, rgba(221,74,255,0.55), rgba(221,74,255,0) 45%), radial-gradient(circle at 92% 78%, rgba(100,220,255,0.6), rgba(100,220,255,0) 42%), radial-gradient(circle at 78% 8%, rgba(18,113,255,0.35), rgba(18,113,255,0) 45%), linear-gradient(40deg, #c7d2fe, #e9d5ff)",
          color: "#09090b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 64,
              backgroundColor: "#09090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#ffffff">
              <path d="m6.94 14.036c-.233.624-.43 1.2-.606 1.783.96-.697 2.101-1.139 3.418-1.304 2.513-.314 4.746-1.973 5.876-4.058l-1.456-1.455 1.413-1.415 1-1.001c.43-.43.915-1.224 1.428-2.368-5.593.867-9.018 4.292-11.074 9.818zm10.06-5.035 1 .999c-1 3-4 6-8 6.5-2.669.334-4.336 2.167-5.002 5.5h-1.998c1-6 3-20 18-20-1 2.997-1.998 4.996-2.997 5.997z" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 600 }}>pen.AI</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            Ask your PDFs
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: "#2563eb",
            }}
          >
            anything.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "#3f3f46" }}>
            Upload a document. Get answers from what it actually says.
          </div>
        </div>
      </div>
    ),
    size
  );
}
