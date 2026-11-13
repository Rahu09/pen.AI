import { PolicyPage } from "@/components/marketing/PolicyPage";
import { ContactLine } from "@/components/marketing/ContactLine";
import { getPlan } from "@/config/stripe";
import { SITE_NAME } from "@/config/site";
import { constructMetadata } from "@/lib/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: `Support | ${SITE_NAME}`,
  description: `Help with ${SITE_NAME}: common problems and how to reach us.`,
});

export default function SupportPage() {
  const free = getPlan(false);
  const pro = getPlan(true);

  return (
    <PolicyPage
      title="Support"
      intro="Answers to common problems, and how to reach us when they do not help."
      current="/payment/support"
    >
      <h2>Common problems</h2>

      <h3>My PDF says &quot;Too many pages&quot;</h3>
      <p>
        Free allows {free.pagesPerPdf} pages per PDF and Pro allows{" "}
        {pro.pagesPerPdf}. Split the document into smaller files, or{" "}
        <Link href="/pricing">upgrade</Link>.
      </p>

      <h3>My PDF says &quot;No text found&quot;</h3>
      <p>
        The PDF is a scan or a set of images, so there is no text to search.
        Run it through OCR (most PDF tools and scanner apps can do this) and
        upload the result.
      </p>

      <h3>I can&apos;t upload any more files</h3>
      <p>
        Each plan has a monthly upload limit ({free.quota} on Free,{" "}
        {pro.quota} on Pro). It resets on the first day of each month.
      </p>

      <h3>An answer is wrong or incomplete</h3>
      <p>
        Answers come from the passages that best match your question. Click
        the page citations to check the source, and try asking more
        specifically, using words that appear in the document.
      </p>

      <h3>Billing</h3>
      <p>
        Your plan, usage and subscription are on the{" "}
        <Link href="/dashboard/billing">Billing</Link> page. For cancelling
        and refunds, see{" "}
        <Link href="/payment/cancellation">cancellation and refunds</Link>.
      </p>

      <h2>Contact us</h2>
      <p>
        {SITE_NAME} is run by one person, so replies can take a few days. To
        report a bug or ask a question, <ContactLine />. Please do not post
        personal or payment details in a public GitHub issue.
      </p>
    </PolicyPage>
  );
}
