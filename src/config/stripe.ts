export const PLANS = [
  {
    name: "Free",
    slug: "free",
    // PDFs that can be uploaded per calendar month
    quota: 10,
    pagesPerPdf: 5,
    // Must match the uploader limits in src/app/api/uploadthing/core.ts
    maxFileSizeMb: 4,
    price: {
      amount: 0,
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
    price: {
      amount: 500,
      priceIds: {
        test: "price_1OySjwSGmbuNLRoTBRpviXht",
        production: "",
      },
    },
  },
];

/** The plan a user is on, by subscription state. */
export const getPlan = (isSubscribed: boolean) =>
  PLANS.find((plan) => plan.slug === (isSubscribed ? "pro" : "free"))!;

/** Uploads are counted from the first day of the current month (UTC). */
export const startOfQuotaPeriod = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};
