// Prisma CLI configuration (Prisma 7). Used by `prisma generate` and
// `prisma migrate`, not by the running app (see src/db/index.ts).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need Neon's direct connection: they cannot run through the
    // pooler. The app itself connects through the pooled DATABASE_URL.
    url: env("DIRECT_URL"),
  },
});
