import nextVitals from "eslint-config-next/core-web-vitals";

// ESLint 9 flat config. Next 16 removed `next lint`; `pnpm lint` runs ESLint
// directly with Next's recommended rules.
const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "src/generated/**", "next-env.d.ts"],
  },
];

export default config;
