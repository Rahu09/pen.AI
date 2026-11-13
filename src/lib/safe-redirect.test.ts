import { describe, expect, it } from "vitest";
import { afterSignInPath } from "./safe-redirect";

describe("afterSignInPath", () => {
  it.each([
    ["dashboard", "/dashboard"],
    ["dashboard/billing", "/dashboard/billing"],
    ["dashboard/clx9a8b7c0000", "/dashboard/clx9a8b7c0000"],
  ])("follows the in-app path %s", (origin, expected) => {
    expect(afterSignInPath(origin)).toBe(expected);
  });

  it.each([
    // Each of these would leave the site if it were put after a "/".
    ["protocol-relative URL", "/evil.com"],
    ["double slash", "//evil.com"],
    ["full URL", "https://evil.com"],
    ["backslash", "\\evil.com"],
    ["parent directory", "../evil"],
    ["query string", "dashboard?next=//evil.com"],
    ["empty", ""],
  ])("refuses a %s and goes to the dashboard", (_label, origin) => {
    expect(afterSignInPath(origin)).toBe("/dashboard");
  });

  it("goes to the dashboard when there is no origin", () => {
    expect(afterSignInPath(null)).toBe("/dashboard");
    expect(afterSignInPath(undefined)).toBe("/dashboard");
  });
});
