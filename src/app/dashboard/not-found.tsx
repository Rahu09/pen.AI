import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/StatusPage";

// Shown inside the app shell when a dashboard page calls notFound(), which
// /dashboard/[fileid] does when the file does not exist or belongs to
// someone else. Both cases get the same answer, so the page does not reveal
// which file ids exist.
export default function DashboardNotFound() {
  return (
    <StatusPage
      note="no such file"
      title={
        <>
          This file isn&apos;t on your <em className="text-primary">shelf</em>.
        </>
      }
      actions={
        <Link href="/dashboard" className={buttonVariants({ className: "rounded-full" })}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to your files
        </Link>
      }
    >
      It may have been deleted, or the link points to someone else&apos;s file.
    </StatusPage>
  );
}
