import { beforeEach, describe, expect, it, vi } from "vitest";

// The route talks to three things: the request headers, Stripe and the
// database. All three are replaced here, so the test checks only the
// route's own decisions: which events it acts on and what it writes.
const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveSubscription: vi.fn(),
  userUpdate: vi.fn(),
  userUpdateMany: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: () => new Headers({ "Stripe-Signature": "sig" }),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: mocks.constructEvent },
    subscriptions: { retrieve: mocks.retrieveSubscription },
  },
}));

vi.mock("@/db", () => ({
  db: { user: { update: mocks.userUpdate, updateMany: mocks.userUpdateMany } },
}));

import { POST } from "./route";

const PERIOD_END = Date.UTC(2026, 11, 13) / 1000; // Stripe uses seconds

// Shape of the current API: the period end sits on the subscription item.
const subscription = {
  id: "sub_123",
  customer: "cus_123",
  items: { data: [{ price: { id: "price_pro" }, current_period_end: PERIOD_END }] },
};

// Current API: an invoice points at its subscription through `parent`.
const invoiceFor = (subscription: unknown) => ({
  parent: { type: "subscription_details", subscription_details: { subscription } },
});

function event(type: string, object: unknown) {
  mocks.constructEvent.mockReturnValue({ type, data: { object } });
  return POST(new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.retrieveSubscription.mockResolvedValue(subscription);
});

describe("POST /api/webhooks/stripe", () => {
  it("rejects a request whose signature does not check out", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const res = await POST(new Request("http://localhost/x", { method: "POST", body: "{}" }));

    expect(res.status).toBe(400);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("links the subscription to the user after Checkout", async () => {
    const res = await event("checkout.session.completed", {
      metadata: { userId: "kp_user" },
      subscription: "sub_123",
    });

    expect(res.status).toBe(200);
    expect(mocks.retrieveSubscription).toHaveBeenCalledWith("sub_123");
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "kp_user" },
      data: {
        stripeSubscriptionId: "sub_123",
        stripeCustomerId: "cus_123",
        stripePriceId: "price_pro",
        stripeCurrentPeriodEnd: new Date(PERIOD_END * 1000).toDateString(),
      },
    });
  });

  it("ignores a Checkout session that is not ours", async () => {
    await event("checkout.session.completed", { metadata: {}, subscription: "sub_123" });

    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  // The bug fixed on 2026-11-13: invoices carry no Checkout metadata, and the
  // old route returned early for them, so renewals were never recorded.
  it("moves the period end forward on a renewal invoice, by subscription id", async () => {
    const res = await event("invoice.payment_succeeded", invoiceFor("sub_123"));

    expect(res.status).toBe(200);
    expect(mocks.userUpdateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_123" },
      data: {
        stripePriceId: "price_pro",
        stripeCurrentPeriodEnd: new Date(PERIOD_END * 1000).toDateString(),
      },
    });
  });

  it("accepts an expanded subscription object on the invoice", async () => {
    await event("invoice.payment_succeeded", invoiceFor({ id: "sub_123" }));

    expect(mocks.retrieveSubscription).toHaveBeenCalledWith("sub_123");
  });

  it("ignores an invoice that is not for a subscription", async () => {
    await event("invoice.payment_succeeded", { parent: null });

    expect(mocks.retrieveSubscription).not.toHaveBeenCalled();
    expect(mocks.userUpdateMany).not.toHaveBeenCalled();
  });

  it("answers 200 to events it does not handle, so Stripe stops resending", async () => {
    const res = await event("customer.created", { id: "cus_123" });

    expect(res.status).toBe(200);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
    expect(mocks.userUpdateMany).not.toHaveBeenCalled();
  });
});
