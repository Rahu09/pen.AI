import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 no longer ships its own query engine binary for connecting:
// queries go through a "driver adapter", here node-postgres (`pg`). The
// adapter opens the connections; Prisma builds the SQL and maps the rows.
// DATABASE_URL is Neon's pooled connection string, which suits serverless
// functions that open many short-lived connections.
function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

// In development Next reloads modules on every change; caching the client on
// `global` keeps that from opening a new connection pool each time.
export const db =
  process.env.NODE_ENV === "production"
    ? createClient()
    : (global.cachedPrisma ??= createClient());
