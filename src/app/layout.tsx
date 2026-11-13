import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { cn, constructMetadata } from "@/lib/utils";
import { Caveat, Inter, Instrument_Serif } from "next/font/google";
import "simplebar-react/dist/simplebar.min.css";
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
