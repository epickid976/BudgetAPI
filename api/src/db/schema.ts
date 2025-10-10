import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
// For Postgres, import from "drizzle-orm/pg-core" and swap types accordingly.
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false), // NEW
  createdAt: integer("created_at", { mode: "timestamp"}).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Accounts
export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade"}),
    name: text("name").notNull(),
    type: text("type").notNull(),      // "cash" | "checking" | "credit"
    currency: text("currency").notNull(), // "USD"
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
    userIdx: index("accounts_user_idx").on(t.userId)
}));

// Categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: text("kind").notNull(),      // "income" | "expense"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  userIdx: index("categories_user_idx").on(t.userId)
}));

// Transactions
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => accounts.id, { onDelete: "restrict" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "set null" }).default(""),
  amountCents: integer("amount_cents").notNull(),
  note: text("note"),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  byUserDate: index("tx_user_date_idx").on(t.userId, t.occurredAt),
  byUserCat:  index("tx_user_cat_idx").on(t.userId, t.categoryId)
}));

// Budgets
export const budgetMonths = sqliteTable("budget_months", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(), // 1..12
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  uniq: index("budget_month_user_ym").on(t.userId, t.year, t.month)
}));

export const budgetItems = sqliteTable("budget_items", {
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

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Email Verification Tokens
export const emailVerificationTokens = sqliteTable("email_verification_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Blacklisted Tokens (for logout/token revocation)
export const blacklistedTokens = sqliteTable("blacklisted_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"), // "logout", "password_change", "admin_revoke", etc.
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t) => ({
  tokenIdx: index("blacklisted_tokens_token_idx").on(t.token),
  userIdx: index("blacklisted_tokens_user_idx").on(t.userId)
}));