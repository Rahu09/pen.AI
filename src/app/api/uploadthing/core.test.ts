import { beforeEach, describe, expect, it, vi } from "vitest";

// The upload middleware runs before UploadThing accepts a file. It is where
// the monthly quota from PLANS is enforced on the server (the browser checks
// too, but a browser check alone can be skipped).
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getUserSubscriptionPlan: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@kinde-oss/kinde-auth-nextjs/server", () => ({
  getKindeServerSession: () => ({ getUser: mocks.getUser }),
}));
vi.mock("@/lib/stripe", () => ({
  getUserSubscriptionPlan: mocks.getUserSubscriptionPlan,
}));
vi.mock("@/db", () => ({ db: { file: { count: mocks.count } } }));
// Not used by the middleware; mocked so the test does not load pdf.js,
// LangChain or the Gemini client.
vi.mock("@/lib/pdf-loader", () => ({ PdfPageLoader: vi.fn() }));
vi.mock("@/lib/vector-store", () => ({ getVectorStore: vi.fn() }));

import { middleware } from "./core";
import { getPlan } from "@/config/stripe";

const FREE = getPlan(false);
const PRO = getPlan(true);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ id: "kp_alice" });
  mocks.getUserSubscriptionPlan.mockResolvedValue({ isSubscribed: false });
});

describe("upload middleware", () => {
  it("refuses a signed-out upload", async () => {
    mocks.getUser.mockResolvedValue(null);

    await expect(middleware()).rejects.toThrow("Unauthorized");
    expect(mocks.count).not.toHaveBeenCalled();
  });

  it("lets a Free user upload below the quota", async () => {
    mocks.count.mockResolvedValue(FREE.quota - 1);

    await expect(middleware()).resolves.toMatchObject({ userId: "kp_alice" });
  });

  it("stops a Free user at the quota", async () => {
    mocks.count.mockResolvedValue(FREE.quota);

    await expect(middleware()).rejects.toThrow("Upload quota reached");
  });

  it("uses the Pro quota for a subscriber", async () => {
    mocks.getUserSubscriptionPlan.mockResolvedValue({ isSubscribed: true });
    mocks.count.mockResolvedValue(FREE.quota); // over Free, under Pro

    await expect(middleware()).resolves.toMatchObject({ userId: "kp_alice" });

    mocks.count.mockResolvedValue(PRO.quota);
    await expect(middleware()).rejects.toThrow("Upload quota reached");
  });

  it("counts only this user's uploads in the current month", async () => {
    mocks.count.mockResolvedValue(0);

    await middleware();

    const { where } = mocks.count.mock.calls[0][0];
    expect(where.userId).toBe("kp_alice");
    expect(where.createdAt.gte).toBeInstanceOf(Date);
  });
});
