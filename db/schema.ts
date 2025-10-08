import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
// For Postgres, import from "drizzle-orm/pg-core" and swap types accordingly.
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Users
export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp"}).notNull().default(sql`CURRENT_TIMESTAMP`)
})

// Accounts