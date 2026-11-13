import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run in Node, with no database, Stripe, Kinde or Gemini: each test
// file replaces those modules with mocks (vi.mock), so the tests are fast and
// need no keys. The real services are exercised by hand in the browser.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
