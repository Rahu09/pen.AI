import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/marketing/SiteFooter";

// Public pages (landing, pricing, policies, auth callback) share the marketing
// navbar and footer. The signed-in area under /dashboard has its own shell.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
