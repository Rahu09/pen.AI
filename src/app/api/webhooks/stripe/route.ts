import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

/**
 * Stripe calls this after billing events. Two matter here:
 *
 * - `checkout.session.completed`: the user finished Checkout. The session
 *   carries our `userId` in its metadata (set in `createStripeSession`), so
 *   this is where the Stripe customer and subscription get linked to a user.
 * - `invoice.payment_succeeded`: a subscription was paid, the first time and
 *   on every renewal. An invoice does not carry the Checkout metadata, so the
 *   user is found by subscription id instead. This moves the period end
 *   forward each month; without it a subscriber would drop to Free after the
 *   first period.
 *
 * `event.data.object` is a different type per event. Stripe SDK 13 does not
 * narrow it from `event.type`, so each branch states the type it receives.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    // Checks the signature, so only Stripe can call this route.
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = idOf(session.subscription);

      // Not one of ours (no userId) or not a subscription checkout.
      if (!userId || !subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await db.user.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: idOf(subscription.customer),
          ...periodFields(subscription),
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = idOf(invoice.subscription);

      // A one-off invoice, not a subscription payment.
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // updateMany, not update: the first invoice can arrive before
      // checkout.session.completed has stored the subscription id. Then this
      // matches no row and does nothing, and the checkout event writes the
      // same period end moments later. `update` would throw and make Stripe
      // retry for no reason.
      await db.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: periodFields(subscription),
      });
      break;
    }
  }

  return new Response(null, { status: 200 });
}

/** Stripe fields can be an id or an expanded object; we only need the id. */
function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function periodFields(subscription: Stripe.Subscription) {
  return {
    stripePriceId: subscription.items.data[0]?.price.id,
    // Stripe times are seconds since 1970; Date wants milliseconds.
    stripeCurrentPeriodEnd: new Date(
      subscription.current_period_end * 1000
    ).toDateString(),
  };
}
