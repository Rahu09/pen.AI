export const PLANS = [
  {
    name: "Free",
    slug: "free",
    // PDFs that can be uploaded per calendar month
    quota: 10,
    pagesPerPdf: 5,
    // Must match the uploader limits in src/app/api/uploadthing/core.ts
    maxFileSizeMb: 4,
    // How many passages (chunks) of the PDF are retrieved and given to the
    // model for each question. More passages means the answer can draw on
    // more of the document.
    retrievalTopK: 4,
    // How many previous messages are sent along as conversation history.
    historyMessages: 6,
    price: {
      // In whole units of `currency`. Must match the Stripe price below.
      amount: 0,
      currency: "INR",
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    quota: 50,
    pagesPerPdf: 25,
    maxFileSizeMb: 16,
    retrievalTopK: 8,
    historyMessages: 12,
    price: {
      amount: 199,
      currency: "INR",
      priceIds: {
        // TODO(owner): this id is the old price (INR 1,999 a month). Create
        // an INR 199 monthly price in Stripe and put its id here.
        test: "price_1OySjwSGmbuNLRoTBRpviXht",
        production: "",
      },
    },
  },
];

export type Plan = (typeof PLANS)[number];

/** The plan a user is on, by subscription state. */
export const getPlan = (isSubscribed: boolean) =>
  PLANS.find((plan) => plan.slug === (isSubscribed ? "pro" : "free"))!;

/** A plan's monthly price as shown to people, e.g. "₹199". */
export const formatPrice = (plan: Plan) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: plan.price.currency,
    maximumFractionDigits: 0,
  }).format(plan.price.amount);

/** Uploads are counted from the first day of the current month (UTC). */
export const startOfQuotaPeriod = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};
