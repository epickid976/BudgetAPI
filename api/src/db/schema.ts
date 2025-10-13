// Database-agnostic imports
import { sqliteTable, text as sqliteText, integer as sqliteInteger, real as sqliteReal, index as sqliteIndex, unique as sqliteUnique } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, integer as pgInteger, real as pgReal, index as pgIndex, timestamp as pgTimestamp, boolean as pgBoolean, unique as pgUnique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Determine which table builder to use
const isSQLite = process.env.DRIZZLE_DIALECT === "sqlite";

// Export the correct table builder
const table = isSQLite ? sqliteTable : pgTable;
const text = isSQLite ? sqliteText : pgText;
const integer = isSQLite ? sqliteInteger : pgInteger;
const real = isSQLite ? sqliteReal : pgReal;
const index = isSQLite ? sqliteIndex : pgIndex;
const unique = isSQLite ? sqliteUnique : pgUnique;

// Helper for timestamps - SQLite uses integer, PostgreSQL uses timestamp
const timestamp = (name: string) => 
  isSQLite 
    ? sqliteInteger(name, { mode: "timestamp" })
    : pgTimestamp(name, { mode: "date" });

// Helper for booleans - SQLite uses integer, PostgreSQL uses boolean
const boolean = (name: string) =>
  isSQLite
    ? sqliteInteger(name, { mode: "boolean" })
    : pgBoolean(name);

// Users
export const users = table("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name", { length: 100 }), // User's full name (optional)
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Accounts
export const accounts = table("accounts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade"}),
    name: text("name").notNull(),
    type: text("type").notNull(),      // "cash" | "checking" | "credit"
    currency: text("currency").notNull(), // "USD"
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
    userIdx: index("accounts_user_idx").on(t.userId)
}));

// Categories
export const categories = table("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name", { length: 100 }).notNull(),
  kind: text("kind", { length: 10 }).notNull(),      // "income" | "expense"
  icon: text("icon", { length: 10 }),                // Emoji icon (optional)
  color: text("color", { length: 7 }),               // Hex color like '#EF4444' (optional)
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  userIdx: index("categories_user_idx").on(t.userId),
  kindIdx: index("categories_kind_idx").on(t.userId, t.kind),
  // Unique constraint: prevent duplicate category names per user and kind
  uniqueUserNameKind: unique().on(t.userId, t.name, t.kind)
}));

// Transactions
export const transactions = table("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "set null" }).default(""),
  amountCents: integer("amount_cents").notNull(),
  note: text("note"),
  occurredAt: timestamp("occurred_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  byUserDate: index("tx_user_date_idx").on(t.userId, t.occurredAt),
  byUserCat:  index("tx_user_cat_idx").on(t.userId, t.categoryId)
}));

// Budgets
export const budgetMonths = table("budget_months", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1..12
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  uniq: index("budget_month_user_ym").on(t.userId, t.year, t.month)
}));

export const budgetItems = table("budget_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  budgetMonthId: text("budget_month_id").notNull().references(() => budgetMonths.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  plannedCents: integer("planned_cents").notNull()
}, (t) => ({
  uniq: index("budget_item_unique").on(t.budgetMonthId, t.categoryId)
}));

// (Optional) relations() if you want typed joins
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgetMonths),
}));

export const passwordResets = table("password_resets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Email Verification Tokens
export const emailVerificationTokens = table("email_verification_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Blacklisted Tokens (for logout/token revocation)
export const blacklistedTokens = table("blacklisted_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"), // "logout", "password_change", "admin_revoke", etc.
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  tokenIdx: index("blacklisted_tokens_token_idx").on(t.token),
  userIdx: index("blacklisted_tokens_user_idx").on(t.userId)
}));