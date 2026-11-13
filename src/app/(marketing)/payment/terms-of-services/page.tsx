import { PolicyPage } from "@/components/marketing/PolicyPage";
import { ContactLine } from "@/components/marketing/ContactLine";
import { PLANS, formatPrice } from "@/config/stripe";
import { SITE_NAME } from "@/config/site";
import { constructMetadata } from "@/lib/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: `Terms of service | ${SITE_NAME}`,
  description: `The terms for using ${SITE_NAME}.`,
});

export default function TermsPage() {
  const [free, pro] = PLANS;

  return (
    <PolicyPage
      title="Terms of service"
      intro={`The rules for using ${SITE_NAME}. By creating an account you agree to them.`}
      current="/payment/terms-of-services"
    >
      <h2>The service</h2>
      <p>
        {SITE_NAME} lets you upload a PDF and ask questions about it. Answers
        are written by an AI model from passages of your document. They can be
        incomplete or wrong, so check anything important against the PDF
        itself; each answer cites the pages it used.
      </p>

      <h2>Your account</h2>
      <p>
        You sign in through our login provider. Keep your login to yourself;
        you are responsible for what is done with your account.
      </p>

      <h2>Your documents</h2>
      <ul>
        <li>
          You keep all rights to the PDFs you upload. We use them only to
          answer your questions (see the{" "}
          <Link href="/payment/privacy-policy">privacy policy</Link>).
        </li>
        <li>
          Only upload documents you have the right to use. Do not upload
          material that is unlawful or that you are not allowed to share with
          the services listed in the privacy policy.
        </li>
        <li>You can delete a document, and its chat, at any time.</li>
      </ul>

      <h2>Plans and payment</h2>
      <p>
        The Free plan costs nothing and allows {free.quota} uploads a month,
        up to {free.pagesPerPdf} pages and {free.maxFileSizeMb} MB each. Pro
        costs {formatPrice(pro)} a month and allows {pro.quota} uploads a
        month, up to {pro.pagesPerPdf} pages and {pro.maxFileSizeMb} MB each.
        Current limits are always on the <Link href="/pricing">pricing page</Link>.
      </p>
      <p>
        Pro is a monthly subscription, paid through Stripe. It renews each
        month until you cancel. How cancelling works is on the{" "}
        <Link href="/payment/cancellation">cancellation and refunds</Link>{" "}
        page.
      </p>

      <h2>Fair use</h2>
      <p>
        Do not try to break, overload or get around the limits of the service,
        and do not use it to harm others. We may suspend an account that does.
      </p>

      <h2>Availability</h2>
      <p>
        {SITE_NAME} is a small, independently run project. We aim to keep it
        working but cannot promise it will always be available, and it is
        provided as it is, without warranties. As far as the law allows, we
        are not liable for losses that come from using it.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change, the new version is posted here with a new
        date. Continuing to use the service after that means you accept them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <ContactLine />.
      </p>
    </PolicyPage>
  );
}
