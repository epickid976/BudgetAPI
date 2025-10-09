import { defineConfig } from "drizzle-kit";

const DIALECTS = ["postgresql", "mysql", "sqlite", "turso", "singlestore", "gel"] as const;
type Dialect = typeof DIALECTS[number];

function toDialect(value: string | undefined): Dialect {
  return (DIALECTS as readonly string[]).includes(value ?? "") ? (value as Dialect) : "sqlite";
}

const dialect = toDialect(process.env.DRIZZLE_DIALECT);

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect,
  dbCredentials:
    dialect === "sqlite"
      ? { url: "sqlite.db" }
      : { url: process.env.DATABASE_URL! }, // ensure this is set in env for non-sqlite
});
