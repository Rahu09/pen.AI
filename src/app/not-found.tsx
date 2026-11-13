import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import {
  arrowNudge,
  buttonSize,
  inkButton,
  paperButton,
} from "@/components/marketing/styles";
import { StatusPage } from "@/components/StatusPage";

// Any URL that matches no route. It sits outside the (marketing) group, so it
// brings the navbar and footer itself.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <StatusPage
          note="page 404"
          title={
            <>
              This page is <em className="text-primary">blank</em>.
            </>
          }
          actions={
            <>
              <Link href="/" className={`${inkButton} ${buttonSize.lg}`}>
                Back to the start
                <ArrowRight className={arrowNudge} />
              </Link>
              <Link href="/dashboard" className={`${paperButton} ${buttonSize.lg}`}>
                Your files
              </Link>
            </>
          }
        >
          Nothing lives at this address. The link may be old, or mistyped.
        </StatusPage>
      </main>
      <SiteFooter />
    </div>
  );
}
