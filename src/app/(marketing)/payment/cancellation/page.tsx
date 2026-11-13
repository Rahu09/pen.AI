import { PolicyPage } from "@/components/marketing/PolicyPage";
import { ContactLine } from "@/components/marketing/ContactLine";
import { getPlan, formatPrice } from "@/config/stripe";
import { SITE_NAME } from "@/config/site";
import { constructMetadata } from "@/lib/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: `Cancellation and refunds | ${SITE_NAME}`,
  description: `How to cancel ${SITE_NAME} Pro and how refunds work.`,
});

export default function CancellationPage() {
  const pro = getPlan(true);
  const free = getPlan(false);

  return (
    <PolicyPage
      title="Cancellation and refunds"
      intro="Pro is a monthly subscription you can cancel at any time."
      current="/payment/cancellation"
    >
      <h2>How to cancel</h2>
      <ol>
        <li>
          Open <Link href="/dashboard/billing">Billing</Link> while signed in.
        </li>
        <li>
          Choose <strong>Manage subscription</strong>. This opens Stripe&apos;s
          billing page.
        </li>
        <li>Cancel the subscription there.</li>
      </ol>

      <h2>What happens next</h2>
      <p>
        You are not charged again. Pro stays active until the end of the
        month you have already paid for; after that your account moves to the
        Free plan. Your documents and chats are kept, but the Free limits
        apply to new uploads ({free.quota} a month, up to {free.pagesPerPdf}{" "}
        pages each).
      </p>

      <h2>Refunds</h2>
      <p>
        Pro costs {formatPrice(pro)} a month, paid in advance, once a month
        from the day you subscribe. Because you can cancel at any time and
        keep Pro until the paid month ends, we do not refund the part of a
        month that is left when you cancel.
      </p>
      <p>
        If you were charged by mistake, charged twice, or charged after you
        cancelled, <ContactLine /> within 30 days of the charge and we will
        look into it. Approved refunds go back to the card you paid with
        through Stripe, which usually takes 5 to 10 business days to appear.
      </p>
    </PolicyPage>
  );
}
