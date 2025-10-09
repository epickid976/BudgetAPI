// db.ts
import { env } from "./env.js";
import * as schema from "../db/schema.js";

// Import dialect-specific drizzle creators
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

// Runtimes
import Database from "better-sqlite3";
import { Pool } from "pg";

type DB =
  | ReturnType<typeof drizzleSqlite>
  | ReturnType<typeof drizzlePg>;

let db: DB;

if (env.DRIZZLE_DIALECT === "sqlite") {
  const sqlite = new Database(env.DATABASE_URL); // e.g., "sqlite.db"
  db = drizzleSqlite(sqlite, { schema });
} else {
  // Using a Pool means no explicit await client.connect()
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
}

export { db };