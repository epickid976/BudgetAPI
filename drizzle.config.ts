import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables
config();

const DIALECTS = ["postgresql", "mysql", "sqlite", "turso", "singlestore", "gel"] as const;
type Dialect = typeof DIALECTS[number];

function toDialect(value: string | undefined): Dialect {
  return (DIALECTS as readonly string[]).includes(value ?? "") ? (value as Dialect) : "sqlite";
}

const dialect = toDialect(process.env.DRIZZLE_DIALECT);

export default defineConfig({
  schema: "./api/src/db/schema.ts",
  out: "./drizzle",
  dialect,
  dbCredentials:
    dialect === "sqlite"
      ? { url: process.env.DATABASE_URL || "./budget.db" }
      : { url: process.env.DATABASE_URL! },
});
