import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import { Caveat, Inter, Instrument_Serif } from "next/font/google";
import "simplebar-react/dist/simplebar.min.css";
import type { Viewport } from "next";
import "./globals.css";

// Inter for the interface, Instrument Serif for headlines, Caveat for the
// two handwritten margin notes on the landing page (see docs/DESIGN.md).
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  // Next 13.5 has no fallback metrics for this font and warns without this
  adjustFontFallback: false,
});
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

export const metadata = constructMetadata();

// Browser chrome colour (mobile address bar). Since Next 14 it belongs in the
// viewport export, not in metadata. The values are the page background in
// light and dark (`--background` in globals.css).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a14" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the theme script sets the class on <html>
    // before React loads, so server and client markup differ there by design.
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          inter.variable,
          serif.variable,
          hand.variable
        )}
      >
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
